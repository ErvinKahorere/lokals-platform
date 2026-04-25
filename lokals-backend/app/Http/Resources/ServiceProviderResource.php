<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'whatsapp' => $this->whatsapp,
            'location' => $this->location,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'is_verified' => $this->is_verified,
            'status' => $this->status,
            'opening_hours' => $this->opening_hours,
            'organization' => $this->organization?->only(['id', 'name', 'category']),
            'services' => ServiceResource::collection($this->whenLoaded('services')),
            'availability_slots' => AvailabilitySlotResource::collection($this->whenLoaded('availabilitySlots')),
        ];
    }
}
