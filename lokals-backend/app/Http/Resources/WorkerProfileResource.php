<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkerProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'headline' => $this->headline,
            'skills' => $this->skills,
            'experience_years' => $this->experience_years,
            'hourly_rate' => $this->hourly_rate,
            'is_available' => $this->is_available,
            'location' => $this->location,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'user' => $this->user?->only(['id', 'name', 'phone', 'avatar', 'whatsapp', 'business_name', 'location', 'default_town', 'default_area']),
        ];
    }
}
