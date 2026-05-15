<?php

namespace App\Http\Controllers\Api;

use App\Events\RideRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use App\Models\RideRequest;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Notification;

class RideController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->rideRequests()->with($this->rideRelations())->latest();

        if ($request->user()->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin'])) {
            $query = RideRequest::query()->with($this->rideRelations())->latest();
        } elseif ($request->user()->hasRole('driver')) {
            $query = RideRequest::query()
                ->with($this->rideRelations())
                ->where(function ($builder) use ($request): void {
                    $builder->where('driver_id', $request->user()->id)
                        ->orWhereIn('status', ['requested', 'searching', 'accepted']);
                })
                ->latest();
        }

        return response()->json(
            $query->get()->map(fn (RideRequest $ride) => $this->serializeRide($ride)),
        );
    }

    public function show(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless(
            $ride->user_id === $request->user()->id
            || $ride->driver_id === $request->user()->id
            || $request->user()->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin'])
            || ($request->user()->hasRole('driver') && in_array($ride->status, ['requested', 'searching'], true)),
            403,
        );

        return response()->json([
            'data' => $this->serializeRide($ride),
        ]);
    }

    public function estimate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pickup_location' => ['nullable', 'string', 'required_without:pickup_address'],
            'pickup_address' => ['nullable', 'string', 'required_without:pickup_location'],
            'dropoff_location' => ['nullable', 'string', 'required_without:dropoff_address'],
            'dropoff_address' => ['nullable', 'string', 'required_without:dropoff_location'],
            'ride_type' => ['nullable', 'string', 'max:50'],
        ]);

        $rideType = strtolower((string) ($validated['ride_type'] ?? 'standard'));
        $baseFare = match ($rideType) {
            'comfort' => 78,
            'shared' => 36,
            'bike' => 28,
            default => 52,
        };

        return response()->json([
            'data' => [
                'estimated_distance_km' => 4.8,
                'estimated_duration_minutes' => 11,
                'estimated_fare' => $baseFare,
                'ride_type' => $validated['ride_type'] ?? 'Standard',
            ],
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        $ride = RideRequest::query()
            ->with($this->rideRelations())
            ->where(function ($query) use ($request): void {
                $query->where('user_id', $request->user()->id)
                    ->orWhere('driver_id', $request->user()->id);
            })
            ->whereIn('status', ['requested', 'searching', 'accepted', 'arrived', 'in_progress'])
            ->latest()
            ->first();

        return response()->json(['data' => $ride ? $this->serializeRide($ride) : null]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pickup_location' => ['nullable', 'string', 'required_without:pickup_address'],
            'pickup_address' => ['nullable', 'string', 'required_without:pickup_location'],
            'dropoff_location' => ['nullable', 'string', 'required_without:dropoff_address'],
            'dropoff_address' => ['nullable', 'string', 'required_without:dropoff_location'],
            'ride_type' => ['nullable', 'string', 'max:50'],
            'trip_purpose' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
            'fare_estimate' => ['nullable', 'numeric'],
            'estimated_distance_km' => ['nullable', 'numeric'],
        ]);

        $ride = $request->user()->rideRequests()->create([
            'pickup_location' => $validated['pickup_location'] ?? $validated['pickup_address'] ?? null,
            'pickup_address' => $validated['pickup_address'] ?? $validated['pickup_location'] ?? null,
            'dropoff_location' => $validated['dropoff_location'] ?? $validated['dropoff_address'] ?? null,
            'dropoff_address' => $validated['dropoff_address'] ?? $validated['dropoff_location'] ?? null,
            'ride_type' => $validated['ride_type'] ?? 'Standard',
            'trip_purpose' => $validated['trip_purpose'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'fare_estimate' => $validated['fare_estimate'] ?? 52,
            'estimated_distance_km' => $validated['estimated_distance_km'] ?? 4.8,
            'status' => 'searching',
        ]);
        $ride->refresh();

        $request->user()->notify(new SystemNotification(
            'Ride request submitted',
            'We are matching you with a nearby driver for your '.$ride->pickup_location.' trip.',
            [
                'target' => [
                    'type' => 'ride',
                    'id' => $ride->id,
                    'href' => '/ride/'.$ride->id,
                    'title' => 'Ride '.$this->referenceCode($ride->id, 'RIDE'),
                ],
            ],
        ));

        $driverAudienceIds = $this->driverAudienceIdsForTown($request->user()->default_town);
        if (!empty($driverAudienceIds)) {
            Notification::send(
                User::query()->whereIn('id', $driverAudienceIds)->get(),
                new SystemNotification(
                    'New ride request nearby',
                    'A resident ride request is waiting for a driver in your town.',
                    [
                        'type' => 'ride_request',
                        'target' => [
                            'type' => 'ride',
                            'id' => $ride->id,
                            'href' => '/ride/'.$ride->id,
                            'title' => 'Ride '.$this->referenceCode($ride->id, 'RIDE'),
                        ],
                        'town' => $request->user()->default_town,
                        'status' => $ride->status,
                    ],
                ),
            );
        }

        broadcast(new RideRequestUpdated(
            $ride->fresh()->load($this->rideRelations()),
            $driverAudienceIds,
            $request->user()->default_town
        ));

        return response()->json([
            'data' => $this->serializeRide($ride),
        ], 201);
    }

    public function cancel(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless(
            $ride->user_id === $request->user()->id || $ride->driver_id === $request->user()->id,
            403,
        );

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $ride->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $validated['reason'] ?? null,
        ]);
        $ride->user?->notify(new SystemNotification(
            'Ride cancelled',
            'Your ride request has been cancelled.',
            [
                'target' => [
                    'type' => 'ride',
                    'id' => $ride->id,
                    'href' => '/ride/'.$ride->id,
                    'title' => 'Ride '.$this->referenceCode($ride->id, 'RIDE'),
                ],
            ],
        ));
        broadcast(new RideRequestUpdated(
            $ride->fresh()->load($this->rideRelations()),
            [],
            $ride->user?->default_town
        ));

        return response()->json([
            'message' => 'Ride cancelled.',
            'data' => $this->serializeRide($ride),
        ]);
    }

    public function rate(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($ride->user_id === $request->user()->id, 403);
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $ride->update([
            'rating' => $validated['rating'],
            'rating_comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Driver rating saved.',
            'data' => $this->serializeRide($ride),
        ]);
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);
        $validated = $request->validate(['is_online' => ['required', 'boolean']]);

        $profile = DriverProfile::query()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['is_online' => $validated['is_online']]
        );

        return response()->json([
            'message' => $validated['is_online'] ? 'Driver is now online.' : 'Driver is now offline.',
            'data' => $profile,
        ]);
    }

    public function driverRequests(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);

        return response()->json([
            'data' => RideRequest::query()
                ->with($this->rideRelations())
                ->whereIn('status', ['requested', 'searching'])
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
                ->through(fn (RideRequest $ride) => $this->serializeRide($ride)),
        ]);
    }

    public function accept(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);
        abort_unless(in_array($ride->status, ['requested', 'searching'], true), 422, 'Ride can no longer be accepted.');

        $profile = DriverProfile::query()->where('user_id', $request->user()->id)->first();
        $vehicleLabel = collect([$profile?->vehicle_make, $profile?->vehicle_model, $profile?->vehicle_registration])->filter()->implode(' ');

        $ride->update([
            'driver_id' => $request->user()->id,
            'status' => 'accepted',
            'assigned_at' => now(),
            'vehicle_label' => $vehicleLabel ?: $ride->vehicle_label,
        ]);
        $ride->user?->notify(new SystemNotification(
            'Driver assigned',
            $request->user()->name.' is now on your ride request.',
            [
                'target' => [
                    'type' => 'ride',
                    'id' => $ride->id,
                    'href' => '/ride/'.$ride->id,
                    'title' => 'Ride '.$this->referenceCode($ride->id, 'RIDE'),
                ],
            ],
        ));
        broadcast(new RideRequestUpdated(
            $ride->fresh()->load($this->rideRelations()),
            [],
            $ride->user?->default_town
        ));

        return response()->json([
            'message' => 'Ride accepted.',
            'data' => $this->serializeRide($ride),
        ]);
    }

    public function decline(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);
        broadcast(new RideRequestUpdated(
            $ride->fresh()->load($this->rideRelations()),
            [],
            $ride->user?->default_town
        ));

        return response()->json([
            'message' => 'Ride declined.',
            'data' => $this->serializeRide($ride),
        ]);
    }

    public function arrived(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($ride->driver_id === $request->user()->id, 403);
        $ride->update(['status' => 'arrived', 'arrived_at' => now()]);
        $ride->user?->notify(new SystemNotification(
            'Driver has arrived',
            $request->user()->name.' has arrived at your pickup point.',
            [
                'target' => [
                    'type' => 'ride',
                    'id' => $ride->id,
                    'href' => '/ride/'.$ride->id,
                    'title' => 'Ride '.$this->referenceCode($ride->id, 'RIDE'),
                ],
            ],
        ));
        broadcast(new RideRequestUpdated(
            $ride->fresh()->load($this->rideRelations()),
            [],
            $ride->user?->default_town
        ));

        return response()->json(['data' => $this->serializeRide($ride)]);
    }

    public function start(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($ride->driver_id === $request->user()->id, 403);
        $ride->update(['status' => 'in_progress', 'started_at' => now()]);
        $ride->user?->notify(new SystemNotification(
            'Trip started',
            'Your taxi trip is now in progress.',
            [
                'target' => [
                    'type' => 'ride',
                    'id' => $ride->id,
                    'href' => '/ride/'.$ride->id,
                    'title' => 'Ride '.$this->referenceCode($ride->id, 'RIDE'),
                ],
            ],
        ));
        broadcast(new RideRequestUpdated(
            $ride->fresh()->load($this->rideRelations()),
            [],
            $ride->user?->default_town
        ));

        return response()->json(['data' => $this->serializeRide($ride)]);
    }

    public function complete(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($ride->driver_id === $request->user()->id, 403);
        $ride->update(['status' => 'completed', 'completed_at' => now()]);

        $profile = DriverProfile::query()->where('user_id', $request->user()->id)->first();
        if ($profile) {
            $profile->increment('completed_trips');
            $profile->increment('lifetime_earnings', (float) ($ride->fare_estimate ?? 0));
        }
        $ride->user?->notify(new SystemNotification(
            'Trip completed',
            'Your taxi trip has been marked complete. You can now rate the driver.',
            [
                'target' => [
                    'type' => 'ride',
                    'id' => $ride->id,
                    'href' => '/ride/'.$ride->id,
                    'title' => 'Ride '.$this->referenceCode($ride->id, 'RIDE'),
                ],
            ],
        ));
        broadcast(new RideRequestUpdated(
            $ride->fresh()->load($this->rideRelations()),
            [],
            $ride->user?->default_town
        ));

        return response()->json(['data' => $this->serializeRide($ride)]);
    }

    public function trips(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);

        return response()->json([
            'data' => RideRequest::query()
                ->with($this->rideRelations())
                ->where('driver_id', $request->user()->id)
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
                ->through(fn (RideRequest $ride) => $this->serializeRide($ride)),
        ]);
    }

    public function earnings(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);
        $trips = RideRequest::query()->where('driver_id', $request->user()->id)->where('status', 'completed');

        return response()->json([
            'data' => [
                'today' => number_format((float) (clone $trips)->whereDate('completed_at', today())->sum('fare_estimate'), 2, '.', ''),
                'this_week' => number_format((float) (clone $trips)->whereBetween('completed_at', [now()->startOfWeek(), now()->endOfWeek()])->sum('fare_estimate'), 2, '.', ''),
                'lifetime' => number_format((float) (clone $trips)->sum('fare_estimate'), 2, '.', ''),
            ],
        ]);
    }

    /**
     * @return array<int, int>
     */
    private function driverAudienceIdsForTown(?string $town): array
    {
        return User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'driver'))
            ->whereHas('driverProfile', fn ($query) => $query->where('is_online', true)->where('is_verified', true))
            ->when($town, fn ($query) => $query->where('default_town', $town))
            ->pluck('id')
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function rideRelations(): array
    {
        return [
            'user:id,name,phone,default_town,avatar',
            'driver:id,name,phone,avatar',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRide(RideRequest $ride): array
    {
        $ride->loadMissing($this->rideRelations());
        $payload = $ride->toArray();
        $driverProfile = null;

        if ($ride->driver_id) {
            $profile = DriverProfile::query()
                ->where('user_id', $ride->driver_id)
                ->first(['vehicle_type', 'vehicle_make', 'vehicle_model', 'vehicle_registration', 'rating', 'is_online', 'is_verified']);

            if ($profile) {
                $driverProfile = $profile->toArray();
            }
        }

        $payload['reference_code'] = $this->referenceCode($ride->id, 'RIDE');
        $payload['status_label'] = $this->statusLabel((string) ($ride->status ?? 'requested'));
        $payload['tracking_status'] = $ride->status === 'accepted' ? 'driver_assigned' : $ride->status;
        $payload['estimated_eta_minutes'] = $this->estimatedEtaForRide($ride);
        $payload['driver_profile'] = $driverProfile;
        $payload['timeline'] = array_values(array_filter([
            ['key' => 'requested', 'label' => 'Ride requested', 'timestamp' => optional($ride->created_at)->toIso8601String()],
            ['key' => 'driver_assigned', 'label' => 'Driver assigned', 'timestamp' => optional($ride->assigned_at)->toIso8601String()],
            ['key' => 'arrived', 'label' => 'Driver arrived', 'timestamp' => optional($ride->arrived_at)->toIso8601String()],
            ['key' => 'in_progress', 'label' => 'Trip started', 'timestamp' => optional($ride->started_at)->toIso8601String()],
            ['key' => 'completed', 'label' => 'Trip completed', 'timestamp' => optional($ride->completed_at)->toIso8601String()],
            ['key' => 'cancelled', 'label' => 'Trip cancelled', 'timestamp' => optional($ride->cancelled_at)->toIso8601String()],
        ], fn ($item) => filled($item['timestamp'])));

        return $payload;
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'accepted' => 'Driver assigned',
            'in_progress' => 'Trip in progress',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    private function estimatedEtaForRide(RideRequest $ride): ?int
    {
        return match ($ride->status) {
            'accepted' => 6,
            'arrived' => 0,
            default => null,
        };
    }

    private function referenceCode(int $id, string $prefix): string
    {
        return sprintf('%s-%05d', $prefix, $id);
    }
}
