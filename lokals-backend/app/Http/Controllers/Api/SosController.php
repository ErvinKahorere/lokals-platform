<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SosAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SosController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->sosAlerts()->with('user:id,name,phone')->latest();

        if ($request->user()->hasAnyRole(['operator', 'super_admin'])) {
            $query = SosAlert::query()->with('user:id,name,phone')->latest();
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string'],
            'emergency_type' => ['nullable', 'string', 'max:80'],
            'location' => ['nullable', 'string'],
            'town' => ['nullable', 'string'],
            'area' => ['nullable', 'string'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
        ]);

        $alert = $request->user()->sosAlerts()->create([
            'message' => $validated['message'],
            'emergency_type' => $validated['emergency_type'] ?? null,
            'location' => $validated['location'] ?? collect([$validated['area'] ?? null, $validated['town'] ?? null])->filter()->implode(', '),
            'town' => $validated['town'] ?? null,
            'area' => $validated['area'] ?? null,
            'lat' => $validated['lat'] ?? null,
            'lng' => $validated['lng'] ?? null,
            'status' => 'sent',
        ]);

        return response()->json([
            'data' => $alert->load('user:id,name,phone'),
        ], 201);
    }
}
