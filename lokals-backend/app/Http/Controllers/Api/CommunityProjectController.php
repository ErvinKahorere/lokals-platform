<?php

namespace App\Http\Controllers\Api;

use App\Events\CommunityProjectUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityProjectCategoryResource;
use App\Http\Resources\CommunityProjectPledgeResource;
use App\Http\Resources\CommunityProjectResource;
use App\Models\CommunityProject;
use App\Models\CommunityProjectAttachment;
use App\Models\CommunityProjectCategory;
use App\Models\CommunityProjectPledge;
use App\Models\CommunityProjectUpdate;
use App\Models\CommunityProjectVerification;
use App\Models\Follow;
use App\Models\Organization;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Services\AnalyticsService;
use App\Support\MediaUrl;
use App\Support\PilotLocation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CommunityProjectController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analytics,
    ) {
    }

    private const PROJECT_STATUSES = [
        'draft',
        'submitted',
        'active',
        'in_progress',
        'needs_support',
        'fully_funded',
        'completed',
        'archived',
    ];

    private const VERIFICATION_STATUSES = [
        'pending',
        'approved',
        'rejected',
        'changes_requested',
    ];

    private const SUPPORT_OPTIONS = [
        'Donations',
        'Volunteers',
        'Skills/services',
        'Materials',
        'Food/clothing support',
        'School support',
        'Medical support',
        'Community cleanup support',
        'Sports/youth support',
        'Elderly/vulnerable support',
        'Sponsorship',
        'Other community help',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $this->publicQuery($request->user());
        $this->applyCommonFilters($query, $request);
        $this->applyNeedFilters($query, $request);

        return CommunityProjectResource::collection(
            $query->latest()->paginate((int) $request->integer('per_page', 12))
        );
    }

    public function featured(Request $request): AnonymousResourceCollection
    {
        $query = $this->publicQuery($request->user())
            ->where('is_featured', true);

        $this->applyCommonFilters($query, $request);

        return CommunityProjectResource::collection(
            $query->latest()->paginate((int) $request->integer('per_page', 8))
        );
    }

    public function categories(): AnonymousResourceCollection
    {
        return CommunityProjectCategoryResource::collection(
            CommunityProjectCategory::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
        );
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $user = $request->user();
        $project = $this->findPublicProjectBySlug($slug, $user);

        return response()->json([
            'data' => CommunityProjectResource::make($this->loadProject($project, $this->canViewInternalProject($user, $project))),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate($this->projectRules());

        $organization = $this->resolveOrganization($validated['organization_id'] ?? null, $user);
        $submissionState = $this->resolveSubmissionState($request, $validated);

        $project = CommunityProject::query()->create([
            'user_id' => $user->id,
            'organization_id' => $organization?->id,
            'category_id' => $validated['category_id'],
            'title' => trim($validated['title']),
            'slug' => $this->uniqueSlug($validated['title']),
            'reference_code' => $this->generateReferenceCode(),
            'summary' => trim($validated['summary']),
            'description' => trim(strip_tags($validated['description'])),
            'support_needed' => array_values($validated['support_needed'] ?? []),
            'target_amount' => $validated['target_amount'] ?? null,
            'target_items' => $validated['target_items'] ?? [],
            'target_volunteers' => $validated['target_volunteers'] ?? null,
            'current_amount' => 0,
            'current_items' => [],
            'current_volunteers' => 0,
            'location_text' => trim($validated['location_text']),
            'town' => $validated['town'] ?? PilotLocation::town(),
            'area' => $validated['area'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'contact_name' => trim($validated['contact_name']),
            'contact_phone' => $validated['contact_phone'] ?? $user->phone,
            'contact_whatsapp' => $validated['contact_whatsapp'] ?? $user->whatsapp,
            'contact_email' => $validated['contact_email'] ?? $user->email,
            'status' => $submissionState['status'],
            'verification_status' => $submissionState['verification_status'],
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
        ]);

        $this->storeProjectAttachments($project, $request->file('attachments', []), $user);
        $project = $this->loadProject($project->fresh(), true);

        if ($submissionState['status'] === 'submitted') {
            $this->recordVerification($project, $user, 'submitted', 'Project submitted for review.');
            $this->notifyTownManagers(
                'New Get Involved submission',
                $project->title.' was submitted for Town Manager verification.',
                $project
            );
        }

        return response()->json([
            'message' => $submissionState['status'] === 'submitted'
                ? 'Submitted for Town Manager verification.'
                : 'Community project saved as draft.',
            'data' => CommunityProjectResource::make($project),
        ], 201);
    }

    public function myProjects(Request $request): AnonymousResourceCollection
    {
        $query = CommunityProject::query()
            ->with([
                'category',
                'user',
                'organization',
                'attachments',
                'updates' => fn ($builder) => $builder->latest(),
                'verifications' => fn ($builder) => $builder->with('reviewer')->latest(),
            ])
            ->withCount(['pledges', 'followers'])
            ->where('user_id', $request->user()->id)
            ->latest();

        return CommunityProjectResource::collection(
            $query->paginate((int) $request->integer('per_page', 12))
        );
    }

    public function myProjectShow(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        abort_unless(
            $project->user_id === $request->user()->id || $request->user()->hasTownManagerAccess() || $request->user()->hasRole('operator'),
            403
        );

        return response()->json([
            'data' => CommunityProjectResource::make($this->loadProject($project, true)),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        $this->authorize('update', $project);

        $validated = $request->validate($this->projectRules(false));
        $organization = array_key_exists('organization_id', $validated)
            ? $this->resolveOrganization($validated['organization_id'], $request->user())
            : $project->organization;

        $nextStatus = $project->status;
        $nextVerification = $project->verification_status;

        if ($request->boolean('submit_for_review') && in_array($project->verification_status, ['pending', 'changes_requested'], true)) {
            $nextStatus = 'submitted';
            $nextVerification = 'pending';
        } elseif (isset($validated['status']) && in_array($validated['status'], ['draft', 'submitted'], true)) {
            $nextStatus = $validated['status'];
            if ($validated['status'] === 'submitted') {
                $nextVerification = 'pending';
            }
        }

        $project->update([
            'organization_id' => $organization?->id,
            'category_id' => $validated['category_id'] ?? $project->category_id,
            'title' => isset($validated['title']) ? trim($validated['title']) : $project->title,
            'slug' => isset($validated['title']) && $validated['title'] !== $project->title
                ? $this->uniqueSlug($validated['title'], $project->id)
                : $project->slug,
            'summary' => isset($validated['summary']) ? trim($validated['summary']) : $project->summary,
            'description' => isset($validated['description']) ? trim(strip_tags($validated['description'])) : $project->description,
            'support_needed' => $validated['support_needed'] ?? $project->support_needed,
            'target_amount' => array_key_exists('target_amount', $validated) ? $validated['target_amount'] : $project->target_amount,
            'target_items' => $validated['target_items'] ?? $project->target_items,
            'target_volunteers' => array_key_exists('target_volunteers', $validated) ? $validated['target_volunteers'] : $project->target_volunteers,
            'location_text' => isset($validated['location_text']) ? trim($validated['location_text']) : $project->location_text,
            'town' => $validated['town'] ?? $project->town,
            'area' => array_key_exists('area', $validated) ? $validated['area'] : $project->area,
            'latitude' => array_key_exists('latitude', $validated) ? $validated['latitude'] : $project->latitude,
            'longitude' => array_key_exists('longitude', $validated) ? $validated['longitude'] : $project->longitude,
            'contact_name' => isset($validated['contact_name']) ? trim($validated['contact_name']) : $project->contact_name,
            'contact_phone' => array_key_exists('contact_phone', $validated) ? $validated['contact_phone'] : $project->contact_phone,
            'contact_whatsapp' => array_key_exists('contact_whatsapp', $validated) ? $validated['contact_whatsapp'] : $project->contact_whatsapp,
            'contact_email' => array_key_exists('contact_email', $validated) ? $validated['contact_email'] : $project->contact_email,
            'starts_at' => array_key_exists('starts_at', $validated) ? $validated['starts_at'] : $project->starts_at,
            'ends_at' => array_key_exists('ends_at', $validated) ? $validated['ends_at'] : $project->ends_at,
            'status' => $nextStatus,
            'verification_status' => $nextVerification,
            'rejection_reason' => $nextVerification === 'pending' ? null : $project->rejection_reason,
            'verification_notes' => $nextVerification === 'pending' ? null : $project->verification_notes,
        ]);

        $this->storeProjectAttachments($project, $request->file('attachments', []), $request->user());

        if ($nextStatus === 'submitted' && $project->wasChanged(['status', 'verification_status'])) {
            $this->recordVerification($project, $request->user(), 'submitted', 'Project resubmitted for review.');
            $this->notifyTownManagers(
                'Community project resubmitted',
                $project->title.' was updated and resubmitted for verification.',
                $project
            );
        }

        return response()->json([
            'message' => 'Community project updated.',
            'data' => CommunityProjectResource::make($this->loadProject($project->fresh(), true)),
        ]);
    }

    public function pledge(Request $request, int $id): JsonResponse
    {
        $project = $this->findPublicProjectById($id, $request->user());
        $validated = $request->validate([
            'pledge_type' => ['required', 'in:money,item,volunteer,service,other'],
            'pledge_description' => ['required', 'string', 'max:1000'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
        ]);

        $pledge = CommunityProjectPledge::query()->create([
            'community_project_id' => $project->id,
            'user_id' => $request->user()->id,
            'pledge_type' => $validated['pledge_type'],
            'pledge_description' => trim($validated['pledge_description']),
            'amount' => $validated['amount'] ?? null,
            'quantity' => $validated['quantity'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? $request->user()->phone,
            'contact_email' => $validated['contact_email'] ?? $request->user()->email,
            'status' => 'pledged',
        ]);

        $project->user?->notify(new SystemNotification(
            'New support pledge received',
            $request->user()->name.' pledged support for '.$project->title.'.',
            [
                'type' => 'community_project_pledge',
                'target' => [
                    'id' => $project->slug,
                    'title' => $project->title,
                    'href' => '/get-involved/'.$project->slug,
                ],
            ],
        ));

        return response()->json([
            'message' => 'Your pledge was sent to the organiser.',
            'data' => CommunityProjectPledgeResource::make($pledge->load('user')),
        ], 201);
    }

    public function myPledges(Request $request): AnonymousResourceCollection
    {
        return CommunityProjectPledgeResource::collection(
            CommunityProjectPledge::query()
                ->with(['user', 'project.category', 'project.attachments'])
                ->where('user_id', $request->user()->id)
                ->latest()
                ->paginate((int) $request->integer('per_page', 12))
        );
    }

    public function storeUpdate(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        abort_unless(
            $project->user_id === $request->user()->id || $request->user()->hasTownManagerAccess() || $request->user()->hasRole('operator'),
            403
        );

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:4000'],
            'status_after_update' => ['nullable', 'in:'.implode(',', self::PROJECT_STATUSES)],
            'progress_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'attachments' => ['nullable', 'array', 'max:6'],
            'attachments.*' => ['file', 'max:15360', 'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ]);

        $update = CommunityProjectUpdate::query()->create([
            'community_project_id' => $project->id,
            'user_id' => $request->user()->id,
            'title' => trim($validated['title']),
            'body' => trim(strip_tags($validated['body'])),
            'status_after_update' => $validated['status_after_update'] ?? null,
            'progress_percent' => $validated['progress_percent'] ?? null,
            'attachments' => $this->storeInlineAttachments($request->file('attachments', [])),
            'approved_by_town_manager' => true,
        ]);

        if (! empty($validated['status_after_update'])) {
            $project->status = $validated['status_after_update'];
        }

        if (array_key_exists('progress_percent', $validated)) {
            $this->applyProgressPercent($project, (int) $validated['progress_percent']);
        }

        if (($validated['status_after_update'] ?? null) === 'completed') {
            $project->completed_at = now();
        }

        $project->save();

        $this->recordVerification($project, $request->user(), 'status_updated', 'Project posted a new public update.');
        $this->notifyFollowersOfUpdate($project, $update, $request->user());
        broadcast(new CommunityProjectUpdated($project->fresh()));
        $this->analytics->record($request->user(), 'community_project_update_posted', [
            'category' => 'community_project',
            'town' => $project->town,
            'area' => $project->area,
            'subject_type' => CommunityProject::class,
            'subject_id' => $project->id,
        ]);

        return response()->json([
            'message' => 'Project update posted.',
            'data' => CommunityProjectResource::make($this->loadProject($project->fresh(), true)),
        ], 201);
    }

    public function follow(Request $request, int $id): JsonResponse
    {
        $project = $this->findPublicProjectById($id, $request->user());

        Follow::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'followable_type' => CommunityProject::class,
            'followable_id' => $project->id,
        ]);

        return response()->json(['message' => 'You are now following this initiative.'], 201);
    }

    public function unfollow(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();

        Follow::query()
            ->where('user_id', $request->user()->id)
            ->where('followable_type', CommunityProject::class)
            ->where('followable_id', $project->id)
            ->delete();

        return response()->json(['message' => 'You will no longer receive updates for this initiative.']);
    }

    private function projectRules(bool $creating = true): array
    {
        return [
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'category_id' => [$creating ? 'required' : 'sometimes', 'integer', 'exists:community_project_categories,id'],
            'title' => [$creating ? 'required' : 'sometimes', 'string', 'max:160'],
            'summary' => [$creating ? 'required' : 'sometimes', 'string', 'max:280'],
            'description' => [$creating ? 'required' : 'sometimes', 'string', 'max:12000'],
            'support_needed' => ['nullable', 'array', 'max:8'],
            'support_needed.*' => ['string', 'max:80'],
            'target_amount' => ['nullable', 'numeric', 'min:0'],
            'target_items' => ['nullable', 'array'],
            'target_volunteers' => ['nullable', 'integer', 'min:0'],
            'location_text' => [$creating ? 'required' : 'sometimes', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:120'],
            'area' => ['nullable', 'string', 'max:120'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'contact_name' => [$creating ? 'required' : 'sometimes', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_whatsapp' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status' => ['nullable', 'in:draft,submitted'],
            'submit_for_review' => ['nullable', 'boolean'],
            'attachments' => ['nullable', 'array', 'max:8'],
            'attachments.*' => ['file', 'max:15360', 'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ];
    }

    private function publicQuery(?User $user): Builder
    {
        $query = CommunityProject::query()
            ->with([
                'category',
                'user',
                'organization',
                'attachments',
                'updates' => fn ($builder) => $builder->where('approved_by_town_manager', true)->latest()->with('user'),
            ])
            ->withCount(['pledges', 'followers'])
            ->where('verification_status', 'approved')
            ->where('is_verified', true)
            ->whereNotIn('status', ['draft', 'submitted', 'archived']);

        if ($user) {
            $query->withExists([
                'followers as is_following' => fn ($builder) => $builder->where('user_id', $user->id),
            ]);
        }

        return $query;
    }

    private function applyCommonFilters(Builder $query, Request $request): void
    {
        if ($search = trim((string) $request->string('search')->value())) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('summary', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('location_text', 'like', '%'.$search.'%');
            });
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($category = trim((string) $request->string('category')->value())) {
            $query->whereHas('category', fn (Builder $builder) => $builder->where('slug', $category)->orWhere('name', $category));
        }

        if ($status = trim((string) $request->string('status')->value())) {
            $query->where('status', $status);
        }

        if ($location = trim((string) $request->string('location')->value())) {
            $query->where(function (Builder $builder) use ($location): void {
                $builder->where('location_text', 'like', '%'.$location.'%')
                    ->orWhere('town', 'like', '%'.$location.'%')
                    ->orWhere('area', 'like', '%'.$location.'%');
            });
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($value = PilotLocation::requestTown($request)) {
            $query->where('town', $value);
        }

        if ($value = PilotLocation::requestArea($request)) {
            $query->where('area', $value);
        }
    }

    private function applyNeedFilters(Builder $query, Request $request): void
    {
        if ($request->boolean('needs_volunteers')) {
            $query->whereNotNull('target_volunteers')
                ->whereColumn('current_volunteers', '<', 'target_volunteers');
        }

        if ($request->boolean('needs_donations')) {
            $query->where(function (Builder $builder): void {
                $builder->where(function (Builder $amountBuilder): void {
                    $amountBuilder->whereNotNull('target_amount')
                        ->whereColumn('current_amount', '<', 'target_amount');
                })->orWhereNotNull('target_items');
            });
        }
    }

    private function findPublicProjectBySlug(string $slug, ?User $user): CommunityProject
    {
        if ($user && $user->hasTownManagerAccess()) {
            $project = CommunityProject::query()->where('slug', $slug)->first();
            if ($project) {
                return $project;
            }
        }

        return $this->publicQuery($user)->where('slug', $slug)->firstOrFail();
    }

    private function findPublicProjectById(int $id, ?User $user): CommunityProject
    {
        if ($user && $user->hasTownManagerAccess()) {
            $project = CommunityProject::query()->whereKey($id)->first();
            if ($project) {
                return $project;
            }
        }

        return $this->publicQuery($user)->whereKey($id)->firstOrFail();
    }

    private function loadProject(CommunityProject $project, bool $internal): CommunityProject
    {
        $project->loadMissing([
            'category',
            'user',
            'organization',
            'attachments',
            'updates' => function ($builder) use ($internal): void {
                if (! $internal) {
                    $builder->where('approved_by_town_manager', true);
                }

                $builder->latest()->with('user');
            },
            'verifications' => fn ($builder) => $builder->with('reviewer')->latest(),
        ])->loadCount(['pledges', 'followers']);

        return $project;
    }

    private function canViewInternalProject(?User $user, CommunityProject $project): bool
    {
        return $user !== null
            && ($project->user_id === $user->id || $user->hasTownManagerAccess() || $user->hasRole('operator'));
    }

    private function resolveOrganization(?int $organizationId, User $user): ?Organization
    {
        if (! $organizationId) {
            return null;
        }

        $organization = Organization::query()->findOrFail($organizationId);
        abort_unless(
            $organization->owner_user_id === $user->id || $user->hasAnyRole(['organization_admin', 'business_owner', 'town_manager', 'municipality_admin', 'super_admin', 'operator']),
            403,
            'You cannot submit for this organization.'
        );

        return $organization;
    }

    private function resolveSubmissionState(Request $request, array $validated): array
    {
        $status = $validated['status'] ?? 'submitted';
        if ($request->boolean('save_as_draft')) {
            $status = 'draft';
        }

        return [
            'status' => $status === 'draft' ? 'draft' : 'submitted',
            'verification_status' => 'pending',
        ];
    }

    private function storeProjectAttachments(CommunityProject $project, array $files, User $user): void
    {
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $stored = $this->storeFileMeta($file, 'community-projects');

            CommunityProjectAttachment::query()->create([
                'community_project_id' => $project->id,
                'user_id' => $user->id,
                ...$stored,
            ]);
        }
    }

    private function storeInlineAttachments(array $files): array
    {
        return collect($files)
            ->filter(fn ($file) => $file instanceof UploadedFile)
            ->map(fn (UploadedFile $file) => $this->storeFileMeta($file, 'community-project-updates'))
            ->values()
            ->all();
    }

    private function storeFileMeta(UploadedFile $file, string $directory): array
    {
        $path = $file->store($directory, 'public');

        return [
            'file_path' => $path,
            'file_url' => Storage::disk('public')->url($path),
            'mime_type' => $file->getMimeType(),
            'file_type' => $this->resolveFileType($file->getMimeType()),
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ];
    }

    private function resolveFileType(?string $mimeType): string
    {
        if ($mimeType === null) {
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

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'community-project';
        $slug = $base;
        $suffix = 2;

        while (CommunityProject::query()
            ->when($ignoreId, fn ($builder) => $builder->whereKeyNot($ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function generateReferenceCode(): string
    {
        do {
            $code = 'CP-OKA-'.random_int(1000, 9999);
        } while (CommunityProject::query()->where('reference_code', $code)->exists());

        return $code;
    }

    private function recordVerification(CommunityProject $project, User $actor, string $action, ?string $notes = null): void
    {
        CommunityProjectVerification::query()->create([
            'community_project_id' => $project->id,
            'reviewed_by' => $actor->id,
            'action' => $action,
            'notes' => $notes,
            'status_after' => $project->status,
            'verification_status_after' => $project->verification_status,
        ]);
    }

    private function notifyTownManagers(string $title, string $body, CommunityProject $project): void
    {
        User::query()
            ->whereHas('roles', fn ($builder) => $builder->whereIn('name', ['town_manager', 'municipality_admin', 'super_admin', 'operator']))
            ->get()
            ->each(fn (User $user) => $user->notify(new SystemNotification($title, $body, [
                'type' => 'community_project_submitted',
                'target' => [
                    'id' => $project->id,
                    'title' => $project->title,
                    'href' => '/dashboard/town-manager/community-projects/'.$project->id,
                ],
            ])));
    }

    private function notifyFollowersOfUpdate(CommunityProject $project, CommunityProjectUpdate $update, User $actor): void
    {
        $project->loadMissing('followers.user');

        $followers = $project->followers
            ->map(fn (Follow $follow) => $follow->user)
            ->filter(fn ($user) => $user instanceof User && $user->id !== $actor->id);

        /** @var Collection<int, User> $followers */
        $followers->each(fn (User $user) => $user->notify(new SystemNotification(
            'Project update posted',
            $project->title.' shared a new update: '.$update->title,
            [
                'type' => 'community_project_update',
                'target' => [
                    'id' => $project->slug,
                    'title' => $project->title,
                    'href' => '/get-involved/'.$project->slug,
                ],
            ],
        )));
    }

    private function applyProgressPercent(CommunityProject $project, int $progressPercent): void
    {
        $project->progress_percent = $progressPercent;

        if ($project->target_amount && (float) $project->target_amount > 0) {
            $project->current_amount = round(((float) $project->target_amount * $progressPercent) / 100, 2);
        }

        if ($project->target_volunteers && (int) $project->target_volunteers > 0) {
            $project->current_volunteers = (int) round(((int) $project->target_volunteers * $progressPercent) / 100);
        }
    }
}
