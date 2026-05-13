<?php

namespace App\Http\Controllers\Api;

use App\Events\IssueStatusUpdated;
use App\Events\NewTownAnnouncement;
use App\Http\Controllers\Controller;
use App\Http\Requests\City\StoreCityReportRequest;
use App\Models\Alert;
use App\Models\Announcement;
use App\Models\CityReport;
use App\Models\Follow;
use App\Models\Organization;
use App\Support\PilotLocation;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Services\AnalyticsService;
use App\Services\EmergencyAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CityServiceController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analytics,
        private readonly EmergencyAlertService $emergencyAlerts,
    ) {
    }

    public function announcements(Request $request): JsonResponse
    {
        return response()->json(Announcement::query()->latest('published_at')->paginate((int) $request->integer('per_page', 12)));
    }

    public function reportIssue(StoreCityReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        unset($validated['photo']);
        $validated['status'] = 'open';
        $validated['town'] = PilotLocation::profileTown($validated['town'] ?? $request->user()->default_town);
        $validated['area'] = PilotLocation::normalizeArea($validated['area'] ?? $request->user()->default_area);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('report-photos', 'public');
            $validated['photo_url'] = Storage::disk('public')->url($path);
        }

        $report = $request->user()->cityReports()->create($validated);
        $this->analytics->record($request->user(), 'issue_report_created', [
            'category' => $report->category,
            'town' => $report->town,
            'area' => $report->area,
            'subject_type' => CityReport::class,
            'subject_id' => $report->id,
        ]);

        User::query()
            ->whereKeyNot($request->user()->id)
            ->whereHas('roles', fn ($query) => $query->whereIn('name', ['town_manager', 'municipality_admin']))
            ->where('default_town', $report->town)
            ->get()
            ->each(fn (User $user) => $user->notify(new SystemNotification(
                'New city report',
                $report->title,
                [
                    'type' => 'report_created',
                    'target' => [
                        'id' => $report->id,
                        'type' => 'report',
                        'href' => '/admin/reports/'.$report->id,
                        'title' => $report->title,
                    ],
                ],
            )));

        return response()->json($report, 201);
    }

    public function myReports(Request $request): JsonResponse
    {
        return response()->json($request->user()->cityReports()->latest()->paginate((int) $request->integer('per_page', 12)));
    }

    public function reports(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $query = CityReport::query()->with('user')->latest();
        $user = $request->user();

        if (! $user->hasAnyRole(['super_admin', 'operator'])) {
            $query->where('town', PilotLocation::profileTown($user->default_town));
            if ($area = PilotLocation::normalizeArea($user->default_area)) {
                $query->where(function ($builder) use ($area): void {
                    $builder->where('area', $area)->orWhereNull('area');
                });
            }
        }

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%')
                    ->orWhere('area', 'like', '%'.$search.'%')
                    ->orWhere('town', 'like', '%'.$search.'%');
            });
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($category = $request->string('category')->value()) {
            $query->where('category', $category);
        }

        if ($priority = $request->string('priority')->value()) {
            $query->where('priority', $priority);
        }

        if ($area = PilotLocation::requestArea($request)) {
            $query->where('area', $area);
        }

        return response()->json($query->paginate((int) $request->integer('per_page', 12)));
    }

    public function showReport(Request $request, CityReport $report): JsonResponse
    {
        $request->user()->can('view', $report) || abort(403);

        return response()->json($report->load('user'));
    }

    public function updateReportStatus(Request $request, CityReport $report): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:open,submitted,in_progress,in_review,resolved,rejected'],
            'resolution_notes' => ['nullable', 'string', 'max:2000'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $status = match ($validated['status']) {
            'submitted' => 'open',
            'in_review' => 'in_progress',
            default => $validated['status'],
        };

        $report->update([
            'status' => $status,
            'resolution_notes' => $validated['resolution_notes'] ?? $report->resolution_notes,
            'assigned_to' => $validated['assigned_to'] ?? $report->assigned_to,
        ]);
        $report->user?->notify(new SystemNotification(
            'Report status update',
            "Your report '{$report->title}' is now {$report->status}.",
            [
                'type' => 'report_update',
                'report_id' => $report->id,
                'status' => $report->status,
                'target' => [
                    'id' => $report->id,
                    'type' => 'report',
                    'href' => '/dashboard/reports/'.$report->id,
                    'title' => $report->title,
                ],
            ]
        ));

        broadcast(new IssueStatusUpdated($report->fresh()));
        $this->analytics->record($request->user(), 'issue_status_updated', [
            'category' => $report->category,
            'town' => $report->town,
            'area' => $report->area,
            'subject_type' => CityReport::class,
            'subject_id' => $report->id,
        ]);

        return response()->json($report);
    }

    public function addReportUpdate(Request $request, CityReport $report): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
            'status' => ['nullable', 'in:open,in_progress,resolved,rejected'],
        ]);

        $notes = trim(implode("\n\n", array_filter([
            $report->resolution_notes,
            now()->format('Y-m-d H:i').' - '.$validated['note'],
        ])));

        $report->update([
            'resolution_notes' => $notes,
            'status' => $validated['status'] ?? $report->status,
        ]);

        $report->user?->notify(new SystemNotification(
            'Report update',
            $validated['note'],
            [
                'type' => 'report_update',
                'report_id' => $report->id,
                'status' => $report->status,
                'target' => [
                    'id' => $report->id,
                    'type' => 'report',
                    'href' => '/dashboard/reports/'.$report->id,
                    'title' => $report->title,
                ],
            ]
        ));

        return response()->json($report);
    }

    public function createAnnouncement(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'published_at' => now(),
            'status' => 'published',
        ]);

        if ($announcement->organization_id) {
            $followerIds = Follow::query()
                ->where('followable_type', Organization::class)
                ->where('followable_id', $announcement->organization_id)
                ->pluck('user_id');

            \App\Models\User::query()->whereIn('id', $followerIds)->get()->each(
                fn ($user) => $user->notify(new SystemNotification(
                    'Alert from followed organization',
                    $announcement->title,
                    ['type' => 'followed_organization_alert', 'announcement_id' => $announcement->id]
                ))
            );
        }

        broadcast(new NewTownAnnouncement([
            'id' => $announcement->id,
            'title' => $announcement->title,
            'body' => $announcement->body,
            'town' => $request->user()->default_town ?? 'Okahandja',
            'type' => 'announcement',
        ]));
        $this->analytics->record($request->user(), 'announcement_created', [
            'category' => 'announcement',
            'town' => $request->user()->default_town,
            'subject_type' => Announcement::class,
            'subject_id' => $announcement->id,
        ]);

        return response()->json($announcement, 201);
    }

    public function alerts(Request $request): JsonResponse
    {
        $query = Alert::query()->latest();

        if ($town = PilotLocation::requestTown($request)) {
            $query->where('town', $town);
        }

        if ($area = PilotLocation::requestArea($request)) {
            $query->where('area', $area);
        }

        if ($type = $request->string('type')->value()) {
            $query->where('type', $type);
        }

        return response()->json($query->paginate((int) $request->integer('per_page', 12)));
    }

    public function createAlert(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'type' => ['required', 'in:municipal_alert,public_notice,service_update,emergency_alert'],
            'priority' => ['nullable', 'in:low,medium,high,critical'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_public' => ['nullable', 'boolean'],
            'channels' => ['nullable', 'array'],
        ]);

        $alert = Alert::query()->create([
            ...$validated,
            'audience' => 'all',
            'priority' => $validated['priority'] ?? 'medium',
            'town' => PilotLocation::profileTown($validated['town'] ?? $request->user()->default_town),
            'area' => PilotLocation::normalizeArea($validated['area'] ?? $request->user()->default_area),
            'location' => $validated['location'] ?? collect([PilotLocation::normalizeArea($validated['area'] ?? $request->user()->default_area), PilotLocation::profileTown($validated['town'] ?? $request->user()->default_town)])->filter()->implode(', '),
            'created_by' => $request->user()->id,
            'is_public' => $validated['is_public'] ?? true,
            'is_active' => true,
        ]);

        User::query()
            ->whereKeyNot($request->user()->id)
            ->when($alert->town, fn ($query) => $query->where('default_town', $alert->town))
            ->when($alert->area, fn ($query) => $query->where(function ($builder) use ($alert): void {
                $builder->where('default_area', $alert->area)->orWhereNull('default_area');
            }))
            ->get()
            ->each(fn (User $user) => $user->notify(new SystemNotification(
                $alert->title,
                $alert->body,
                [
                    'type' => 'municipal_alert',
                    'target' => [
                        'id' => $alert->id,
                        'type' => 'alert',
                        'href' => '/alerts',
                        'title' => $alert->title,
                    ],
                ],
            )));

        if ($alert->type === 'emergency_alert') {
            $this->emergencyAlerts->publish([
                'title' => $alert->title,
                'body' => $alert->body,
                'emergency_type' => $alert->type,
                'priority' => $alert->priority,
                'town' => $alert->town,
                'area' => $alert->area,
            ], $request->user());
        }

        broadcast(new NewTownAnnouncement([
            'id' => $alert->id,
            'title' => $alert->title,
            'body' => $alert->body,
            'town' => $alert->town,
            'area' => $alert->area,
            'type' => $alert->type,
            'priority' => $alert->priority,
        ]));
        $this->analytics->record($request->user(), 'alert_created', [
            'category' => $alert->type,
            'town' => $alert->town,
            'area' => $alert->area,
            'subject_type' => Alert::class,
            'subject_id' => $alert->id,
        ]);

        return response()->json($alert, 201);
    }
}
