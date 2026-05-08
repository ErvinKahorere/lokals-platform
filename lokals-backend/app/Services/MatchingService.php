<?php

namespace App\Services;

use App\Models\ServiceProvider;
use App\Support\PilotLocation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class MatchingService
{
    public function __construct(
        private readonly LocationService $locationService,
        private readonly QueryService $queryService,
    )
    {
    }

    public function matchProviders(array $filters = []): LengthAwarePaginator
    {
        $query = ServiceProvider::query()
            ->with(['organization', 'services', 'availabilitySlots'])
            ->withCount('followers')
            ->where('status', 'active');

        if ($search = $filters['search'] ?? null) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%');
            });
        }

        if ($category = $filters['category'] ?? null) {
            $query->where('category', $category);
        }

        if ($subcategory = $filters['subcategory'] ?? null) {
            $query->whereHas('organization', fn (Builder $builder) => $builder->where('subcategory', $subcategory));
        }

        if ($location = $filters['location'] ?? null) {
            $query->where('location', 'like', '%'.$location.'%');
        }

        $town = PilotLocation::isLocked() ? PilotLocation::town() : ($filters['town'] ?? null);
        $area = PilotLocation::normalizeArea($filters['area'] ?? null);

        if ($town) {
            $query->whereHas('organization', fn (Builder $builder) => $builder->where('town', $town));
        }

        if ($area) {
            $query->whereHas('organization', fn (Builder $builder) => $builder->where('area', $area));
        }

        if (! empty($filters['verified'])) {
            $query->where('is_verified', true);
        }

        if (! empty($filters['bookable'])) {
            $query->whereHas('services', fn (Builder $builder) => $builder
                ->where('is_active', true)
                ->where('is_bookable', true));
        }

        if (($minPrice = $filters['min_price'] ?? null) !== null) {
            $query->whereHas('services', fn (Builder $builder) => $builder->where('price', '>=', $minPrice));
        }

        if (($maxPrice = $filters['max_price'] ?? null) !== null) {
            $query->whereHas('services', fn (Builder $builder) => $builder->where('price', '<=', $maxPrice));
        }

        if (($availableDay = $filters['day_of_week'] ?? null) !== null) {
            $query->whereHas('availabilitySlots', function (Builder $builder) use ($availableDay): void {
                $builder->where('day_of_week', $availableDay)->where('is_available', true);
            });
        }

        $userLat = isset($filters['lat']) ? (float) $filters['lat'] : null;
        $userLng = isset($filters['lng']) ? (float) $filters['lng'] : null;
        $radiusKm = isset($filters['radius_km']) ? (float) $filters['radius_km'] : null;
        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 12;
        $sort = $filters['sort'] ?? 'nearest';

        $items = $query->get()->map(function (ServiceProvider $provider) use ($userLat, $userLng) {
            $provider->distance_km = $this->locationService->distanceKm(
                $userLat,
                $userLng,
                $provider->lat,
                $provider->lng,
            );

            $provider->starting_price = $provider->services
                ->where('is_active', true)
                ->sortBy('price')
                ->first()?->price;

            return $provider;
        })->filter(function (ServiceProvider $provider) use ($filters): bool {
            if (! empty($filters['open_now'])) {
                return $provider->availabilitySlots->where('is_available', true)->isNotEmpty();
            }

            return true;
        })->filter(function (ServiceProvider $provider) use ($radiusKm): bool {
            if ($radiusKm === null) {
                return true;
            }

            return $provider->distance_km !== null && $provider->distance_km <= $radiusKm;
        });

        $items = (match ($sort) {
            'recent' => $items->sortByDesc('created_at'),
            'popular' => $items->sortByDesc(fn (ServiceProvider $provider) => ($provider->followers_count ?? 0) + $provider->services->count()),
            'open' => $items->sortByDesc(fn (ServiceProvider $provider) => $provider->availabilitySlots->where('is_available', true)->count()),
            'top_rated' => $items->sortByDesc(fn (ServiceProvider $provider) => ($provider->followers_count ?? 0) + ($provider->is_verified ? 10 : 0)),
            'price_low' => $items->sortBy(fn (ServiceProvider $provider) => $provider->starting_price ?? PHP_FLOAT_MAX),
            default => $items->sortBy(fn (ServiceProvider $provider) => $provider->distance_km ?? PHP_FLOAT_MAX),
        })->values();

        return $this->queryService->paginateCollection($items, $perPage);
    }
}
