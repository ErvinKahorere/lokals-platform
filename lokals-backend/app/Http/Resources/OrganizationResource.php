<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'description' => $this->description,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo_url' => $this->logo_url,
            'whatsapp' => $this->whatsapp,
            'location' => $this->location,
            'town' => $this->town,
            'area' => $this->area,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'is_verified' => $this->is_verified,
            'status' => $this->status,
            'emergency_contact' => $this->emergency_contact,
            'is_public_service' => $this->is_public_service,
            'opening_hours' => $this->opening_hours,
            'rates' => $this->rates,
            'services_offered' => $this->services_offered,
            'followers_count' => $this->whenCounted('followers'),
            'service_providers' => ServiceProviderResource::collection($this->whenLoaded('serviceProviders')),
            'services' => ServiceResource::collection($this->whenLoaded('services')),
        ];
    }
}
