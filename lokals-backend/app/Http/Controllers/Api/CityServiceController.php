<?php

namespace App\Http\Controllers\Api;

use App\Events\EmergencyAlertPublished;
use App\Events\IssueStatusUpdated;
use App\Events\NewTownAnnouncement;
use App\Http\Controllers\Controller;
use App\Http\Requests\City\StoreCityReportRequest;
use App\Models\Alert;
use App\Models\Announcement;
use App\Models\CityReport;
use App\Models\CityReportAttachment;
use App\Models\CityReportUpdate;
use App\Models\Follow;
use App\Models\Organization;
use App\Support\PilotLocation;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Services\AnalyticsService;
use App\Services\EmergencyAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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
        unset($validated['photo'], $validated['attachments']);
        $validated['status'] = 'submitted';
        $validated['town'] = PilotLocation::profileTown($validated['town'] ?? $request->user()->default_town);
        $validated['area'] = PilotLocation::normalizeArea($validated['area'] ?? $request->user()->default_area);

        $report = $request->user()->cityReports()->create($validated);
        $report->update([
            'reference_code' => sprintf('REP-%06d', $report->id),
        ]);

        $attachments = [];

        if ($request->hasFile('photo')) {
            $attachments[] = $request->file('photo');
        }

        foreach ($request->file('attachments', []) as $file) {
            if ($file instanceof UploadedFile) {
                $attachments[] = $file;
            }
        }

        foreach ($attachments as $index => $file) {
            $attachment = $this->storeReportAttachment($report, $file, $request->user()->id);

            if ($index === 0 && blank($report->photo_url) && $attachment->file_type === 'image') {
                $report->forceFill([
                    'photo_url' => $attachment->file_url,
                ])->save();
            }
        }

        $this->createReportUpdate(
            $report,
            $request->user()->id,
            type: 'submitted',
            visibility: 'resident',
            message: 'Report submitted successfully and waiting for municipal review.',
            toStatus: 'submitted',
        );
        $this->analytics->record($request->user(), 'issue_report_created', [
            'category' => $report->category,
            'town' => $report->town,
            'area' => $report->area,
            'subject_type' => CityReport::class,
            'subject_id' => $report->id,
        ]);

        $request->user()->notify(new SystemNotification(
            'Report submitted',
            "Your report '{$report->title}' was received with reference {$report->reference_code}.",
            [
                'type' => 'report_created',
                'target' => [
                    'id' => $report->id,
                    'type' => 'report',
                    'href' => '/dashboard/reports/'.$report->id,
                    'title' => $report->title,
                ],
            ],
        ));

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
                        'href' => '/dashboard/town-manager/reports/'.$report->id,
                        'title' => $report->title,
                    ],
                ],
            )));

        broadcast(new IssueStatusUpdated($report->fresh(), $report->town));

        return response()->json($this->reportPayload($report->fresh()), 201);
    }

    public function myReports(Request $request): JsonResponse
    {
        $query = $request->user()->cityReports()->with(['attachments', 'updates'])->latest();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($category = $request->string('category')->value()) {
            $query->where('category', $category);
        }

        if ($priority = $request->string('priority')->value()) {
            $query->where('priority', $priority);
        }

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('reference_code', 'like', '%'.$search.'%')
                    ->orWhere('location', 'like', '%'.$search.'%');
            });
        }

        return response()->json(
            $query->paginate((int) $request->integer('per_page', 12))
                ->through(fn (CityReport $report) => $this->reportPayload($report, false))
        );
    }

    public function reports(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $query = CityReport::query()->with(['user', 'assignee'])->latest();
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
                    ->orWhere('reference_code', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%')
                    ->orWhere('location', 'like', '%'.$search.'%')
                    ->orWhere('department_name', 'like', '%'.$search.'%')
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

        if ($department = $request->string('department')->value()) {
            $query->where('department_name', $department);
        }

        if ($area = PilotLocation::requestArea($request)) {
            $query->where('area', $area);
        }

        if ($dateFrom = $request->date('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->date('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return response()->json(
            $query->paginate((int) $request->integer('per_page', 12))
                ->through(fn (CityReport $report) => $this->reportPayload($report))
        );
    }

    public function showReport(Request $request, CityReport $report): JsonResponse
    {
        $request->user()->can('view', $report) || abort(403);

        return response()->json(
            $this->reportPayload(
                $report->load(['user', 'assignee', 'attachments', 'updates.user']),
                $request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin'])
            )
        );
    }

    public function updateReportStatus(Request $request, CityReport $report): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,received,in_review,assigned,in_progress,resolved,rejected,closed'],
            'resolution_notes' => ['nullable', 'string', 'max:2000'],
            'resident_note' => ['nullable', 'string', 'max:2000'],
            'internal_note' => ['nullable', 'string', 'max:2000'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'department_name' => ['nullable', 'string', 'max:255'],
        ]);
        $fromStatus = $report->status;
        $report->update([
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'] ?? $report->resolution_notes,
            'internal_notes' => $validated['internal_note'] ?? $report->internal_notes,
            'assigned_to' => $validated['assigned_to'] ?? $report->assigned_to,
            'department_name' => $validated['department_name'] ?? $report->department_name,
        ]);

        $residentMessage = $validated['resident_note']
            ?? $validated['resolution_notes']
            ?? "Your report '{$report->title}' is now {$report->status}.";

        $this->createReportUpdate(
            $report,
            $request->user()->id,
            type: 'status_change',
            visibility: 'resident',
            message: $residentMessage,
            fromStatus: $fromStatus,
            toStatus: $report->status,
            meta: array_filter([
                'department_name' => $report->department_name,
                'assigned_to' => $report->assigned_to,
            ]),
        );

        if (! empty($validated['internal_note'])) {
            $this->createReportUpdate(
                $report,
                $request->user()->id,
                type: 'internal_note',
                visibility: 'internal',
                message: $validated['internal_note'],
            );
        }

        $report->user?->notify(new SystemNotification(
            'Report status update',
            $residentMessage,
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

        broadcast(new IssueStatusUpdated($report->fresh(), $report->town));
        $this->analytics->record($request->user(), 'issue_status_updated', [
            'category' => $report->category,
            'town' => $report->town,
            'area' => $report->area,
            'subject_type' => CityReport::class,
            'subject_id' => $report->id,
        ]);

        return response()->json(
            $this->reportPayload($report->fresh()->load(['user', 'assignee', 'attachments', 'updates.user']))
        );
    }

    public function addReportUpdate(Request $request, CityReport $report): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['town_manager', 'municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
            'status' => ['nullable', 'in:submitted,received,in_review,assigned,in_progress,resolved,rejected,closed'],
            'visibility' => ['nullable', 'in:resident,internal'],
            'department_name' => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);
        $visibility = $validated['visibility'] ?? 'resident';
        $fromStatus = $report->status;
        $report->update([
            'resolution_notes' => $visibility === 'resident' ? $validated['note'] : $report->resolution_notes,
            'internal_notes' => $visibility === 'internal' ? $validated['note'] : $report->internal_notes,
            'status' => $validated['status'] ?? $report->status,
            'department_name' => $validated['department_name'] ?? $report->department_name,
            'assigned_to' => $validated['assigned_to'] ?? $report->assigned_to,
        ]);

        $this->createReportUpdate(
            $report,
            $request->user()->id,
            type: $visibility === 'internal' ? 'internal_note' : 'response',
            visibility: $visibility,
            message: $validated['note'],
            fromStatus: $fromStatus !== $report->status ? $fromStatus : null,
            toStatus: $fromStatus !== $report->status ? $report->status : null,
            meta: array_filter([
                'department_name' => $report->department_name,
                'assigned_to' => $report->assigned_to,
            ]),
        );

        if ($visibility === 'resident') {
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
        }

        broadcast(new IssueStatusUpdated($report->fresh(), $report->town));

        return response()->json(
            $this->reportPayload($report->fresh()->load(['user', 'assignee', 'attachments', 'updates.user']))
        );
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

        $targetUsers = User::query()
            ->whereKeyNot($request->user()->id)
            ->when($alert->town, fn ($query) => $query->where('default_town', $alert->town))
            ->when($alert->area, fn ($query) => $query->where(function ($builder) use ($alert): void {
                $builder->where('default_area', $alert->area)->orWhereNull('default_area');
            }))
            ->get();

        $targetUsers
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
            $emergency = $this->emergencyAlerts->publish([
                'title' => $alert->title,
                'body' => $alert->body,
                'emergency_type' => $alert->type,
                'priority' => $alert->priority,
                'town' => $alert->town,
                'area' => $alert->area,
            ], $request->user());
            broadcast(new EmergencyAlertPublished($emergency, $targetUsers->pluck('id')->all()));
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

    protected function reportPayload(CityReport $report, bool $includeInternal = true): array
    {
        $report->loadMissing(['user', 'assignee', 'attachments', 'updates.user']);
        $updates = $includeInternal
            ? $report->updates
            : $report->updates->where('visibility', 'resident')->values();

        return [
            'id' => $report->id,
            'reference_code' => $report->reference_code,
            'category' => $report->category,
            'title' => $report->title,
            'description' => $report->description,
            'location' => $report->location,
            'town' => $report->town,
            'area' => $report->area,
            'lat' => $report->lat,
            'lng' => $report->lng,
            'priority' => $report->priority,
            'status' => $report->status,
            'photo_url' => $report->photo_url,
            'department_name' => $report->department_name,
            'resolution_notes' => $report->resolution_notes,
            'internal_notes' => $includeInternal ? $report->internal_notes : null,
            'created_at' => optional($report->created_at)->toIso8601String(),
            'updated_at' => optional($report->updated_at)->toIso8601String(),
            'user' => $report->user ? [
                'id' => $report->user->id,
                'name' => $report->user->name,
                'phone' => $report->user->phone,
                'email' => $report->user->email,
            ] : null,
            'assigned_officer' => $report->assignee ? [
                'id' => $report->assignee->id,
                'name' => $report->assignee->name,
                'phone' => $report->assignee->phone,
                'email' => $report->assignee->email,
            ] : null,
            'attachments' => $report->attachments->map(fn (CityReportAttachment $attachment) => [
                'id' => $attachment->id,
                'file_url' => $attachment->file_url,
                'mime_type' => $attachment->mime_type,
                'file_type' => $attachment->file_type,
                'original_name' => $attachment->original_name,
                'size' => $attachment->size,
                'created_at' => optional($attachment->created_at)->toIso8601String(),
            ])->values()->all(),
            'updates' => $updates->map(fn (CityReportUpdate $update) => [
                'id' => $update->id,
                'type' => $update->type,
                'visibility' => $update->visibility,
                'from_status' => $update->from_status,
                'to_status' => $update->to_status,
                'message' => $update->message,
                'meta' => $update->meta,
                'created_at' => optional($update->created_at)->toIso8601String(),
                'user' => $update->user ? [
                    'id' => $update->user->id,
                    'name' => $update->user->name,
                ] : null,
            ])->values()->all(),
        ];
    }

    protected function createReportUpdate(
        CityReport $report,
        ?int $userId,
        string $type,
        string $visibility,
        string $message,
        ?string $fromStatus = null,
        ?string $toStatus = null,
        array $meta = [],
    ): CityReportUpdate {
        return $report->updates()->create([
            'user_id' => $userId,
            'type' => $type,
            'visibility' => $visibility,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'message' => $message,
            'meta' => $meta ?: null,
        ]);
    }

    protected function storeReportAttachment(CityReport $report, UploadedFile $file, int $userId): CityReportAttachment
    {
        $path = $file->store('report-attachments', 'public');

        return $report->attachments()->create([
            'user_id' => $userId,
            'file_path' => $path,
            'file_url' => Storage::disk('public')->url($path),
            'mime_type' => $file->getMimeType(),
            'file_type' => $this->resolveFileType($file->getMimeType()),
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ]);
    }

    protected function resolveFileType(?string $mimeType): string
    {
        if (! $mimeType) {
            return 'document';
        }

        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        if (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }

        return 'document';
    }
}
