<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
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
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'phone' => $this->user->phone,
                'avatar' => MediaUrl::resolve($this->user->avatar),
                'whatsapp' => $this->user->whatsapp,
                'business_name' => $this->user->business_name,
                'location' => $this->user->location,
                'default_town' => $this->user->default_town,
                'default_area' => $this->user->default_area,
            ] : null,
        ];
    }
}
