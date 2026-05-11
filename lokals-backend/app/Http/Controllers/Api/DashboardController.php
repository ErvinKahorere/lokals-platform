<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Alert;
use App\Models\Announcement;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\Event;
use App\Models\EventSave;
use App\Models\EventTicket;
use App\Models\Follow;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\ModerationFlag;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Support\PilotLocation;
use App\Models\WorkerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $role = $request->user()->current_role ?: $request->user()->getRoleNames()->first() ?: 'citizen';

        return response()->json([
            'role' => $role,
            'dashboard_endpoint' => match ($role) {
                'worker' => '/dashboard/worker',
                'seller' => '/dashboard/seller',
                'business_owner' => '/dashboard/business',
                'service_provider' => '/dashboard/service-provider',
                'organization_admin' => '/dashboard/organization',
                'municipality_admin', 'town_manager' => '/dashboard/town-manager',
                'super_admin', 'operator' => '/dashboard/admin',
                default => '/dashboard/citizen',
            },
        ]);
    }

    public function citizen(Request $request): JsonResponse
    {
        $user = $request->user();
        $followedIds = Follow::query()->where('user_id', $user->id)->latest()->limit(4)->pluck('followable_id');

        return response()->json([
            'role' => 'citizen',
            'stats' => [
                'bookings' => Booking::query()->where('user_id', $user->id)->count(),
                'saved_items' => EventSave::query()->where('user_id', $user->id)->count() + Follow::query()->where('user_id', $user->id)->count(),
                'followed_sources' => Follow::query()->where('user_id', $user->id)->count(),
                'tickets' => EventTicket::query()->where('user_id', $user->id)->count(),
                'reports' => CityReport::query()->where('user_id', $user->id)->count(),
            ],
            'quick_actions' => [
                ['label' => 'Book Service', 'href' => '/services', 'icon' => 'calendar'],
                ['label' => 'Report Issue', 'href' => '/report-issue', 'icon' => 'alert-circle'],
                ['label' => 'Send Parcel', 'href' => '/delivery', 'icon' => 'package'],
                ['label' => 'View Alerts', 'href' => '/alerts', 'icon' => 'bell'],
            ],
            'pending_tasks' => [
                ['label' => 'Upcoming bookings', 'count' => Booking::query()->where('user_id', $user->id)->whereIn('status', ['pending', 'confirmed'])->count()],
                ['label' => 'Open reports', 'count' => CityReport::query()->where('user_id', $user->id)->whereNotIn('status', ['resolved', 'closed'])->count()],
            ],
            'upcoming_bookings' => Booking::query()
                ->where('user_id', $user->id)
                ->with(['serviceProvider:id,name,phone', 'service:id,name'])
                ->latest('booking_date')
                ->limit(4)
                ->get(),
            'saved_items' => Event::query()
                ->whereIn('id', EventSave::query()->where('user_id', $user->id)->pluck('event_id'))
                ->orderByDesc('starts_at')
                ->limit(4)
                ->get(['id', 'title', 'category', 'town', 'area', 'starts_at', 'status']),
            'followed_entities' => Organization::query()
                ->whereIn('id', $followedIds)
                ->limit(4)
                ->get(['id', 'name', 'category', 'town', 'area', 'logo_url', 'status', 'is_verified']),
            'recent_alerts' => Alert::query()->latest()->limit(4)->get(['id', 'title', 'body', 'priority', 'location', 'published_at']),
            'my_reports' => CityReport::query()->where('user_id', $user->id)->latest()->limit(4)->get(['id', 'title', 'category', 'location', 'status', 'priority', 'created_at']),
            'my_tickets' => EventTicket::query()->where('user_id', $user->id)->with(['event:id,title,starts_at,location'])->latest()->limit(4)->get(),
            'recent_activity' => $this->mergeActivity([
                Booking::query()->where('user_id', $user->id)->latest()->limit(3)->get()->map(fn (Booking $booking) => [
                    'type' => 'booking',
                    'title' => $booking->service?->name ?? 'Booking update',
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
                EventTicket::query()->where('user_id', $user->id)->latest()->limit(2)->get()->map(fn (EventTicket $ticket) => [
                    'type' => 'ticket',
                    'title' => 'Ticket '.$ticket->ticket_code,
                    'body' => $ticket->status,
                    'timestamp' => optional($ticket->updated_at)->toIso8601String(),
                ]),
                CityReport::query()->where('user_id', $user->id)->latest()->limit(2)->get()->map(fn (CityReport $report) => [
                    'type' => 'report',
                    'title' => $report->title,
                    'body' => $report->status,
                    'timestamp' => optional($report->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function worker(Request $request): JsonResponse
    {
        $user = $request->user();
        $worker = WorkerProfile::query()->where('user_id', $user->id)->first();

        return response()->json([
            'role' => 'worker',
            'stats' => [
                'profile_completion' => $worker ? 85 : 35,
                'jobs_near_me' => JobPost::query()->where('status', 'open')->count(),
                'applications' => JobApplication::query()->where('user_id', $user->id)->count(),
                'availability' => $worker?->is_available ? 1 : 0,
            ],
            'quick_actions' => [
                ['label' => 'View Jobs', 'href' => '/jobs', 'icon' => 'briefcase'],
                ['label' => 'Edit Worker Profile', 'href' => '/workers', 'icon' => 'user'],
                ['label' => 'Update Availability', 'href' => '/dashboard/worker', 'icon' => 'clock'],
            ],
            'pending_tasks' => [
                ['label' => 'Profile setup', 'count' => $worker ? 0 : 1],
                ['label' => 'Open applications', 'count' => JobApplication::query()->where('user_id', $user->id)->where('status', 'pending')->count()],
            ],
            'worker_profile' => $worker,
            'jobs_near_me' => JobPost::query()->where('status', 'open')->latest()->limit(5)->get(['id', 'title', 'location', 'compensation', 'status', 'created_at']),
            'applications' => JobApplication::query()->where('user_id', $user->id)->with('job:id,title,location,status,compensation')->latest()->limit(5)->get(),
            'completed_jobs_placeholder' => [
                'count' => JobApplication::query()->where('user_id', $user->id)->where('status', 'accepted')->count(),
                'label' => 'Completed jobs history can expand here later.',
            ],
            'recent_activity' => $this->mergeActivity([
                JobApplication::query()->where('user_id', $user->id)->latest()->limit(4)->get()->map(fn (JobApplication $application) => [
                    'type' => 'application',
                    'title' => $application->job?->title ?? 'Job application',
                    'body' => $application->status,
                    'timestamp' => optional($application->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function business(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['seller', 'business_owner', 'super_admin']), 403);

        $businesses = Organization::query()->where('owner_user_id', $user->id)->withCount('followers')->get();
        $businessIds = $businesses->pluck('id');
        $providerIds = ServiceProvider::query()
            ->whereIn('organization_id', $businessIds)
            ->pluck('id');
        $recentPromotions = Announcement::query()
            ->whereIn('organization_id', $businessIds)
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'body', 'location', 'published_at']);
        $recentProducts = Product::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'price', 'sale_price', 'category', 'town', 'area', 'created_at']);
        $recentServices = Service::query()
            ->whereIn('organization_id', $businessIds)
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'price', 'price_type', 'duration_minutes', 'is_active']);
        $recentBookings = Booking::query()
            ->whereIn('service_provider_id', $providerIds)
            ->with(['user:id,name,phone', 'service:id,name'])
            ->latest()
            ->limit(5)
            ->get();
        $businessRole = $user->current_role === 'seller' ? 'seller' : 'business';
        $businessDashboardHref = $businessRole === 'seller' ? '/dashboard/seller' : '/dashboard/business';

        return response()->json([
            'role' => $businessRole,
            'stats' => [
                'products' => Product::query()->where('user_id', $user->id)->count(),
                'services' => Service::query()->whereIn('organization_id', $businessIds)->count(),
                'bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->count(),
                'followers' => $businesses->sum('followers_count'),
                'alerts_promotions' => Announcement::query()->whereIn('organization_id', $businessIds)->count(),
                'enquiries' => Product::query()->where('user_id', $user->id)->count() * 2,
            ],
            'quick_actions' => [
                ['label' => 'Add Product', 'href' => '/store', 'icon' => 'package'],
                ['label' => 'Add Service', 'href' => '/services', 'icon' => 'hammer'],
                ['label' => 'Post Promotion', 'href' => $businessDashboardHref, 'icon' => 'megaphone'],
                ['label' => 'View Store', 'href' => '/store', 'icon' => 'store'],
            ],
            'pending_tasks' => [
                ['label' => 'Products without recent activity', 'count' => max(0, 3 - Product::query()->where('user_id', $user->id)->count())],
                ['label' => 'Promotions to refresh', 'count' => Announcement::query()->whereIn('organization_id', $businessIds)->whereDate('published_at', '<', now()->subDays(14))->count()],
            ],
            'businesses' => $businesses,
            'sale_alerts' => $recentPromotions,
            'alerts' => $recentPromotions,
            'recent_products' => $recentProducts,
            'products' => $recentProducts,
            'recent_services' => $recentServices,
            'recent_bookings' => $recentBookings,
            'recent_activity' => $this->mergeActivity([
                Product::query()->where('user_id', $user->id)->latest()->limit(3)->get()->map(fn (Product $product) => [
                    'type' => 'product',
                    'title' => $product->title,
                    'body' => 'Product updated',
                    'timestamp' => optional($product->updated_at)->toIso8601String(),
                ]),
                Announcement::query()->whereIn('organization_id', $businessIds)->latest()->limit(2)->get()->map(fn (Announcement $alert) => [
                    'type' => 'promotion',
                    'title' => $alert->title,
                    'body' => Str::limit($alert->body, 72),
                    'timestamp' => optional($alert->published_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function serviceProvider(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['service_provider', 'super_admin']), 403);

        $providers = ServiceProvider::query()
            ->where('user_id', $user->id)
            ->orWhereIn('organization_id', Organization::query()->where('owner_user_id', $user->id)->pluck('id'))
            ->withCount('followers')
            ->get();
        $providerIds = $providers->pluck('id');

        return response()->json([
            'role' => 'service_provider',
            'stats' => [
                'bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->count(),
                'services' => Service::query()->whereIn('service_provider_id', $providerIds)->count(),
                'availability_slots' => \App\Models\AvailabilitySlot::query()->whereIn('service_provider_id', $providerIds)->count(),
                'followers' => $providers->sum('followers_count'),
                'rates' => Service::query()->whereIn('service_provider_id', $providerIds)->count(),
                'recent_enquiries' => Booking::query()->whereIn('service_provider_id', $providerIds)->where('status', 'pending')->count(),
            ],
            'quick_actions' => [
                ['label' => 'Add Service', 'href' => '/services', 'icon' => 'plus-circle'],
                ['label' => 'Manage Availability', 'href' => '/provider-bookings', 'icon' => 'calendar'],
                ['label' => 'View Bookings', 'href' => '/provider-bookings', 'icon' => 'book-open'],
                ['label' => 'Post Alert', 'href' => '/dashboard/service-provider', 'icon' => 'bell'],
            ],
            'pending_tasks' => [
                ['label' => 'Pending bookings', 'count' => Booking::query()->whereIn('service_provider_id', $providerIds)->where('status', 'pending')->count()],
                ['label' => 'Services missing availability', 'count' => max(0, Service::query()->whereIn('service_provider_id', $providerIds)->count() - \App\Models\AvailabilitySlot::query()->whereIn('service_provider_id', $providerIds)->distinct('service_provider_id')->count('service_provider_id'))],
            ],
            'providers' => $providers,
            'recent_bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->with(['user:id,name,phone', 'service:id,name'])->latest()->limit(5)->get(),
            'services_offered' => Service::query()->whereIn('service_provider_id', $providerIds)->latest()->limit(5)->get(['id', 'name', 'price', 'price_type', 'duration_minutes', 'is_active']),
            'recent_activity' => $this->mergeActivity([
                Booking::query()->whereIn('service_provider_id', $providerIds)->latest()->limit(4)->get()->map(fn (Booking $booking) => [
                    'type' => 'booking',
                    'title' => $booking->service?->name ?? 'Booking update',
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function organization(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['organization_admin', 'super_admin']), 403);

        $organizations = Organization::query()
            ->where('owner_user_id', $user->id)
            ->withCount('followers')
            ->get();
        $organizationIds = $organizations->pluck('id');
        $eventIds = Event::query()
            ->where('created_by', $user->id)
            ->orWhere(function ($query) use ($organizationIds): void {
                $query->where('organizer_type', Organization::class)
                    ->whereIn('organizer_id', $organizationIds);
            })
            ->pluck('id');

        return response()->json([
            'role' => 'organization',
            'stats' => [
                'followers' => $organizations->sum('followers_count'),
                'alerts_published' => Announcement::query()->whereIn('organization_id', $organizationIds)->count(),
                'events' => $eventIds->count(),
                'updates' => Announcement::query()->whereIn('organization_id', $organizationIds)->count() + $eventIds->count(),
            ],
            'quick_actions' => [
                ['label' => 'Publish Alert', 'href' => '/dashboard/organization', 'icon' => 'bell'],
                ['label' => 'Add Event', 'href' => '/dashboard/events/create', 'icon' => 'calendar-plus'],
                ['label' => 'Update Directory Profile', 'href' => '/directory', 'icon' => 'building'],
                ['label' => 'View Followers', 'href' => '/dashboard/organization', 'icon' => 'users'],
            ],
            'pending_tasks' => [
                ['label' => 'Profiles to complete', 'count' => $organizations->filter(fn (Organization $organization) => empty($organization->phone) || empty($organization->description))->count()],
                ['label' => 'Upcoming events needing promotion', 'count' => Event::query()->whereIn('id', $eventIds)->where('starts_at', '>=', now())->count()],
            ],
            'organizations' => $organizations,
            'public_updates' => Announcement::query()->whereIn('organization_id', $organizationIds)->latest('published_at')->limit(5)->get(['id', 'title', 'body', 'location', 'published_at']),
            'events' => Event::query()->whereIn('id', $eventIds)->orderBy('starts_at')->limit(5)->get(['id', 'title', 'category', 'town', 'area', 'starts_at', 'status']),
            'profile_status' => [
                'complete' => $organizations->filter(fn (Organization $organization) => filled($organization->phone) && filled($organization->description))->count(),
                'needs_attention' => $organizations->filter(fn (Organization $organization) => blank($organization->phone) || blank($organization->description))->count(),
            ],
            'news_source_status' => [
                'connected' => Announcement::query()->whereIn('organization_id', $organizationIds)->exists() ? 1 : 0,
                'pending' => Announcement::query()->whereIn('organization_id', $organizationIds)->exists() ? 0 : 1,
            ],
            'recent_activity' => $this->mergeActivity([
                Announcement::query()->whereIn('organization_id', $organizationIds)->latest()->limit(3)->get()->map(fn (Announcement $alert) => [
                    'type' => 'alert',
                    'title' => $alert->title,
                    'body' => Str::limit($alert->body, 72),
                    'timestamp' => optional($alert->published_at)->toIso8601String(),
                ]),
                Event::query()->whereIn('id', $eventIds)->latest()->limit(2)->get()->map(fn (Event $event) => [
                    'type' => 'event',
                    'title' => $event->title,
                    'body' => $event->category,
                    'timestamp' => optional($event->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function municipality(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['town_manager', 'municipality_admin', 'super_admin']), 403);

        $reportQuery = CityReport::query()
            ->when(! $user->hasRole('super_admin'), function ($query) use ($user): void {
                $query->where('town', PilotLocation::profileTown($user->default_town))
                    ->when(PilotLocation::normalizeArea($user->default_area), fn ($builder, $area) => $builder->where(function ($areaQuery) use ($area): void {
                        $areaQuery->where('area', $area)
                            ->orWhereNull('area');
                    }));
            });
        $alertQuery = Alert::query()
            ->where('is_active', true)
            ->whereIn('type', ['municipal_alert', 'public_notice', 'service_update', 'emergency_alert'])
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $publicServicesQuery = Organization::query()
            ->where('is_public_service', true)
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $eventQuery = Event::query()
            ->where('category', 'municipal')
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));

        $reportsByStatus = (clone $reportQuery)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'role' => 'town_manager',
            'stats' => [
                'total_reports' => (clone $reportQuery)->count(),
                'open_reports' => (clone $reportQuery)->whereIn('status', ['open', 'submitted'])->count(),
                'in_progress_reports' => (clone $reportQuery)->whereIn('status', ['in_progress', 'in_review'])->count(),
                'resolved_reports' => (clone $reportQuery)->where('status', 'resolved')->count(),
                'urgent_reports' => (clone $reportQuery)->where('priority', 'high')->whereNotIn('status', ['resolved', 'rejected'])->count(),
                'municipal_alerts_sent' => (clone $alertQuery)->count(),
                'public_service_entries' => (clone $publicServicesQuery)->count(),
                'registered_businesses' => Organization::query()
                    ->where('town', PilotLocation::profileTown($user->default_town))
                    ->where('is_public_service', false)
                    ->count(),
            ],
            'quick_actions' => [
                ['label' => 'Send Announcement', 'href' => '/dashboard/town-manager', 'icon' => 'megaphone'],
                ['label' => 'Send Emergency Alert', 'href' => '/dashboard/town-manager', 'icon' => 'siren'],
                ['label' => 'View Reports', 'href' => '/my-reports', 'icon' => 'clipboard-list'],
                ['label' => 'Add Public Service', 'href' => '/directory', 'icon' => 'building'],
                ['label' => 'Create Event', 'href' => '/dashboard/events/create', 'icon' => 'calendar-plus'],
            ],
            'pending_tasks' => [
                ['label' => 'Urgent reports', 'count' => (clone $reportQuery)->where('priority', 'high')->whereNotIn('status', ['resolved', 'rejected'])->count()],
                ['label' => 'Open reports', 'count' => (clone $reportQuery)->whereNotIn('status', ['resolved', 'rejected'])->count()],
            ],
            'reports_by_status' => $reportsByStatus,
            'recent_reports' => (clone $reportQuery)->latest()->limit(6)->get(['id', 'title', 'category', 'location', 'town', 'area', 'status', 'priority', 'created_at']),
            'active_alerts' => (clone $alertQuery)->latest()->limit(5)->get(['id', 'title', 'body', 'type', 'priority', 'location', 'town', 'area', 'created_at']),
            'upcoming_events' => (clone $eventQuery)->where('status', 'published')->where('starts_at', '>=', now())->orderBy('starts_at')->limit(5)->get(['id', 'title', 'category', 'town', 'area', 'starts_at']),
            'recent_activity' => $this->mergeActivity([
                (clone $reportQuery)->latest()->limit(4)->get()->map(fn (CityReport $report) => [
                    'type' => 'report',
                    'title' => $report->title,
                    'body' => $report->status,
                    'timestamp' => optional($report->updated_at)->toIso8601String(),
                ]),
                (clone $alertQuery)->latest()->limit(2)->get()->map(fn (Alert $alert) => [
                    'type' => 'alert',
                    'title' => $alert->title,
                    'body' => $alert->priority,
                    'timestamp' => optional($alert->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function admin(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['super_admin', 'operator']), 403);

        return response()->json([
            'role' => 'admin',
            'stats' => [
                'users' => User::count(),
                'roles' => \Spatie\Permission\Models\Role::count(),
                'organizations' => Organization::count(),
                'businesses' => Organization::query()->whereNotNull('owner_user_id')->count(),
                'providers' => ServiceProvider::count(),
                'reports' => CityReport::count(),
                'alerts' => Alert::count(),
                'events' => Event::count(),
                'products' => Product::count(),
                'accommodations' => Accommodation::count(),
                'flagged_content' => ModerationFlag::count(),
            ],
            'system_overview' => [
                'total_listings' => Listing::count(),
                'total_jobs' => JobPost::count(),
                'total_bookings' => Booking::count(),
                'towns_live' => 1,
            ],
            'quick_actions' => [
                ['label' => 'Manage Users', 'href' => '/admin/users', 'icon' => 'users'],
                ['label' => 'Manage Directory', 'href' => '/admin/providers', 'icon' => 'building'],
                ['label' => 'Moderate Content', 'href' => '/admin/reports', 'icon' => 'shield'],
                ['label' => 'View System Health', 'href' => '/admin/overview', 'icon' => 'activity'],
            ],
            'pending_tasks' => [
                ['label' => 'Open flags', 'count' => ModerationFlag::query()->where('status', 'open')->count()],
                ['label' => 'Open reports', 'count' => CityReport::query()->whereNotIn('status', ['resolved', 'closed'])->count()],
            ],
            'moderation_flags' => ModerationFlag::query()->latest()->limit(6)->get(['id', 'reason', 'status', 'notes', 'created_at']),
            'recent_reports' => CityReport::query()->latest()->limit(5)->get(['id', 'title', 'category', 'status', 'priority', 'created_at']),
            'recent_activity' => $this->mergeActivity([
                ModerationFlag::query()->latest()->limit(3)->get()->map(fn (ModerationFlag $flag) => [
                    'type' => 'flag',
                    'title' => $flag->reason,
                    'body' => $flag->status,
                    'timestamp' => optional($flag->updated_at)->toIso8601String(),
                ]),
                Event::query()->latest()->limit(2)->get()->map(fn (Event $event) => [
                    'type' => 'event',
                    'title' => $event->title,
                    'body' => $event->status ?? 'published',
                    'timestamp' => optional($event->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    protected function mergeActivity(array $groups): Collection
    {
        return collect($groups)
            ->flatten(1)
            ->filter()
            ->sortByDesc('timestamp')
            ->values()
            ->take(8);
    }
}
