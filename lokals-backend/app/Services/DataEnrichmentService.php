<?php

namespace App\Services;

use App\Models\User;

class DataEnrichmentService
{
    public function profileCompletion(User $user): array
    {
        $profile = $user->profile;

        $fields = [
            'name' => filled($user->name),
            'phone' => filled($user->phone),
            'location' => filled($user->location ?? $profile?->location),
            'bio' => filled($profile?->bio),
            'saved_address' => $user->savedAddresses()->exists(),
        ];

        $completed = collect($fields)->filter()->keys()->values()->all();

        return [
            'completed_fields' => $completed,
            'percentage' => (int) floor((count($completed) / count($fields)) * 100),
            'next_step' => count($completed) < count($fields) ? 'complete_profile' : 'ready',
        ];
    }
}
