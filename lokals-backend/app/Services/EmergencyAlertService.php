<?php

namespace App\Services;

use App\Models\EmergencyBroadcast;
use App\Models\User;

class EmergencyAlertService
{
    public function publish(array $payload, ?User $actor = null): EmergencyBroadcast
    {
        return EmergencyBroadcast::query()->create([
            'title' => $payload['title'],
            'body' => $payload['body'],
            'emergency_type' => $payload['emergency_type'],
            'priority' => $payload['priority'] ?? 'high',
            'town' => $payload['town'],
            'area' => $payload['area'] ?? null,
            'latitude' => $payload['latitude'] ?? null,
            'longitude' => $payload['longitude'] ?? null,
            'radius_km' => $payload['radius_km'] ?? null,
            'status' => $payload['status'] ?? 'published',
            'created_by' => $actor?->id,
            'starts_at' => $payload['starts_at'] ?? now(),
            'ends_at' => $payload['ends_at'] ?? null,
        ]);
    }
}
