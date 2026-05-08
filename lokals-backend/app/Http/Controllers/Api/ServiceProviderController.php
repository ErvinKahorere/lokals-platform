<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceProvider\StoreAvailabilityRequest;
use App\Http\Requests\ServiceProvider\StoreProviderRequest;
use App\Http\Requests\ServiceProvider\StoreServiceRequest;
use App\Http\Resources\AvailabilitySlotResource;
use App\Http\Resources\BookingResource;
use App\Http\Resources\ServiceProviderResource;
use App\Http\Resources\ServiceResource;
use App\Models\AvailabilitySlot;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceProviderController extends Controller
{
    public function __construct(private readonly MatchingService $matchingService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $providers = $this->matchingService->matchProviders($request->only([
            'search',
            'category',
            'subcategory',
            'location',
            'town',
            'area',
            'verified',
            'bookable',
            'open_now',
            'min_price',
            'max_price',
            'day_of_week',
            'lat',
            'lng',
            'radius_km',
            'sort',
            'per_page',
        ]));

        return ServiceProviderResource::collection($providers);
    }

    public function show(ServiceProvider $serviceProvider): ServiceProviderResource
    {
        return ServiceProviderResource::make(
            $serviceProvider
                ->load(['organization.announcements', 'services', 'availabilitySlots'])
                ->loadCount('followers')
        );
    }

    public function services(ServiceProvider $serviceProvider): AnonymousResourceCollection
    {
        return ServiceResource::collection($serviceProvider->services()->where('is_active', true)->get());
    }

    public function storeService(StoreServiceRequest $request): ServiceResource
    {
        $provider = ServiceProvider::findOrFail($request->integer('service_provider_id'));
        $this->authorize('manage', $provider);

        $service = Service::create($request->validated());

        return ServiceResource::make($service);
    }

    public function storeProvider(StoreProviderRequest $request): ServiceProviderResource
    {
        $provider = ServiceProvider::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'is_verified' => false,
        ]);

        $request->user()->syncRoles(array_unique([...$request->user()->getRoleNames()->all(), 'service_provider']));

        return ServiceProviderResource::make($provider->load('services'));
    }

    public function updateProvider(StoreProviderRequest $request, ServiceProvider $serviceProvider): ServiceProviderResource
    {
        $this->authorize('manage', $serviceProvider);
        $serviceProvider->update($request->validated());

        return ServiceProviderResource::make($serviceProvider->fresh()->load(['organization', 'services', 'availabilitySlots']));
    }

    public function availability(ServiceProvider $serviceProvider): AnonymousResourceCollection
    {
        return AvailabilitySlotResource::collection($serviceProvider->availabilitySlots()->get());
    }

    public function storeAvailability(StoreAvailabilityRequest $request): AvailabilitySlotResource
    {
        $provider = ServiceProvider::findOrFail($request->integer('service_provider_id'));
        $this->authorize('manage', $provider);

        $slot = AvailabilitySlot::create([
            ...$request->validated(),
            'start_time' => $request->start_time.':00',
            'end_time' => $request->end_time.':00',
        ]);

        return AvailabilitySlotResource::make($slot);
    }

    public function providerBookings(Request $request): AnonymousResourceCollection
    {
        $bookings = $request->user()->hasAnyRole(['operator', 'super_admin'])
            ? \App\Models\Booking::query()->with(['user', 'service', 'serviceProvider'])->latest()
            : \App\Models\Booking::query()
                ->with(['user', 'service', 'serviceProvider'])
                ->whereHas('serviceProvider', fn ($query) => $query->where('user_id', $request->user()->id))
                ->latest();

        return BookingResource::collection(
            $bookings->paginate((int) $request->integer('per_page', 12))
        );
    }
}
