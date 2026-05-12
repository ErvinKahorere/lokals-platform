<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'bio' => $this->bio,
            'nationality' => $this->nationality,
            'preferred_language' => $this->preferred_language,
            'location' => $this->location,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'avatar_url' => MediaUrl::resolve($this->avatar_url),
            'profession' => $this->user?->profession,
            'business_name' => $this->user?->business_name,
            'default_town' => $this->user?->default_town,
            'default_area' => $this->user?->default_area,
            'whatsapp' => $this->user?->whatsapp,
            'secondary_phone' => $this->user?->secondary_phone,
            'profile_visibility' => $this->user?->profile_visibility,
            'onboarding_stage' => $this->onboarding_stage,
            'completed_fields' => $this->completed_fields,
        ];
    }
}
