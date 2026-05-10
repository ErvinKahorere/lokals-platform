<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => ['required', 'string', 'in:android,ios,web'],
            'token' => ['required', 'string', 'max:2048'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $deviceToken = DeviceToken::query()->updateOrCreate(
            ['token' => $validated['token']],
            [
                'user_id' => $request->user()->id,
                'platform' => $validated['platform'],
                'device_name' => $validated['device_name'] ?? null,
                'last_used_at' => now(),
            ],
        );

        return response()->json([
            'message' => 'Device token registered.',
            'data' => $deviceToken,
        ], 201);
    }

    public function destroy(Request $request, DeviceToken $deviceToken): JsonResponse
    {
        abort_unless($deviceToken->user_id === $request->user()->id, 404);

        $deviceToken->delete();

        return response()->json([
            'message' => 'Device token removed.',
        ]);
    }
}
