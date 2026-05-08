<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\EventSave;
use App\Models\EventTicket;
use App\Services\DataEnrichmentService;
use App\Support\PilotLocation;
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
        $user = $request->user()
            ->load(['profile', 'roles', 'savedAddresses', 'preference'])
            ->loadCount([
                'bookings',
                'jobApplications',
                'listings',
                'products',
                'accommodations',
                'follows',
                'ownedOrganizations',
            ]);

        return response()->json([
            'user' => UserResource::make($user),
            'saved_addresses' => $user->savedAddresses,
            'enrichment' => $this->dataEnrichmentService->profileCompletion($user),
            'stats' => [
                'bookings' => $user->bookings_count,
                'jobs_applications' => $user->job_applications_count,
                'listings' => $user->listings_count,
                'products' => $user->products_count,
                'accommodations' => $user->accommodations_count,
                'saved_items' => EventSave::query()->where('user_id', $user->id)->count() + $user->follows_count,
                'tickets' => EventTicket::query()->where('user_id', $user->id)->count(),
                'follows' => $user->follows_count,
                'businesses' => $user->owned_organizations_count,
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $payload = $request->safe()->only([
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
            'profile_visibility',
        ]);

        $payload['default_town'] = PilotLocation::profileTown($payload['default_town'] ?? $user->default_town);
        $payload['default_area'] = PilotLocation::normalizeArea($payload['default_area'] ?? $user->default_area);

        $user->update($payload);
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $request->safe()->only(['location', 'lat', 'lng', 'bio', 'preferred_language', 'nationality', 'avatar_url'])
        );
        $user->preference()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'default_town' => $payload['default_town'],
                'default_area' => $payload['default_area'],
                ...$request->safe()->only([
                    'interests',
                    'notification_preferences',
                ]),
                'preferred_roles' => $user->getRoleNames()->values()->all(),
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
