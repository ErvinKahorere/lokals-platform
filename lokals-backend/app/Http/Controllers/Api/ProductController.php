<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Announcement;
use App\Models\Product;
use App\Support\CommerceAvailability;
use App\Support\PilotLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()->with(['business', 'user']);

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%');
            });
        }

        foreach (['category', 'status', 'stock_status', 'business_id', 'user_id'] as $filter) {
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

        if ($request->boolean('sale_items')) {
            $query->whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'price');
        }

        if ($request->boolean('verified_sellers')) {
            $query->where(function ($builder): void {
                $builder->whereHas('business', fn ($businessQuery) => $businessQuery->where('is_verified', true))
                    ->orWhereHas('user.roles', fn ($roleQuery) => $roleQuery->whereIn('name', ['seller', 'business_owner', 'organization_admin', 'super_admin']));
            });
        }

        if ($commerceCategory = $request->string('commerce_category')->value()) {
            $query->where(function ($builder) use ($commerceCategory): void {
                foreach ($this->commerceCategoryKeywords($commerceCategory) as $keyword) {
                    $builder->orWhere('category', 'like', '%'.$keyword.'%');
                }
            });
        }

        if ($request->boolean('open_now')) {
            $query->whereHas('business', function ($builder): void {
                $builder->whereNotIn('status', ['paused', 'closed']);
            });
        }

        if ($request->boolean('fast_delivery')) {
            $query->where(function ($builder): void {
                $builder->whereIn('category', ['food', 'groceries'])
                    ->orWhere('category', 'like', '%food%')
                    ->orWhere('category', 'like', '%grocery%')
                    ->orWhere('category', 'like', '%restaurant%');
            });
        }

        if ($request->boolean('featured_only')) {
            $query->where(function ($builder): void {
                $builder->whereNotNull('sale_price')
                    ->orWhereHas('business', fn ($businessQuery) => $businessQuery->where('is_verified', true));
            });
        }

        if ($request->boolean('popular_only')) {
            $query->where(function ($builder): void {
                $builder->whereHas('business', fn ($businessQuery) => $businessQuery->where('is_verified', true))
                    ->orWhereNotNull('sale_price');
            });
        }

        if ($priceMin = $request->input('price_min')) {
            $query->where('price', '>=', (float) $priceMin);
        }

        if ($priceMax = $request->input('price_max')) {
            $query->where('price', '<=', (float) $priceMax);
        }

        match ($request->string('sort')->value()) {
            'recent' => $query->latest(),
            'newest' => $query->latest(),
            'top_rated' => $query->orderByDesc('sale_price')->orderByDesc('created_at'),
            'fast_delivery' => $query->orderByRaw("case when lower(category) like '%food%' then 0 when lower(category) like '%grocery%' then 1 else 2 end")->latest(),
            'popular' => $query->orderByDesc('sale_price')->orderByDesc('price'),
            'price_low_high' => $query->orderBy('sale_price')->orderBy('price'),
            'price_high_low' => $query->orderByDesc('sale_price')->orderByDesc('price'),
            default => $query->orderByDesc('created_at'),
        };

        return ProductResource::collection($query->paginate((int) $request->integer('per_page', 12)));
    }

    public function show(Product $product): ProductResource
    {
        return ProductResource::make($product->load(['business', 'user']));
    }

    public function store(Request $request): ProductResource
    {
        $validated = $request->validate([
            'business_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'category' => ['nullable', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'stock_status' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('product-images', 'public');
            $validated['image_path'] = Storage::disk('public')->url($path);
        }

        $product = $request->user()->products()->create($validated);

        return ProductResource::make($product->load(['business', 'user']));
    }

    public function update(Request $request, Product $product): ProductResource
    {
        abort_unless($product->user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']), 403);

        $validated = $request->validate([
            'business_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'category' => ['nullable', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'stock_status' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('product-images', 'public');
            $validated['image_path'] = Storage::disk('public')->url($path);
        }

        $product->update($validated);

        return ProductResource::make($product->fresh()->load(['business', 'user']));
    }

    public function saleAlerts(Request $request): JsonResponse
    {
        $alerts = Announcement::query()
            ->where('status', 'published')
            ->when(PilotLocation::isLocked(), fn ($query) => $query->where('location', 'like', '%'.PilotLocation::town().'%'))
            ->where(function ($query): void {
                $query->where('title', 'like', '%sale%')
                    ->orWhere('title', 'like', '%promo%')
                    ->orWhere('body', 'like', '%sale%')
                    ->orWhere('body', 'like', '%discount%');
            })
            ->latest('published_at')
            ->limit((int) $request->integer('per_page', 8))
            ->get()
            ->map(fn (Announcement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'location' => $announcement->location,
                'published_at' => optional($announcement->published_at ?? $announcement->created_at)->toIso8601String(),
                'organization_id' => $announcement->organization_id,
            ]);

        return response()->json(['data' => $alerts]);
    }

    /**
     * @return array<int, string>
     */
    private function commerceCategoryKeywords(string $category): array
    {
        return match (CommerceAvailability::groupFor($category)) {
            'food' => ['food', 'restaurant', 'takeaway', 'bakery', 'cafe'],
            'groceries' => ['grocery', 'produce', 'supermarket', 'pharmacy'],
            'services' => ['service', 'repair', 'salon', 'clean'],
            default => ['electronics', 'home', 'clothing', 'shop', 'hardware', 'vehicle'],
        };
    }
}
