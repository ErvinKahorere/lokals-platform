<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RideRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RideController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->rideRequests()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();

        if ($request->user()->hasAnyRole(['operator', 'super_admin'])) {
            $query = RideRequest::query()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();
        }

        return response()->json($query->get());
    }

    public function show(Request $request, RideRequest $ride): JsonResponse
    {
        abort_unless(
            $ride->user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']),
            403,
        );

        return response()->json([
            'data' => $ride->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
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
        ]);

        $ride = $request->user()->rideRequests()->create([
            'pickup_location' => $validated['pickup_location'] ?? $validated['pickup_address'] ?? null,
            'dropoff_location' => $validated['dropoff_location'] ?? $validated['dropoff_address'] ?? null,
            'ride_type' => $validated['ride_type'] ?? 'Standard',
            'trip_purpose' => $validated['trip_purpose'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'fare_estimate' => $validated['fare_estimate'] ?? null,
            'status' => 'requested',
        ]);

        return response()->json([
            'data' => $ride->load(['user:id,name,phone', 'driver:id,name,phone']),
        ], 201);
    }
}
