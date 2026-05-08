<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsItem;
use App\Models\NewsSource;
use App\Models\Organization;
use App\Services\NewsAggregationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsSourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            NewsSource::query()->latest()->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'website_url' => ['required', 'url', 'max:255'],
            'feed_url' => ['nullable', 'url', 'max:255'],
            'source_type' => ['required', 'in:publication,company,organization,municipality,media,rss,website'],
            'town' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $source = NewsSource::query()->create([
            ...$validated,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $source], 201);
    }

    public function update(Request $request, NewsSource $newsSource): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'website_url' => ['sometimes', 'url', 'max:255'],
            'feed_url' => ['nullable', 'url', 'max:255'],
            'source_type' => ['sometimes', 'in:publication,company,organization,municipality,media,rss,website'],
            'town' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $newsSource->update($validated);

        return response()->json(['data' => $newsSource->fresh()]);
    }

    public function fetch(NewsSource $newsSource, NewsAggregationService $service): JsonResponse
    {
        $items = $service->fetchSource($newsSource);

        return response()->json([
            'message' => 'News source fetched.',
            'count' => count($items),
        ]);
    }

    public function updateItem(Request $request, NewsItem $newsItem): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'is_featured' => ['nullable', 'boolean'],
            'is_hidden' => ['nullable', 'boolean'],
        ]);

        $newsItem->update($validated);

        return response()->json(['data' => $newsItem->fresh()]);
    }

    public function storeForOrganization(Request $request, Organization $organization): JsonResponse
    {
        abort_unless(
            $organization->owner_user_id === $request->user()->id || $request->user()->hasAnyRole(['organization_admin', 'super_admin', 'operator']),
            403
        );

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'website_url' => ['required', 'url', 'max:255'],
            'feed_url' => ['nullable', 'url', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
        ]);

        $source = NewsSource::query()->create([
            'name' => $validated['name'] ?? $organization->name,
            'website_url' => $validated['website_url'],
            'feed_url' => $validated['feed_url'] ?? null,
            'source_type' => 'organization',
            'town' => $validated['town'] ?? $organization->town,
            'region' => $validated['region'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Official news source added.',
            'data' => $source,
        ], 201);
    }
}
