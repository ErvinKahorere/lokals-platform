<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DeliveryRequest::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pickup_address' => ['nullable', 'string'],
            'pickup_location' => ['nullable', 'string'],
            'dropoff_address' => ['nullable', 'string'],
            'dropoff_location' => ['nullable', 'string'],
            'item_description' => ['nullable', 'string'],
            'parcel_description' => ['nullable', 'string'],
            'parcel_size' => ['nullable', 'string', 'max:60'],
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
            'parcel_size' => $validated['parcel_size'] ?? 'medium',
            'price' => $validated['price'] ?? $validated['estimated_price'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? $validated['price'] ?? null,
            'status' => 'pending',
        ];

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('delivery-photos', 'public');
            $payload['photo_url'] = Storage::disk('public')->url($path);
        }

        return response()->json($request->user()->deliveryRequests()->create($payload), 201);
    }
}
