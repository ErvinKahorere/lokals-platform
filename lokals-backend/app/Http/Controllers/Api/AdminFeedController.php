<?php

namespace App\Http\Controllers\Api;

use App\Events\FeedPostSubmitted;
use App\Http\Controllers\Controller;
use App\Http\Resources\FeedPostResource;
use App\Models\FeedCategory;
use App\Models\FeedModerationLog;
use App\Models\FeedPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminFeedController extends Controller
{
    public function pending(): JsonResponse
    {
        return response()->json([
            'data' => FeedPostResource::collection(
                FeedPost::query()->with(['source', 'category'])->where('status', 'pending')->latest()->get()
            ),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'category_slug' => ['nullable', 'string', 'max:120'],
            'media_url' => ['nullable', 'string', 'max:255'],
            'external_url' => ['nullable', 'url', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'priority' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['nullable', 'in:draft,pending,approved,rejected,archived'],
            'is_featured' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ]);

        $category = null;
        if (! empty($validated['category_slug'])) {
            $category = FeedCategory::query()->where('slug', $validated['category_slug'])->first();
        }

        $post = FeedPost::query()->create([
            'title' => $validated['title'],
            'summary' => $validated['summary'] ?? null,
            'body' => $validated['body'] ?? null,
            'category_id' => $category?->id,
            'media_url' => $validated['media_url'] ?? null,
            'external_url' => $validated['external_url'] ?? null,
            'town' => $validated['town'] ?? null,
            'area' => $validated['area'] ?? null,
            'priority' => $validated['priority'] ?? 0,
            'status' => $validated['status'] ?? 'pending',
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'metadata' => [
                ...($validated['metadata'] ?? []),
                'admin_created' => true,
                'slug' => Str::slug($validated['title']),
            ],
        ]);

        $this->log($post, 'created', $post->status, $request->user()?->id, 'Feed post created in admin.');
        broadcast(new FeedPostSubmitted($post->fresh()));

        return response()->json(['data' => FeedPostResource::make($post->load(['source', 'category']))], 201);
    }

    public function approve(Request $request, FeedPost $feedPost): JsonResponse
    {
        $feedPost->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'published_at' => now(),
            'rejection_reason' => null,
        ]);
        $this->log($feedPost, 'approved', 'approved', $request->user()->id, $request->input('notes'));
        broadcast(new FeedPostSubmitted($feedPost->fresh()));

        return response()->json(['data' => FeedPostResource::make($feedPost->fresh()->load(['source', 'category']))]);
    }

    public function reject(Request $request, FeedPost $feedPost): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $feedPost->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
        ]);
        $this->log($feedPost, 'rejected', 'rejected', $request->user()->id, $validated['reason']);
        broadcast(new FeedPostSubmitted($feedPost->fresh()));

        return response()->json(['data' => FeedPostResource::make($feedPost->fresh()->load(['source', 'category']))]);
    }

    public function feature(Request $request, FeedPost $feedPost): JsonResponse
    {
        $feedPost->update([
            'is_featured' => (bool) $request->boolean('is_featured', true),
            'priority' => (int) $request->integer('priority', max(10, (int) $feedPost->priority)),
        ]);
        $this->log($feedPost, 'featured', $feedPost->status, $request->user()->id, $request->input('notes'));
        broadcast(new FeedPostSubmitted($feedPost->fresh()));

        return response()->json(['data' => FeedPostResource::make($feedPost->fresh()->load(['source', 'category']))]);
    }

    private function log(FeedPost $post, string $action, string $status, ?int $userId, ?string $notes): void
    {
        FeedModerationLog::query()->create([
            'feed_post_id' => $post->id,
            'action' => $action,
            'status' => $status,
            'notes' => $notes,
            'performed_by' => $userId,
        ]);
    }
}
