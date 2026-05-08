<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->deliveryRequests()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();

        if ($request->user()->hasAnyRole(['operator', 'super_admin'])) {
            $query = DeliveryRequest::query()->with(['user:id,name,phone', 'driver:id,name,phone'])->latest();
        }

        return response()->json($query->get());
    }

    public function show(Request $request, DeliveryRequest $delivery): JsonResponse
    {
        abort_unless(
            $delivery->user_id === $request->user()->id || $request->user()->hasAnyRole(['operator', 'super_admin']),
            403,
        );

        return response()->json([
            'data' => $delivery->load(['user:id,name,phone', 'driver:id,name,phone']),
        ]);
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
            'price' => $validated['price'] ?? $validated['estimated_price'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? $validated['price'] ?? null,
            'status' => 'requested',
        ];

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('delivery-photos', 'public');
            $payload['photo_url'] = Storage::disk('public')->url($path);
        }

        $delivery = $request->user()->deliveryRequests()->create($payload);

        return response()->json([
            'data' => $delivery->load(['user:id,name,phone', 'driver:id,name,phone']),
        ], 201);
    }
}
