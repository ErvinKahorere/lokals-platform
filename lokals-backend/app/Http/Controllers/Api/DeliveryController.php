<?php

namespace App\Http\Controllers\Api;

use App\Events\DeliveryRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\CourierProfile;
use App\Models\DeliveryRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->deliveryRequests()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();

        if ($request->user()->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin'])) {
            $query = DeliveryRequest::query()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();
        } elseif ($request->user()->hasRole('courier')) {
            $query = DeliveryRequest::query()
                ->with(['user:id,name,phone', 'driver:id,name,phone'])
                ->where(function ($builder) use ($request): void {
                    $builder->where('driver_id', $request->user()->id)
                        ->orWhereIn('status', ['requested', 'searching']);
                })
                ->latest();
        }

        return response()->json($query->get());
    }

    public function show(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless(
            $delivery->user_id === $request->user()->id
            || $delivery->driver_id === $request->user()->id
            || $request->user()->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin']),
            403,
        );

        return response()->json([
            'data' => $delivery->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
    }

    public function estimate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'parcel_size' => ['nullable', 'string', 'max:60'],
            'urgency' => ['nullable', 'string', 'max:40'],
            'weight_kg' => ['nullable', 'numeric'],
        ]);

        $base = match (strtolower((string) ($validated['parcel_size'] ?? 'medium'))) {
            'small' => 45,
            'large' => 110,
            default => 72,
        };
        $urgency = strtolower((string) ($validated['urgency'] ?? 'standard'));
        if ($urgency === 'express') {
            $base += 25;
        }

        return response()->json([
            'data' => [
                'estimated_price' => $base,
                'estimated_distance_km' => 5.3,
                'estimated_duration_minutes' => 18,
            ],
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        $delivery = DeliveryRequest::query()
            ->with(['user:id,name,phone', 'driver:id,name,phone'])
            ->where(function ($query) use ($request): void {
                $query->where('user_id', $request->user()->id)
                    ->orWhere('driver_id', $request->user()->id);
            })
            ->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit'])
            ->latest()
            ->first();

        return response()->json(['data' => $delivery]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pickup_address' => ['nullable', 'string', 'required_without:pickup_location'],
            'pickup_location' => ['nullable', 'string', 'required_without:pickup_address'],
            'dropoff_address' => ['nullable', 'string', 'required_without:dropoff_location'],
            'dropoff_location' => ['nullable', 'string', 'required_without:dropoff_address'],
            'item_description' => ['nullable', 'string', 'required_without:parcel_description'],
            'parcel_description' => ['nullable', 'string', 'required_without:item_description'],
            'parcel_size' => ['nullable', 'string', 'max:60'],
            'weight_kg' => ['nullable', 'numeric'],
            'urgency' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric'],
            'estimated_price' => ['nullable', 'numeric'],
            'photo' => ['nullable', 'image', 'max:6144'],
        ]);

        $payload = [
            'pickup_address' => $validated['pickup_address'] ?? $validated['pickup_location'] ?? null,
            'pickup_location' => $validated['pickup_location'] ?? $validated['pickup_address'] ?? null,
            'dropoff_address' => $validated['dropoff_address'] ?? $validated['dropoff_location'] ?? null,
            'dropoff_location' => $validated['dropoff_location'] ?? $validated['dropoff_address'] ?? null,
            'item_description' => $validated['item_description'] ?? $validated['parcel_description'] ?? null,
            'parcel_description' => $validated['parcel_description'] ?? $validated['item_description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'parcel_size' => $validated['parcel_size'] ?? 'medium',
            'weight_kg' => $validated['weight_kg'] ?? null,
            'urgency' => $validated['urgency'] ?? 'standard',
            'price' => $validated['price'] ?? $validated['estimated_price'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? $validated['price'] ?? 72,
            'status' => 'requested',
        ];

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('delivery-photos', 'public');
            $payload['photo_url'] = Storage::disk('public')->url($path);
        }

        $delivery = $request->user()->deliveryRequests()->create($payload);
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load(['user:id,name,phone,default_town', 'driver:id,name,phone']),
            $this->courierAudienceIdsForTown($request->user()->default_town),
            $request->user()->default_town
        ));

        return response()->json([
            'data' => $delivery->load(['user:id,name,phone', 'driver:id,name,phone']),
        ], 201);
    }

    public function cancel(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless(
            $delivery->user_id === $request->user()->id || $delivery->driver_id === $request->user()->id,
            403,
        );
        $validated = $request->validate(['reason' => ['nullable', 'string', 'max:255']]);

        $delivery->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $validated['reason'] ?? null,
        ]);
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load(['user:id,name,phone,default_town', 'driver:id,name,phone']),
            [],
            $delivery->user?->default_town
        ));

        return response()->json([
            'message' => 'Delivery cancelled.',
            'data' => $delivery->fresh()->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
    }

    public function rate(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($delivery->user_id === $request->user()->id, 403);
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $delivery->update([
            'rating' => $validated['rating'],
            'rating_comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Courier rating saved.',
            'data' => $delivery->fresh(),
        ]);
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);
        $validated = $request->validate(['is_online' => ['required', 'boolean']]);

        $profile = CourierProfile::query()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['is_online' => $validated['is_online']]
        );

        return response()->json([
            'message' => $validated['is_online'] ? 'Courier is now online.' : 'Courier is now offline.',
            'data' => $profile,
        ]);
    }

    public function courierRequests(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);

        return response()->json([
            'data' => DeliveryRequest::query()
                ->with(['user:id,name,phone'])
                ->whereIn('status', ['requested', 'searching'])
                ->latest()
                ->paginate((int) $request->integer('per_page', 20)),
        ]);
    }

    public function accept(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);
        abort_unless(in_array($delivery->status, ['requested', 'searching'], true), 422, 'Delivery can no longer be accepted.');

        $delivery->update([
            'driver_id' => $request->user()->id,
            'status' => 'accepted',
            'assigned_at' => now(),
        ]);
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load(['user:id,name,phone,default_town', 'driver:id,name,phone']),
            [],
            $delivery->user?->default_town
        ));

        return response()->json([
            'message' => 'Delivery accepted.',
            'data' => $delivery->fresh()->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
    }

    public function decline(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load(['user:id,name,phone,default_town', 'driver:id,name,phone']),
            [],
            $delivery->user?->default_town
        ));

        return response()->json([
            'message' => 'Delivery declined.',
            'data' => $delivery->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
    }

    public function pickupConfirmed(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($delivery->driver_id === $request->user()->id, 403);
        $delivery->update(['status' => 'pickup_confirmed', 'picked_up_at' => now()]);
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load(['user:id,name,phone,default_town', 'driver:id,name,phone']),
            [],
            $delivery->user?->default_town
        ));

        return response()->json(['data' => $delivery->fresh()->load(['user:id,name,phone', 'driver:id,name,phone'])]);
    }

    public function inTransit(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($delivery->driver_id === $request->user()->id, 403);
        $delivery->update(['status' => 'in_transit', 'in_transit_at' => now()]);
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load(['user:id,name,phone,default_town', 'driver:id,name,phone']),
            [],
            $delivery->user?->default_town
        ));

        return response()->json(['data' => $delivery->fresh()->load(['user:id,name,phone', 'driver:id,name,phone'])]);
    }

    public function delivered(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($delivery->driver_id === $request->user()->id, 403);
        $delivery->update(['status' => 'delivered', 'delivered_at' => now()]);

        $profile = CourierProfile::query()->where('user_id', $request->user()->id)->first();
        if ($profile) {
            $profile->increment('completed_deliveries');
            $profile->increment('lifetime_earnings', (float) ($delivery->estimated_price ?? $delivery->price ?? 0));
        }
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load(['user:id,name,phone,default_town', 'driver:id,name,phone']),
            [],
            $delivery->user?->default_town
        ));

        return response()->json(['data' => $delivery->fresh()->load(['user:id,name,phone', 'driver:id,name,phone'])]);
    }

    public function deliveries(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);

        return response()->json([
            'data' => DeliveryRequest::query()
                ->with(['user:id,name,phone'])
                ->where('driver_id', $request->user()->id)
                ->latest()
                ->paginate((int) $request->integer('per_page', 20)),
        ]);
    }

    public function earnings(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);
        $deliveries = DeliveryRequest::query()->where('driver_id', $request->user()->id)->where('status', 'delivered');

        return response()->json([
            'data' => [
                'today' => number_format((float) (clone $deliveries)->whereDate('delivered_at', today())->sum('estimated_price'), 2, '.', ''),
                'this_week' => number_format((float) (clone $deliveries)->whereBetween('delivered_at', [now()->startOfWeek(), now()->endOfWeek()])->sum('estimated_price'), 2, '.', ''),
                'lifetime' => number_format((float) (clone $deliveries)->sum('estimated_price'), 2, '.', ''),
            ],
        ]);
    }

    /**
     * @return array<int, int>
     */
    private function courierAudienceIdsForTown(?string $town): array
    {
        return User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'courier'))
            ->when($town, fn ($query) => $query->where('default_town', $town))
            ->pluck('id')
            ->all();
    }
}
