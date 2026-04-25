<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\DataEnrichmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MeController extends Controller
{
    public function __construct(private readonly DataEnrichmentService $dataEnrichmentService)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load(['profile', 'roles', 'savedAddresses', 'preference']);

        return response()->json([
            'user' => UserResource::make($user),
            'saved_addresses' => $user->savedAddresses,
            'enrichment' => $this->dataEnrichmentService->profileCompletion($user),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->safe()->only([
            'name',
            'phone',
            'email',
            'location',
            'lat',
            'lng',
            'bio',
            'whatsapp',
            'secondary_phone',
            'profession',
            'business_name',
            'default_town',
            'default_area',
            'service_radius',
            'current_role',
            'profile_visibility',
        ]));
        if ($request->filled('roles') && is_array($request->input('roles'))) {
            $roles = collect($request->input('roles'))
                ->map(fn (string $role) => match ($role) {
                    'business_owner' => 'seller',
                    'organization_representative' => 'municipality_admin',
                    default => $role,
                })
                ->unique()
                ->values()
                ->all();
            $user->syncRoles($roles);
        }
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $request->safe()->only(['location', 'lat', 'lng', 'bio', 'preferred_language', 'nationality', 'avatar_url'])
        );
        $user->preference()->updateOrCreate(
            ['user_id' => $user->id],
            $request->safe()->only([
                'default_town',
                'default_area',
                'interests',
                'notification_preferences',
            ]) + [
                'preferred_roles' => $request->input('roles', $user->getRoleNames()->values()->all()),
            ]
        );

        return response()->json([
            'user' => UserResource::make($user->fresh()->load(['profile', 'roles', 'preference'])),
            'enrichment' => $this->dataEnrichmentService->profileCompletion($user->fresh()->load(['profile', 'savedAddresses', 'preference'])),
        ]);
    }

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');
        $url = Storage::disk('public')->url($path);

        $user->update(['avatar' => $url]);
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            ['avatar_url' => $url]
        );

        return response()->json([
            'message' => 'Avatar uploaded successfully.',
            'avatar' => $url,
            'user' => UserResource::make($user->fresh()->load(['profile', 'roles', 'preference'])),
        ]);
    }
}
