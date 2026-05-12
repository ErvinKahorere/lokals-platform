<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'currency' => $this->currency,
            'phone' => $this->phone,
            'location' => $this->location,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'status' => $this->status,
            'metadata' => $this->metadata,
            'image_url' => MediaUrl::resolve(data_get($this->metadata, 'image_url')),
            'organization' => $this->organization?->only(['id', 'name', 'category']),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'phone' => $this->user->phone,
                'avatar' => MediaUrl::resolve($this->user->avatar),
                'profession' => $this->user->profession,
                'business_name' => $this->user->business_name,
            ] : null,
        ];
    }
}
