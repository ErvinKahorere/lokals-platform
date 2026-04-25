<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Models\Announcement;
use App\Models\Follow;
use App\Models\Organization;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrganizationController extends Controller
{
    public function __construct(private readonly LocationService $locationService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Organization::query()->withCount('followers')->latest();

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%');
            });
        }

        if ($category = $request->string('category')->value()) {
            $query->where('category', $category);
        }

        foreach (['town', 'area', 'subcategory'] as $filter) {
            if ($value = $request->string($filter)->value()) {
                $query->where($filter, $value);
            }
        }

        if ($request->boolean('public_service')) {
            $query->where('is_public_service', true);
        }

        if ($request->boolean('verified')) {
            $query->where('is_verified', true);
        }

        $items = $query->get()->filter(function (Organization $organization) use ($request): bool {
            if (! $request->filled('lat') || ! $request->filled('lng') || ! $request->filled('radius_km')) {
                return true;
            }

            $distance = $this->locationService->distanceKm(
                (float) $request->input('lat'),
                (float) $request->input('lng'),
                $organization->lat,
                $organization->lng,
            );

            $organization->distance_km = $distance;

            return $distance !== null && $distance <= (float) $request->input('radius_km');
        });

        $sort = $request->string('sort')->value();
        $items = match ($sort) {
            'popular' => $items->sortByDesc('followers_count'),
            'recent' => $items->sortByDesc('created_at'),
            default => $items->sortBy(fn (Organization $organization) => $organization->distance_km ?? PHP_FLOAT_MAX),
        };
        $items = $items->values();

        return OrganizationResource::collection(
            app(\App\Services\QueryService::class)->paginateCollection($items, (int) $request->integer('per_page', 12))
        );
    }

    public function show(Organization $organization): OrganizationResource
    {
        return OrganizationResource::make($organization->load(['serviceProviders.services', 'services'])->loadCount('followers'));
    }

    public function alerts(Organization $organization): JsonResponse
    {
        return response()->json([
            'data' => Announcement::query()
                ->where('organization_id', $organization->id)
                ->latest('published_at')
                ->get(),
        ]);
    }

    public function follow(Request $request, Organization $organization): JsonResponse
    {
        $follow = Follow::firstOrCreate([
            'user_id' => $request->user()->id,
            'followable_type' => Organization::class,
            'followable_id' => $organization->id,
        ]);

        return response()->json($follow, 201);
    }
}
