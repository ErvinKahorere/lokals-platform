<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'location' => $this->location,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'status' => $this->status,
            'avatar' => MediaUrl::resolve($this->avatar),
            'bio' => $this->bio,
            'whatsapp' => $this->whatsapp,
            'secondary_phone' => $this->secondary_phone,
            'profession' => $this->profession,
            'business_name' => $this->business_name,
            'default_town' => $this->default_town,
            'default_area' => $this->default_area,
            'service_radius' => $this->service_radius,
            'current_role' => $this->current_role,
            'profile_visibility' => $this->profile_visibility,
            'roles' => $this->whenLoaded('roles', fn () => $this->getRoleNames()->values()),
            'profile' => ProfileResource::make($this->whenLoaded('profile')),
            'preferences' => UserPreferenceResource::make($this->whenLoaded('preference')),
        ];
    }
}
