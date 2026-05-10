<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserPreference;
use App\Support\PilotLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $defaultTown = PilotLocation::profileTown($validated['default_town'] ?? null);
        $defaultArea = PilotLocation::normalizeArea($validated['default_area'] ?? null);
        $requestedRoles = collect($validated['roles'] ?? ['citizen']);
        $user = User::create([
            ...$validated,
            'default_town' => $defaultTown,
            'default_area' => $defaultArea,
            'current_role' => $this->normalizeCurrentRole($requestedRoles->first() ?? 'citizen'),
        ]);
        $roles = $requestedRoles
            ->flatMap(fn (string $role) => $this->expandRole($role))
            ->unique()
            ->values()
            ->all();
        $user->assignRole($roles);

        Profile::create([
            'user_id' => $user->id,
            'location' => $request->string('location')->value() ?: collect([$defaultArea, $defaultTown])->filter()->implode(', '),
            'lat' => $request->input('lat'),
            'lng' => $request->input('lng'),
            'completed_fields' => ['name', 'phone'],
        ]);

        UserPreference::create([
            'user_id' => $user->id,
            'default_town' => $defaultTown,
            'default_area' => $defaultArea,
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

        if (! $user->current_role) {
            $user->update([
                'current_role' => $this->normalizeCurrentRole($user->getRoleNames()->first() ?? 'citizen'),
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
        $role = $this->normalizeCurrentRole($validated['role']);
        $allowedRoles = $this->expandRole($validated['role']);
        abort_unless($user->hasAnyRole($allowedRoles), 403, 'You do not have access to this role.');

        $user->update(['current_role' => $role]);

        return response()->json([
            'message' => 'Role switched successfully.',
            'current_role' => $role,
            'user' => UserResource::make($user->fresh()->load(['profile', 'roles', 'preference'])),
        ]);
    }

    private function expandRole(string $role): array
    {
        return match ($role) {
            'business_owner' => ['seller'],
            'organization_representative' => ['municipality_admin', 'town_manager'],
            'municipality_admin', 'town_manager' => ['municipality_admin', 'town_manager'],
            default => [$role],
        };
    }

    private function normalizeCurrentRole(string $role): string
    {
        return match ($role) {
            'business_owner' => 'seller',
            'organization_representative', 'municipality_admin', 'town_manager' => 'town_manager',
            default => $role,
        };
    }
}
