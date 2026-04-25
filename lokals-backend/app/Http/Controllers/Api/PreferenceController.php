<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserPreferenceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PreferenceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $preference = $request->user()->preference()->firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'default_town' => $request->user()->default_town,
                'default_area' => $request->user()->default_area,
                'preferred_roles' => $request->user()->getRoleNames()->values()->all(),
            ]
        );

        return response()->json([
            'preferences' => UserPreferenceResource::make($preference),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'default_town' => ['nullable', 'string', 'max:255'],
            'default_area' => ['nullable', 'string', 'max:255'],
            'service_radius' => ['nullable', 'integer', 'min:1', 'max:100'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'max:100'],
            'preferred_roles' => ['nullable', 'array'],
            'preferred_roles.*' => ['string', Rule::in([
                'citizen',
                'worker',
                'seller',
                'business_owner',
                'service_provider',
                'driver',
                'organization_representative',
                'municipality_admin',
                'operator',
                'super_admin',
            ])],
            'notification_preferences' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $user->update([
            'default_town' => $validated['default_town'] ?? $user->default_town,
            'default_area' => $validated['default_area'] ?? $user->default_area,
            'service_radius' => $validated['service_radius'] ?? $user->service_radius,
        ]);

        if (! empty($validated['preferred_roles'])) {
            $allowedRoles = collect($validated['preferred_roles'])
                ->map(fn (string $role) => match ($role) {
                    'business_owner' => 'seller',
                    'organization_representative' => 'municipality_admin',
                    default => $role,
                })
                ->unique()
                ->values()
                ->all();
            $user->syncRoles($allowedRoles);
        }

        $preference = $user->preference()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'default_town' => $validated['default_town'] ?? $user->default_town,
                'default_area' => $validated['default_area'] ?? $user->default_area,
                'interests' => $validated['interests'] ?? [],
                'preferred_roles' => $validated['preferred_roles'] ?? $user->getRoleNames()->values()->all(),
                'notification_preferences' => $validated['notification_preferences'] ?? [],
            ]
        );

        return response()->json([
            'message' => 'Preferences updated.',
            'preferences' => UserPreferenceResource::make($preference),
        ]);
    }
}
