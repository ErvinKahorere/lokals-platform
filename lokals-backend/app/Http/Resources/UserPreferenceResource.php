<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserPreferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'default_town' => $this->default_town,
            'default_area' => $this->default_area,
            'service_radius' => $this->user?->service_radius,
            'interests' => $this->interests ?? [],
            'preferred_roles' => $this->preferred_roles ?? [],
            'notification_preferences' => $this->notification_preferences ?? [],
        ];
    }
}
