<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use App\Models\RideRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RideController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->rideRequests()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();

        if ($request->user()->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin'])) {
            $query = RideRequest::query()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();
        } elseif ($request->user()->hasRole('driver')) {
            $query = RideRequest::query()
                ->with(['user:id,name,phone', 'driver:id,name,phone'])
                ->where(function ($builder) use ($request): void {
                    $builder->where('driver_id', $request->user()->id)
                        ->orWhereIn('status', ['requested', 'searching']);
                })
                ->latest();
        }

        return response()->json($query->get());
    }

    public function show(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless(
            $ride->user_id === $request->user()->id
            || $ride->driver_id === $request->user()->id
            || $request->user()->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin']),
            403,
        );

        return response()->json([
            'data' => $ride->load(['user:id,name,phone', 'driver:id,name,phone']),
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
            ->with(['user:id,name,phone', 'driver:id,name,phone'])
            ->where(function ($query) use ($request): void {
                $query->where('user_id', $request->user()->id)
                    ->orWhere('driver_id', $request->user()->id);
            })
            ->whereIn('status', ['requested', 'searching', 'accepted', 'driver_en_route', 'arrived', 'in_progress'])
            ->latest()
            ->first();

        return response()->json(['data' => $ride]);
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

        return response()->json([
            'data' => $ride->load(['user:id,name,phone', 'driver:id,name,phone']),
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

        return response()->json([
            'message' => 'Ride cancelled.',
            'data' => $ride->fresh()->load(['user:id,name,phone', 'driver:id,name,phone']),
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
            'data' => $ride->fresh(),
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
                ->with(['user:id,name,phone'])
                ->whereIn('status', ['requested', 'searching'])
                ->latest()
                ->paginate((int) $request->integer('per_page', 20)),
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

        return response()->json([
            'message' => 'Ride accepted.',
            'data' => $ride->fresh()->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
    }

    public function decline(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);

        return response()->json([
            'message' => 'Ride declined.',
            'data' => $ride->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
    }

    public function arrived(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($ride->driver_id === $request->user()->id, 403);
        $ride->update(['status' => 'arrived', 'arrived_at' => now()]);

        return response()->json(['data' => $ride->fresh()->load(['user:id,name,phone', 'driver:id,name,phone'])]);
    }

    public function start(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless($ride->driver_id === $request->user()->id, 403);
        $ride->update(['status' => 'in_progress', 'started_at' => now()]);

        return response()->json(['data' => $ride->fresh()->load(['user:id,name,phone', 'driver:id,name,phone'])]);
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

        return response()->json(['data' => $ride->fresh()->load(['user:id,name,phone', 'driver:id,name,phone'])]);
    }

    public function trips(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('driver'), 403);

        return response()->json([
            'data' => RideRequest::query()
                ->with(['user:id,name,phone'])
                ->where('driver_id', $request->user()->id)
                ->latest()
                ->paginate((int) $request->integer('per_page', 20)),
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
}
