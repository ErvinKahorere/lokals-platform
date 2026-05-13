<?php

namespace App\Http\Controllers\Api;

use App\Events\DeliveryRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\CourierProfile;
use App\Models\DeliveryRequest;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->deliveryRequests()->with($this->deliveryRelations())->latest();

        if ($request->user()->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin'])) {
            $query = DeliveryRequest::query()->with($this->deliveryRelations())->latest();
        } elseif ($request->user()->hasRole('courier')) {
            $query = DeliveryRequest::query()
                ->with($this->deliveryRelations())
                ->where(function ($builder) use ($request): void {
                    $builder->where('driver_id', $request->user()->id)
                        ->orWhereIn('status', ['requested', 'searching', 'accepted']);
                })
                ->latest();
        }

        return response()->json(
            $query->get()->map(fn (DeliveryRequest $delivery) => $this->serializeDelivery($delivery)),
        );
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
            'data' => $this->serializeDelivery($delivery),
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
            ->with($this->deliveryRelations())
            ->where(function ($query) use ($request): void {
                $query->where('user_id', $request->user()->id)
                    ->orWhere('driver_id', $request->user()->id);
            })
            ->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit'])
            ->latest()
            ->first();

        return response()->json(['data' => $delivery ? $this->serializeDelivery($delivery) : null]);
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
        $delivery->refresh();
        $request->user()->notify(new SystemNotification(
            'Delivery request submitted',
            'We are matching your parcel with a nearby courier.',
            [
                'target' => [
                    'type' => 'delivery',
                    'id' => $delivery->id,
                    'href' => '/delivery/'.$delivery->id,
                    'title' => 'Delivery '.$this->referenceCode($delivery->id, 'DEL'),
                ],
            ],
        ));
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load($this->deliveryRelations()),
            $this->courierAudienceIdsForTown($request->user()->default_town),
            $request->user()->default_town
        ));

        return response()->json([
            'data' => $this->serializeDelivery($delivery),
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
        $delivery->user?->notify(new SystemNotification(
            'Delivery cancelled',
            'Your delivery request has been cancelled.',
            [
                'target' => [
                    'type' => 'delivery',
                    'id' => $delivery->id,
                    'href' => '/delivery/'.$delivery->id,
                    'title' => 'Delivery '.$this->referenceCode($delivery->id, 'DEL'),
                ],
            ],
        ));
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load($this->deliveryRelations()),
            [],
            $delivery->user?->default_town
        ));

        return response()->json([
            'message' => 'Delivery cancelled.',
            'data' => $this->serializeDelivery($delivery),
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
            'data' => $this->serializeDelivery($delivery),
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
                ->with($this->deliveryRelations())
                ->whereIn('status', ['requested', 'searching'])
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
                ->through(fn (DeliveryRequest $delivery) => $this->serializeDelivery($delivery)),
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
        $delivery->user?->notify(new SystemNotification(
            'Courier assigned',
            $request->user()->name.' is now on your delivery request.',
            [
                'target' => [
                    'type' => 'delivery',
                    'id' => $delivery->id,
                    'href' => '/delivery/'.$delivery->id,
                    'title' => 'Delivery '.$this->referenceCode($delivery->id, 'DEL'),
                ],
            ],
        ));
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load($this->deliveryRelations()),
            [],
            $delivery->user?->default_town
        ));

        return response()->json([
            'message' => 'Delivery accepted.',
            'data' => $this->serializeDelivery($delivery),
        ]);
    }

    public function decline(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load($this->deliveryRelations()),
            [],
            $delivery->user?->default_town
        ));

        return response()->json([
            'message' => 'Delivery declined.',
            'data' => $this->serializeDelivery($delivery),
        ]);
    }

    public function pickupConfirmed(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($delivery->driver_id === $request->user()->id, 403);
        $delivery->update(['status' => 'pickup_confirmed', 'picked_up_at' => now()]);
        $delivery->user?->notify(new SystemNotification(
            'Parcel collected',
            'Your courier has confirmed pickup and is preparing delivery.',
            [
                'target' => [
                    'type' => 'delivery',
                    'id' => $delivery->id,
                    'href' => '/delivery/'.$delivery->id,
                    'title' => 'Delivery '.$this->referenceCode($delivery->id, 'DEL'),
                ],
            ],
        ));
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load($this->deliveryRelations()),
            [],
            $delivery->user?->default_town
        ));

        return response()->json(['data' => $this->serializeDelivery($delivery)]);
    }

    public function inTransit(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless($delivery->driver_id === $request->user()->id, 403);
        $delivery->update(['status' => 'in_transit', 'in_transit_at' => now()]);
        $delivery->user?->notify(new SystemNotification(
            'Delivery in transit',
            'Your parcel is now on the way to the destination.',
            [
                'target' => [
                    'type' => 'delivery',
                    'id' => $delivery->id,
                    'href' => '/delivery/'.$delivery->id,
                    'title' => 'Delivery '.$this->referenceCode($delivery->id, 'DEL'),
                ],
            ],
        ));
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load($this->deliveryRelations()),
            [],
            $delivery->user?->default_town
        ));

        return response()->json(['data' => $this->serializeDelivery($delivery)]);
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
        $delivery->user?->notify(new SystemNotification(
            'Delivery completed',
            'Your parcel has been marked delivered. You can now rate the courier.',
            [
                'target' => [
                    'type' => 'delivery',
                    'id' => $delivery->id,
                    'href' => '/delivery/'.$delivery->id,
                    'title' => 'Delivery '.$this->referenceCode($delivery->id, 'DEL'),
                ],
            ],
        ));
        broadcast(new DeliveryRequestUpdated(
            $delivery->fresh()->load($this->deliveryRelations()),
            [],
            $delivery->user?->default_town
        ));

        return response()->json(['data' => $this->serializeDelivery($delivery)]);
    }

    public function deliveries(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier'), 403);

        return response()->json([
            'data' => DeliveryRequest::query()
                ->with($this->deliveryRelations())
                ->where('driver_id', $request->user()->id)
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
                ->through(fn (DeliveryRequest $delivery) => $this->serializeDelivery($delivery)),
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

    /**
     * @return array<int, string>
     */
    private function deliveryRelations(): array
    {
        return [
            'user:id,name,phone,default_town,avatar',
            'driver:id,name,phone,avatar',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDelivery(DeliveryRequest $delivery): array
    {
        $delivery->loadMissing($this->deliveryRelations());
        $payload = $delivery->toArray();
        $courierProfile = null;

        if ($delivery->driver_id) {
            $profile = CourierProfile::query()
                ->where('user_id', $delivery->driver_id)
                ->first(['vehicle_type', 'vehicle_registration', 'rating', 'is_online', 'is_verified']);

            if ($profile) {
                $courierProfile = $profile->toArray();
            }
        }

        $payload['reference_code'] = $this->referenceCode($delivery->id, 'DEL');
        $payload['status_label'] = $this->statusLabel((string) ($delivery->status ?? 'requested'));
        $payload['tracking_status'] = $delivery->status === 'accepted' ? 'courier_assigned' : $delivery->status;
        $payload['proof_of_delivery'] = $delivery->status === 'delivered'
            ? ['status' => 'ready', 'label' => 'Delivered and confirmed']
            : ['status' => 'pending', 'label' => 'Proof of delivery will appear here once confirmed'];
        $payload['courier_profile'] = $courierProfile;
        $payload['timeline'] = array_values(array_filter([
            ['key' => 'requested', 'label' => 'Delivery requested', 'timestamp' => optional($delivery->created_at)->toIso8601String()],
            ['key' => 'courier_assigned', 'label' => 'Courier assigned', 'timestamp' => optional($delivery->assigned_at)->toIso8601String()],
            ['key' => 'pickup_confirmed', 'label' => 'Pickup confirmed', 'timestamp' => optional($delivery->picked_up_at)->toIso8601String()],
            ['key' => 'in_transit', 'label' => 'Parcel in transit', 'timestamp' => optional($delivery->in_transit_at)->toIso8601String()],
            ['key' => 'delivered', 'label' => 'Delivered', 'timestamp' => optional($delivery->delivered_at)->toIso8601String()],
            ['key' => 'cancelled', 'label' => 'Cancelled', 'timestamp' => optional($delivery->cancelled_at)->toIso8601String()],
        ], fn ($item) => filled($item['timestamp'])));

        return $payload;
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'accepted' => 'Courier assigned',
            'pickup_confirmed' => 'Pickup confirmed',
            'in_transit' => 'In transit',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    private function referenceCode(int $id, string $prefix): string
    {
        return sprintf('%s-%05d', $prefix, $id);
    }
}
