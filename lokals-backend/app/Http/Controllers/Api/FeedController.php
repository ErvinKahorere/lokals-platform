<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedCategoryResource;
use App\Http\Resources\FeedPostResource;
use App\Models\FeedCategory;
use App\Models\FeedPost;
use App\Services\FeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function __construct(
        private readonly FeedService $feedService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $items = $this->feedService->publicFeed($request, $request->user());
        $items->setCollection($items->getCollection()->load(['source', 'category']));

        return response()->json([
            'data' => FeedPostResource::collection($items->getCollection())->resolve(),
            'current_page' => $items->currentPage(),
            'last_page' => $items->lastPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
        ]);
    }

    public function show(Request $request, FeedPost $feedPost): FeedPostResource
    {
        abort_if($feedPost->status !== 'approved' && ! $request->user()?->hasTownManagerAccess(), 404);

        if ($request->user()) {
            $this->feedService->recordInteraction($request->user(), $feedPost, 'viewed');
        }

        return FeedPostResource::make($feedPost->load(['source', 'category']));
    }

    public function save(Request $request, FeedPost $feedPost): JsonResponse
    {
        $this->feedService->savePost($request->user(), $feedPost);

        return response()->json(['message' => 'Feed post saved.'], 201);
    }

    public function hide(Request $request, FeedPost $feedPost): JsonResponse
    {
        $this->feedService->hidePost($request->user(), $feedPost);

        return response()->json(['message' => 'Feed post hidden.']);
    }

    public function report(Request $request, FeedPost $feedPost): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $this->feedService->reportPost($request->user(), $feedPost, $validated['reason'] ?? null);

        return response()->json(['message' => 'Feed post reported for review.'], 201);
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => FeedCategoryResource::collection(
                FeedCategory::query()->where('is_active', true)->orderByDesc('priority')->get()
            ),
        ]);
    }

    public function preferences(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->feedService->ensurePreference($request->user()),
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'max:80'],
            'hidden_category_ids' => ['nullable', 'array'],
            'hidden_category_ids.*' => ['integer'],
            'muted_source_ids' => ['nullable', 'array'],
            'muted_source_ids.*' => ['integer'],
            'preferred_town' => ['nullable', 'string', 'max:255'],
            'preferred_area' => ['nullable', 'string', 'max:255'],
            'prioritize_followed_organizations' => ['nullable', 'boolean'],
        ]);

        $preference = $this->feedService->ensurePreference($request->user());
        $preference->update($validated);

        return response()->json(['data' => $preference->fresh()]);
    }
}
