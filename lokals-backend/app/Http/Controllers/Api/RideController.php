<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RideRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RideController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(RideRequest::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pickup_location' => ['required', 'string'],
            'dropoff_location' => ['required', 'string'],
            'fare_estimate' => ['nullable', 'numeric'],
        ]);

        return response()->json($request->user()->rideRequests()->create($validated), 201);
    }
}
