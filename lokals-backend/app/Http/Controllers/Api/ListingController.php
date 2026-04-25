<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Listing\StoreListingRequest;
use App\Http\Requests\Listing\UpdateListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use App\Services\LocationService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{
    public function __construct(private readonly LocationService $locationService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Listing::query()->latest()->with('user');

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('type', 'like', '%'.$search.'%');
            });
        }

        if ($type = $request->string('type')->value()) {
            $query->where('type', $type);
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        $perPage = (int) $request->integer('per_page', 12);
        $items = $query->get()->filter(function (Listing $listing) use ($request): bool {
            if (! $request->filled('lat') || ! $request->filled('lng') || ! $request->filled('radius_km')) {
                return true;
            }

            $distance = $this->locationService->distanceKm(
                (float) $request->input('lat'),
                (float) $request->input('lng'),
                $listing->lat,
                $listing->lng,
            );

            $listing->distance_km = $distance;

            return $distance !== null && $distance <= (float) $request->input('radius_km');
        })->values();

        return ListingResource::collection(
            app(\App\Services\QueryService::class)->paginateCollection($items, $perPage)
        );
    }

    public function show(Listing $listing): ListingResource
    {
        return ListingResource::make($listing->load(['user', 'organization']));
    }

    public function store(StoreListingRequest $request): ListingResource
    {
        $validated = $request->safe()->except('image');
        $metadata = is_array($validated['metadata'] ?? null) ? $validated['metadata'] : [];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('listing-images', 'public');
            $metadata['image_url'] = Storage::disk('public')->url($path);
        }

        $validated['metadata'] = $metadata;
        $listing = $request->user()->listings()->create($validated);

        return ListingResource::make($listing->load('user'));
    }

    public function update(UpdateListingRequest $request, Listing $listing): ListingResource
    {
        $this->authorize('update', $listing);
        $validated = $request->safe()->except('image');
        $metadata = [
            ...($listing->metadata ?? []),
            ...(is_array($validated['metadata'] ?? null) ? $validated['metadata'] : []),
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('listing-images', 'public');
            $metadata['image_url'] = Storage::disk('public')->url($path);
        }

        $validated['metadata'] = $metadata;
        $listing->update($validated);

        return ListingResource::make($listing->fresh()->load('user'));
    }

    public function mine(Request $request): AnonymousResourceCollection
    {
        return ListingResource::collection(
            $request->user()->listings()->latest()->paginate((int) $request->integer('per_page', 12))
        );
    }
}
