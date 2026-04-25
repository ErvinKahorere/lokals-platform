<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = User::create([
            ...$validated,
            'default_town' => $validated['default_town'] ?? null,
            'default_area' => $validated['default_area'] ?? null,
            'current_role' => collect($validated['roles'] ?? ['citizen'])->first(),
        ]);
        $roles = collect($validated['roles'] ?? ['citizen'])
            ->map(fn (string $role) => match ($role) {
                'business_owner' => 'seller',
                'organization_representative' => 'municipality_admin',
                default => $role,
            })
            ->unique()
            ->values()
            ->all();
        $user->assignRole($roles);

        Profile::create([
            'user_id' => $user->id,
            'location' => $request->string('location')->value() ?: collect([$validated['default_area'] ?? null, $validated['default_town'] ?? null])->filter()->implode(', '),
            'lat' => $request->input('lat'),
            'lng' => $request->input('lng'),
            'completed_fields' => ['name', 'phone'],
        ]);

        UserPreference::create([
            'user_id' => $user->id,
            'default_town' => $validated['default_town'] ?? null,
            'default_area' => $validated['default_area'] ?? null,
            'interests' => $validated['interests'] ?? [],
            'preferred_roles' => $validated['roles'] ?? ['citizen'],
            'notification_preferences' => [
                'alerts_from_followed_entities' => true,
                'booking_updates' => true,
                'job_updates' => true,
                'sale_alerts' => true,
                'city_alerts' => true,
            ],
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => UserResource::make($user->load(['profile', 'roles', 'preference'])),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('phone', $request->phone)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => UserResource::make($user->load(['profile', 'roles', 'preference'])),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function switchRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'max:100'],
        ]);

        $user = $request->user()->load('roles');
        abort_unless($user->hasRole($validated['role']), 403, 'You do not have access to this role.');

        $user->update(['current_role' => $validated['role']]);

        return response()->json([
            'message' => 'Role switched successfully.',
            'current_role' => $validated['role'],
            'user' => UserResource::make($user->fresh()->load(['profile', 'roles', 'preference'])),
        ]);
    }
}
