<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AccommodationResource;
use App\Models\Accommodation;
use App\Support\PilotLocation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class AccommodationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Accommodation::query()->with(['business', 'user']);

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('type', 'like', '%'.$search.'%')
                    ->orWhere('location', 'like', '%'.$search.'%')
                    ->orWhere('town', 'like', '%'.$search.'%')
                    ->orWhere('area', 'like', '%'.$search.'%');
            });
        }

        foreach (['type', 'price_period', 'status', 'business_id', 'user_id'] as $filter) {
            if ($value = $request->string($filter)->value()) {
                $query->where($filter, $value);
            }
        }

        if ($value = PilotLocation::requestTown($request)) {
            $query->where('town', $value);
        }

        if ($value = PilotLocation::requestArea($request)) {
            $query->where('area', $value);
        }

        if ($minPrice = $request->input('min_price')) {
            $query->where('price', '>=', $minPrice);
        }

        if ($maxPrice = $request->input('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        if ($bedrooms = $request->input('bedrooms')) {
            $query->where('bedrooms', '>=', (int) $bedrooms);
        }

        if ($bathrooms = $request->input('bathrooms')) {
            $query->where('bathrooms', '>=', (int) $bathrooms);
        }

        if ($request->boolean('verified')) {
            $query->whereHas('business', fn ($builder) => $builder->where('is_verified', true));
        }

        match ($request->string('sort')->value()) {
            'price_low_high' => $query->orderBy('price'),
            'price_high_low' => $query->orderByDesc('price'),
            'popular' => $query->orderByDesc('price'),
            'recent',
            'recently_added',
            'newest' => $query->latest(),
            default => $query->latest(),
        };

        return AccommodationResource::collection($query->paginate((int) $request->integer('per_page', 12)));
    }

    public function show(Accommodation $accommodation): AccommodationResource
    {
        return AccommodationResource::make($accommodation->load(['business', 'user']));
    }

    public function store(Request $request): AccommodationResource
    {
        $validated = $request->validate([
            'business_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'type' => ['required', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'price_period' => ['required', 'string', 'max:20'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'location' => ['nullable', 'string', 'max:255'],
            'town' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('accommodation-images', 'public');
            $validated['image_path'] = Storage::disk('public')->url($path);
        }

        $accommodation = $request->user()->accommodations()->create($validated);

        return AccommodationResource::make($accommodation->load(['business', 'user']));
    }

    public function update(Request $request, Accommodation $accommodation): AccommodationResource
    {
        abort_unless($accommodation->user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']), 403);

        $validated = $request->validate([
            'business_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'type' => ['sometimes', 'string', 'max:50'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'price_period' => ['sometimes', 'string', 'max:20'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'location' => ['nullable', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('accommodation-images', 'public');
            $validated['image_path'] = Storage::disk('public')->url($path);
        }

        $accommodation->update($validated);

        return AccommodationResource::make($accommodation->fresh()->load(['business', 'user']));
    }
}
