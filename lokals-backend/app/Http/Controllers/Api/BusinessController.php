<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Models\Announcement;
use App\Models\Booking;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Service;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class BusinessController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return OrganizationResource::collection(
            Organization::query()
                ->where('owner_user_id', $request->user()->id)
                ->latest()
                ->paginate((int) $request->integer('per_page', 12))
        );
    }

    public function store(Request $request): OrganizationResource
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'subcategory' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'location' => ['nullable', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'opening_hours' => ['nullable', 'array'],
            'services_offered' => ['nullable', 'array'],
            'rates' => ['nullable', 'array'],
            'is_public_service' => ['nullable', 'boolean'],
            'emergency_contact' => ['nullable', 'boolean'],
        ]);

        $organization = Organization::create([
            ...$validated,
            'owner_user_id' => $request->user()->id,
            'is_verified' => false,
            'status' => 'active',
        ]);

        return OrganizationResource::make($organization);
    }

    public function update(Request $request, Organization $organization): OrganizationResource
    {
        abort_unless($organization->owner_user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']), 403);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:255'],
            'subcategory' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'location' => ['nullable', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'opening_hours' => ['nullable', 'array'],
            'services_offered' => ['nullable', 'array'],
            'rates' => ['nullable', 'array'],
            'is_public_service' => ['nullable', 'boolean'],
            'emergency_contact' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $organization->update($validated);

        return OrganizationResource::make($organization->fresh());
    }

    public function uploadLogo(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($organization->owner_user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']), 403);

        $request->validate([
            'logo' => ['required', 'image', 'max:5120'],
        ]);

        $path = $request->file('logo')->store('organization-logos', 'public');
        $logoUrl = Storage::disk('public')->url($path);
        $organization->update(['logo_url' => $logoUrl]);

        return response()->json([
            'message' => 'Logo uploaded.',
            'logo_url' => $logoUrl,
            'business' => OrganizationResource::make($organization->fresh()),
        ]);
    }

    public function followers(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($organization->owner_user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']), 403);

        return response()->json([
            'data' => $organization->followers()->latest()->get(['id', 'user_id', 'created_at']),
            'count' => $organization->followers()->count(),
        ]);
    }

    public function alerts(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($organization->owner_user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $announcement = Announcement::create([
            'organization_id' => $organization->id,
            'title' => $validated['title'],
            'body' => $validated['body'],
            'location' => $validated['location'] ?? $organization->location,
            'published_at' => now(),
            'status' => $validated['status'] ?? 'published',
        ]);

        return response()->json([
            'message' => 'Business alert published.',
            'alert' => $announcement,
        ], 201);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $businesses = Organization::query()
            ->where('owner_user_id', $request->user()->id)
            ->withCount('followers')
            ->get();

        $businessIds = $businesses->pluck('id');
        $providerIds = ServiceProvider::query()
            ->where('user_id', $request->user()->id)
            ->orWhereIn('organization_id', $businessIds)
            ->pluck('id');

        return response()->json([
            'stats' => [
                'followers' => $businesses->sum('followers_count'),
                'views' => ($businesses->count() * 24) + Product::query()->where('user_id', $request->user()->id)->count() * 8,
                'contacts' => Product::query()->where('user_id', $request->user()->id)->count() + Service::query()->whereIn('organization_id', $businessIds)->count(),
                'bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->count(),
                'products' => Product::query()->where('user_id', $request->user()->id)->count(),
                'services' => Service::query()->whereIn('organization_id', $businessIds)->orWhereIn('service_provider_id', $providerIds)->count(),
                'alerts_sent' => Announcement::query()->whereIn('organization_id', $businessIds)->count(),
                'profile_completion' => min(100, 40 + ($businesses->count() * 10) + (Service::query()->whereIn('organization_id', $businessIds)->count() * 5)),
            ],
            'businesses' => OrganizationResource::collection($businesses),
            'products' => Product::query()->where('user_id', $request->user()->id)->latest()->limit(6)->get(),
            'services' => Service::query()->whereIn('organization_id', $businessIds)->orWhereIn('service_provider_id', $providerIds)->latest()->limit(6)->get(),
            'bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->latest()->limit(6)->get(),
            'alerts' => Announcement::query()->whereIn('organization_id', $businessIds)->latest('published_at')->limit(6)->get(),
        ]);
    }
}
