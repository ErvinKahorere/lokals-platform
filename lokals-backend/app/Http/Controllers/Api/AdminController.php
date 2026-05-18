<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\CommunityImpactTransaction;
use App\Models\CommunityProject;
use App\Models\CourierProfile;
use App\Models\DeliveryRequest;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\FeedPost;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\ModerationFlag;
use App\Models\Organization;
use App\Models\Product;
use App\Models\RideRequest;
use App\Models\RoleApplication;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Support\PilotLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;

class AdminController extends Controller
{
    public function summary(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'providers' => ServiceProvider::count(),
            'bookings' => Booking::count(),
            'listings' => Listing::count(),
            'events' => Event::count(),
        ]);
    }

    public function overview(): JsonResponse
    {
        $stats = $this->adminStats();
        $userMix = $this->userMix();
        $pendingApprovals = $this->pendingApprovals();
        $activeWorkloads = $this->activeWorkloads();
        $notificationVolume = $this->notificationVolume();
        $queueHealth = $this->queueHealthPayload();
        $realtimeHealth = $this->realtimeHealthPayload();

        return response()->json([
            'users' => $stats['total_users'],
            'active_users' => $stats['active_users'],
            'listings' => Listing::count(),
            'jobs' => JobPost::count(),
            'reports' => $stats['active_reports'],
            'bookings' => Booking::count(),
            'providers' => $stats['service_providers'],
            'active_alerts' => $stats['active_emergency_alerts'],
            'services_registered' => \App\Models\Service::count(),
            'products' => Product::count(),
            'events' => Event::count(),
            'event_tickets' => EventTicket::count(),
            'stats' => $stats,
            'user_mix' => $userMix,
            'pending_approvals' => $pendingApprovals,
            'active_workloads' => $activeWorkloads,
            'notification_volume' => $notificationVolume,
            'health_summary' => [
                [
                    'label' => 'Queue pending jobs',
                    'status' => (($queueHealth['jobs']['pending_count'] ?? 0) > 0) ? 'monitor' : 'healthy',
                    'value' => (string) ($queueHealth['jobs']['pending_count'] ?? 0),
                    'detail' => 'Pending jobs waiting in the default queue.',
                ],
                [
                    'label' => 'Failed jobs',
                    'status' => (($queueHealth['failed_jobs']['count'] ?? 0) > 0) ? 'warning' : 'healthy',
                    'value' => (string) ($queueHealth['failed_jobs']['count'] ?? 0),
                    'detail' => 'Recent failed background jobs.',
                ],
                [
                    'label' => 'Realtime driver',
                    'status' => ($realtimeHealth['configured'] ?? false) ? 'healthy' : 'degraded',
                    'value' => (string) ($realtimeHealth['broadcast_driver'] ?? 'unknown'),
                    'detail' => 'Broadcast transport currently configured for live updates.',
                ],
                [
                    'label' => 'Location lock',
                    'status' => PilotLocation::isLocked() ? 'locked' : 'open',
                    'value' => PilotLocation::town(),
                    'detail' => 'Pilot town access and area scope.',
                ],
            ],
            'queue_health' => $queueHealth,
            'realtime_health' => $realtimeHealth,
            'town_activity_overview' => $this->townActivityOverview(),
            'recent_admin_activity' => $this->recentAdminActivity(),
        ]);
    }

    public function municipalityDashboard(): JsonResponse
    {
        $town = PilotLocation::town();
        $reportsByStatus = CityReport::query()
            ->where('town', $town)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $areas = collect(PilotLocation::allowedAreas())
            ->map(fn (string $area) => [
                'area' => $area,
                'users' => User::query()->where('default_town', $town)->where('default_area', $area)->count(),
                'reports' => CityReport::query()->where('town', $town)->where('area', $area)->count(),
                'businesses' => Organization::query()->where('town', $town)->where('area', $area)->count(),
            ])
            ->filter(fn (array $row) => $row['users'] > 0 || $row['reports'] > 0 || $row['businesses'] > 0)
            ->values();

        return response()->json([
            'stats' => [
                'total_users' => User::query()->where('default_town', $town)->count(),
                'active_users' => User::query()->where('status', 'active')->count(),
                'reports_count' => CityReport::query()->where('town', $town)->count(),
                'alerts_sent' => Alert::query()->where('town', $town)->count(),
                'services_registered' => ServiceProvider::query()->where('town', $town)->count(),
                'directory_entries' => Organization::query()->where('town', $town)->count(),
                'municipal_events' => Event::query()->where('town', $town)->where('category', 'municipal')->count(),
            ],
            'reports_by_status' => $reportsByStatus,
            'most_active_areas' => $areas,
            'most_requested_services' => ServiceProvider::query()
                ->where('town', $town)
                ->select('category', DB::raw('count(*) as total'))
                ->groupBy('category')
                ->orderByDesc('total')
                ->limit(5)
                ->get(),
            'trending_issues' => CityReport::query()
                ->where('town', $town)
                ->select('category', DB::raw('count(*) as total'))
                ->groupBy('category')
                ->orderByDesc('total')
                ->limit(5)
                ->get(),
            'recent_reports' => CityReport::query()->where('town', $town)->latest()->limit(6)->get(['id', 'title', 'category', 'location', 'status', 'created_at']),
            'recent_alerts' => Alert::query()->where('town', $town)->latest()->limit(4)->get(['id', 'title', 'location', 'priority', 'created_at']),
            'upcoming_events' => Event::query()->where('town', $town)->where('status', 'published')->where('starts_at', '>=', now())->orderBy('starts_at')->limit(6)->get(['id', 'title', 'category', 'town', 'area', 'starts_at']),
        ]);
    }

    public function systemHealth(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator']), 403);

        $queueHealth = $this->queueHealthPayload();
        $realtimeHealth = $this->realtimeHealthPayload();
        $notificationVolume = $this->notificationVolume();

        return response()->json([
            'summary' => [
                'queue_driver' => $queueHealth['queue_driver'] ?? 'unknown',
                'broadcast_driver' => $realtimeHealth['broadcast_driver'] ?? 'unknown',
                'pending_jobs' => $queueHealth['jobs']['pending_count'] ?? 0,
                'failed_jobs' => $queueHealth['failed_jobs']['count'] ?? 0,
                'recent_notifications' => $notificationVolume['sent_last_24_hours'] ?? 0,
            ],
            'queue' => $queueHealth,
            'realtime' => $realtimeHealth,
            'notifications' => $notificationVolume,
            'system_health' => [
                [
                    'label' => 'Queue backlog',
                    'status' => (($queueHealth['jobs']['pending_count'] ?? 0) > 25) ? 'warning' : 'healthy',
                    'detail' => 'Pending jobs waiting in the queue.',
                ],
                [
                    'label' => 'Failed jobs',
                    'status' => (($queueHealth['failed_jobs']['count'] ?? 0) > 0) ? 'warning' : 'healthy',
                    'detail' => 'Background jobs needing operator attention.',
                ],
                [
                    'label' => 'Realtime transport',
                    'status' => ($realtimeHealth['configured'] ?? false) ? 'healthy' : 'degraded',
                    'detail' => 'Broadcast stack readiness for live updates.',
                ],
            ],
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator']), 403);

        return response()->json([
            'data' => $this->recentAdminActivity(18),
        ]);
    }

    public function featureFlags(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator']), 403);

        return response()->json([
            'data' => [
                [
                    'key' => 'pilot_location_lock',
                    'label' => 'Pilot location lock',
                    'enabled' => PilotLocation::isLocked(),
                    'scope' => PilotLocation::town(),
                    'status' => PilotLocation::isLocked() ? 'locked' : 'open',
                    'editable' => false,
                    'description' => 'Locks town selection to the current pilot municipality.',
                ],
                [
                    'key' => 'open_maps_transport',
                    'label' => 'Open map transport flows',
                    'enabled' => true,
                    'scope' => 'web,mobile',
                    'status' => 'live',
                    'editable' => false,
                    'description' => 'Ride, delivery, and issue flows use open map tooling.',
                ],
                [
                    'key' => 'community_impact_reviews',
                    'label' => 'Community impact review queue',
                    'enabled' => true,
                    'scope' => 'town_manager,admin',
                    'status' => 'live',
                    'editable' => false,
                    'description' => 'Allows reward verification and community impact approval workflows.',
                ],
                [
                    'key' => 'realtime_operational_dashboards',
                    'label' => 'Realtime operational dashboards',
                    'enabled' => true,
                    'scope' => 'admin,town_manager',
                    'status' => 'live',
                    'editable' => false,
                    'description' => 'Realtime and queue health widgets are enabled for operational roles.',
                ],
            ],
        ]);
    }

    public function towns(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator']), 403);

        return response()->json([
            'data' => $this->townActivityOverview(),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator']), 403);

        $users = User::query()
            ->with('roles:name')
            ->when($request->filled('role'), fn ($query) => $query->where('current_role', $request->string('role')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('town'), fn ($query) => $query->where('default_town', $request->string('town')))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $needle = '%'.$request->string('search')->trim().'%';
                $query->where(function ($builder) use ($needle): void {
                    $builder->where('name', 'like', $needle)
                        ->orWhere('email', 'like', $needle)
                        ->orWhere('phone', 'like', $needle);
                });
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'summary' => [
                'total_users' => User::count(),
                'active_users' => User::query()->where('status', 'active')->count(),
                'residents' => $this->residentCount(),
                'service_providers' => $this->roleCount('service_provider'),
                'drivers' => $this->roleCount('driver'),
                'couriers' => $this->roleCount('courier'),
                'town_managers' => $this->roleCount('town_manager') + $this->roleCount('municipality_admin'),
            ],
            'data' => $users->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status ?? 'active',
                'current_role' => $user->current_role ?? 'citizen',
                'roles' => $user->roles->pluck('name')->values(),
                'default_town' => $user->default_town,
                'default_area' => $user->default_area,
                'created_at' => optional($user->created_at)->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    private function adminStats(): array
    {
        return [
            'total_users' => User::count(),
            'residents' => $this->residentCount(),
            'businesses' => Organization::query()->whereNotNull('owner_user_id')->count(),
            'service_providers' => ServiceProvider::count(),
            'drivers' => $this->roleCount('driver'),
            'couriers' => $this->roleCount('courier'),
            'organizations' => Organization::count(),
            'town_managers' => $this->roleCount('town_manager') + $this->roleCount('municipality_admin'),
            'pending_role_applications' => RoleApplication::query()->whereIn('status', ['submitted', 'pending_review'])->count(),
            'pending_community_projects' => CommunityProject::query()->where('verification_status', 'pending')->count(),
            'pending_feed_posts' => FeedPost::query()->where('status', 'pending')->count(),
            'pending_reward_approvals' => CommunityImpactTransaction::query()->where('verification_status', 'pending')->count(),
            'active_reports' => CityReport::query()->whereIn('status', ['submitted', 'received', 'in_review', 'assigned', 'in_progress'])->count(),
            'active_rides' => RideRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'arrived', 'in_progress'])->count(),
            'active_deliveries' => DeliveryRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit'])->count(),
            'notification_volume' => $this->notificationCount(),
            'active_emergency_alerts' => Alert::query()->where('is_active', true)->where('type', 'emergency_alert')->count(),
            'active_users' => User::query()->where('status', 'active')->count(),
        ];
    }

    private function userMix(): array
    {
        return [
            'residents' => $this->residentCount(),
            'business_owners' => $this->roleCount('business_owner') + $this->roleCount('seller'),
            'service_providers' => $this->roleCount('service_provider'),
            'drivers' => $this->roleCount('driver'),
            'couriers' => $this->roleCount('courier'),
            'town_managers' => $this->roleCount('town_manager') + $this->roleCount('municipality_admin'),
            'operators' => $this->roleCount('operator'),
        ];
    }

    private function pendingApprovals(): array
    {
        return [
            'role_applications' => RoleApplication::query()->whereIn('status', ['submitted', 'pending_review'])->count(),
            'community_projects' => CommunityProject::query()->where('verification_status', 'pending')->count(),
            'feed_posts' => FeedPost::query()->where('status', 'pending')->count(),
            'reward_verifications' => CommunityImpactTransaction::query()->where('verification_status', 'pending')->count(),
        ];
    }

    private function activeWorkloads(): array
    {
        return [
            'reports' => CityReport::query()->whereIn('status', ['submitted', 'received', 'in_review', 'assigned', 'in_progress'])->count(),
            'rides' => RideRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'arrived', 'in_progress'])->count(),
            'deliveries' => DeliveryRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit'])->count(),
            'moderation_flags' => ModerationFlag::query()->where('status', 'open')->count(),
            'alerts_live' => Alert::query()->where('is_active', true)->count(),
        ];
    }

    private function notificationVolume(): array
    {
        $total = $this->notificationCount();

        return [
            'total_notifications' => $total,
            'sent_last_24_hours' => $this->notificationCount(now()->subDay()),
            'unread_notifications' => $this->unreadNotificationCount(),
        ];
    }

    private function townActivityOverview(): array
    {
        $town = PilotLocation::town();
        $areas = PilotLocation::allowedAreas();

        return [[
            'town' => $town,
            'areas' => count($areas),
            'users' => User::query()->where('default_town', $town)->count(),
            'businesses' => Organization::query()->where('town', $town)->count(),
            'providers' => ServiceProvider::query()->where('town', $town)->count(),
            'open_reports' => CityReport::query()->where('town', $town)->whereIn('status', ['submitted', 'received', 'in_review', 'assigned', 'in_progress'])->count(),
            'active_alerts' => Alert::query()->where('town', $town)->where('is_active', true)->count(),
            'active_rides' => RideRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'arrived', 'in_progress'])->count(),
            'active_deliveries' => DeliveryRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit'])->count(),
        ]];
    }

    private function recentAdminActivity(int $limit = 10): array
    {
        return collect([
            RoleApplication::query()->latest('updated_at')->limit(4)->get()->map(fn (RoleApplication $application) => [
                'type' => 'role_application',
                'title' => $application->full_name.' applied for '.str_replace('_', ' ', $application->requested_role),
                'body' => $application->status,
                'timestamp' => optional($application->updated_at)->toIso8601String(),
            ]),
            CommunityProject::query()->latest('updated_at')->limit(3)->get()->map(fn (CommunityProject $project) => [
                'type' => 'community_project',
                'title' => $project->title,
                'body' => $project->verification_status ?? $project->status,
                'timestamp' => optional($project->updated_at)->toIso8601String(),
            ]),
            FeedPost::query()->latest('updated_at')->limit(3)->get()->map(fn (FeedPost $post) => [
                'type' => 'feed_post',
                'title' => $post->title,
                'body' => $post->status,
                'timestamp' => optional($post->updated_at)->toIso8601String(),
            ]),
            CommunityImpactTransaction::query()->latest('updated_at')->limit(3)->get()->map(fn (CommunityImpactTransaction $transaction) => [
                'type' => 'reward_review',
                'title' => $transaction->reason,
                'body' => $transaction->verification_status,
                'timestamp' => optional($transaction->updated_at)->toIso8601String(),
            ]),
            Alert::query()->latest('updated_at')->limit(3)->get()->map(fn (Alert $alert) => [
                'type' => 'alert',
                'title' => $alert->title,
                'body' => $alert->priority ?? 'published',
                'timestamp' => optional($alert->updated_at)->toIso8601String(),
            ]),
        ])
            ->flatten(1)
            ->filter()
            ->sortByDesc('timestamp')
            ->values()
            ->take($limit)
            ->all();
    }

    private function queueHealthPayload(): array
    {
        return [
            'queue_driver' => (string) config('queue.default'),
            'broadcast_driver' => (string) config('broadcasting.default'),
            'redis' => [
                'configured' => filled(config('database.redis.default.host')),
                'host_present' => filled(config('database.redis.default.host')),
                'port_present' => filled(config('database.redis.default.port')),
            ],
            'jobs' => [
                'table_present' => Schema::hasTable('jobs'),
                'pending_count' => $this->queueSize(),
            ],
            'failed_jobs' => [
                'table_present' => Schema::hasTable('failed_jobs'),
                'count' => $this->failedJobsCount(),
            ],
            'workers' => [
                'recommended_command' => 'php artisan queue:work --sleep=3 --tries=3 --timeout=120 --max-jobs=500',
            ],
            'timestamp' => now()->toAtomString(),
        ];
    }

    private function realtimeHealthPayload(): array
    {
        $broadcastConnection = (string) config('broadcasting.default');
        $queueConnection = (string) config('queue.default');
        $configured = (
            filled(config('broadcasting.connections.reverb.key')) && filled(config('broadcasting.connections.reverb.app_id'))
        ) || (
            filled(config('broadcasting.connections.pusher.key')) && filled(config('broadcasting.connections.pusher.app_id'))
        );

        return [
            'broadcast_driver' => $broadcastConnection,
            'queue_driver' => $queueConnection,
            'configured' => $configured,
            'reverb' => [
                'configured' => filled(config('broadcasting.connections.reverb.key'))
                    && filled(config('broadcasting.connections.reverb.app_id')),
                'host_present' => filled(config('broadcasting.connections.reverb.options.host')),
                'port_present' => filled(config('broadcasting.connections.reverb.options.port')),
                'scheme_present' => filled(config('broadcasting.connections.reverb.options.scheme')),
            ],
            'pusher' => [
                'configured' => filled(config('broadcasting.connections.pusher.key'))
                    && filled(config('broadcasting.connections.pusher.app_id')),
                'host_present' => filled(config('broadcasting.connections.pusher.options.host')),
                'port_present' => filled(config('broadcasting.connections.pusher.options.port')),
                'scheme_present' => filled(config('broadcasting.connections.pusher.options.scheme')),
            ],
            'queue' => [
                'size_available' => $this->queueSize() !== null,
                'size' => $this->queueSize(),
            ],
            'channels' => [
                'user' => 'users.{userId}',
                'town_managers' => 'towns.{townId}.managers',
                'platform_admins' => 'platform.admins',
            ],
            'timestamp' => now()->toAtomString(),
        ];
    }

    private function roleCount(string $role): int
    {
        return User::role($role)->count();
    }

    private function residentCount(): int
    {
        return User::query()
            ->where(function ($query): void {
                $query->whereNull('current_role')
                    ->orWhere('current_role', 'citizen');
            })
            ->count();
    }

    private function notificationCount($since = null): int
    {
        if (! Schema::hasTable('notifications')) {
            return 0;
        }

        $query = DB::table('notifications');
        if ($since !== null) {
            $query->where('created_at', '>=', $since);
        }

        return (int) $query->count();
    }

    private function unreadNotificationCount(): int
    {
        if (! Schema::hasTable('notifications')) {
            return 0;
        }

        return (int) DB::table('notifications')->whereNull('read_at')->count();
    }

    private function queueSize(): ?int
    {
        try {
            $size = Queue::size();

            return is_numeric($size) ? (int) $size : null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function failedJobsCount(): ?int
    {
        try {
            if (! Schema::hasTable('failed_jobs')) {
                return null;
            }

            return (int) DB::table('failed_jobs')->count();
        } catch (\Throwable) {
            return null;
        }
    }
}
