<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityProjectResource;
use App\Models\CommunityProject;
use App\Models\CommunityProjectVerification;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminCommunityProjectController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $this->query();
        $this->applyFilters($query, $request);

        return CommunityProjectResource::collection(
            $query->latest()->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function pending(Request $request): AnonymousResourceCollection
    {
        $query = $this->query()
            ->where('verification_status', 'pending');

        $this->applyFilters($query, $request);

        return CommunityProjectResource::collection(
            $query->latest()->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function show(int $id): JsonResponse
    {
        $project = $this->query()->whereKey($id)->firstOrFail();

        return response()->json([
            'data' => CommunityProjectResource::make($project),
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        $this->authorize('review', $project);

        $validated = $request->validate([
            'verification_notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', 'in:active,in_progress,needs_support,fully_funded,completed'],
        ]);

        $project->update([
            'verification_status' => 'approved',
            'verification_notes' => $validated['verification_notes'] ?? 'Approved for public display.',
            'rejection_reason' => null,
            'is_verified' => true,
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
            'status' => $validated['status'] ?? (in_array($project->status, ['draft', 'submitted'], true) ? 'active' : $project->status),
        ]);

        $this->recordVerification($project, $request->user(), 'approved', $validated['verification_notes'] ?? null);
        $this->notifyOwner(
            $project,
            'Community project approved',
            $project->title.' is now visible in Get Involved.',
            'community_project_reviewed'
        );

        return response()->json([
            'message' => 'Community project approved.',
            'data' => CommunityProjectResource::make($this->reload($project)),
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        $this->authorize('review', $project);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $project->update([
            'verification_status' => 'rejected',
            'verification_notes' => $validated['reason'],
            'rejection_reason' => $validated['reason'],
            'is_verified' => false,
            'is_featured' => false,
        ]);

        $this->recordVerification($project, $request->user(), 'rejected', $validated['reason']);
        $this->notifyOwner(
            $project,
            'Changes needed before approval',
            $project->title.' was rejected: '.$validated['reason'],
            'community_project_reviewed'
        );

        return response()->json([
            'message' => 'Community project rejected.',
            'data' => CommunityProjectResource::make($this->reload($project)),
        ]);
    }

    public function requestChanges(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        $this->authorize('review', $project);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $project->update([
            'verification_status' => 'changes_requested',
            'verification_notes' => $validated['reason'],
            'rejection_reason' => null,
            'is_verified' => false,
        ]);

        $this->recordVerification($project, $request->user(), 'changes_requested', $validated['reason']);
        $this->notifyOwner(
            $project,
            'Town Manager requested changes',
            $project->title.' needs updates before approval: '.$validated['reason'],
            'community_project_reviewed'
        );

        return response()->json([
            'message' => 'Change request sent to organiser.',
            'data' => CommunityProjectResource::make($this->reload($project)),
        ]);
    }

    public function feature(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        $this->authorize('review', $project);

        $validated = $request->validate([
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $project->update([
            'is_featured' => $validated['is_featured'] ?? ! $project->is_featured,
        ]);

        $this->recordVerification($project, $request->user(), 'featured', $project->is_featured ? 'Marked as featured.' : 'Removed from featured.');

        return response()->json([
            'message' => $project->is_featured ? 'Community project featured.' : 'Community project unfeatured.',
            'data' => CommunityProjectResource::make($this->reload($project)),
        ]);
    }

    public function status(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        $this->authorize('review', $project);

        $validated = $request->validate([
            'status' => ['required', 'in:draft,submitted,active,in_progress,needs_support,fully_funded,completed,archived'],
            'verification_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $project->update([
            'status' => $validated['status'],
            'completed_at' => $validated['status'] === 'completed' ? now() : $project->completed_at,
            'verification_notes' => $validated['verification_notes'] ?? $project->verification_notes,
        ]);

        $this->recordVerification($project, $request->user(), 'status_updated', $validated['verification_notes'] ?? 'Status updated.');
        $this->notifyOwner(
            $project,
            'Community project status updated',
            $project->title.' is now marked as '.str_replace('_', ' ', $validated['status']).'.',
            'community_project_reviewed'
        );

        return response()->json([
            'message' => 'Community project status updated.',
            'data' => CommunityProjectResource::make($this->reload($project)),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $project = CommunityProject::query()->whereKey($id)->firstOrFail();
        $this->authorize('review', $project);

        $project->delete();

        return response()->json(['message' => 'Community project deleted.']);
    }

    private function query(): Builder
    {
        return CommunityProject::query()
            ->with([
                'category',
                'user',
                'organization',
                'attachments',
                'updates' => fn ($builder) => $builder->latest()->with('user'),
                'verifications' => fn ($builder) => $builder->with('reviewer')->latest(),
            ])
            ->withCount(['pledges', 'followers']);
    }

    private function applyFilters(Builder $query, Request $request): void
    {
        if ($search = trim((string) $request->string('search')->value())) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('summary', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('reference_code', 'like', '%'.$search.'%');
            });
        }

        foreach (['status', 'verification_status', 'town', 'area'] as $filter) {
            if ($value = trim((string) $request->string($filter)->value())) {
                $query->where($filter, $value);
            }
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }
    }

    private function recordVerification(CommunityProject $project, User $reviewer, string $action, ?string $notes = null): void
    {
        CommunityProjectVerification::query()->create([
            'community_project_id' => $project->id,
            'reviewed_by' => $reviewer->id,
            'action' => $action,
            'notes' => $notes,
            'status_after' => $project->status,
            'verification_status_after' => $project->verification_status,
        ]);
    }

    private function notifyOwner(CommunityProject $project, string $title, string $body, string $type): void
    {
        $project->user?->notify(new SystemNotification($title, $body, [
            'type' => $type,
            'target' => [
                'id' => $project->slug,
                'title' => $project->title,
                'href' => '/get-involved/'.$project->slug,
            ],
        ]));
    }

    private function reload(CommunityProject $project): CommunityProject
    {
        return $project->fresh()->load([
            'category',
            'user',
            'organization',
            'attachments',
            'updates' => fn ($builder) => $builder->latest()->with('user'),
            'verifications' => fn ($builder) => $builder->with('reviewer')->latest(),
        ])->loadCount(['pledges', 'followers']);
    }
}
