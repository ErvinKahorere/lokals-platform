<?php

namespace App\Http\Resources;

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
            'image_url' => data_get($this->metadata, 'image_url'),
            'organization' => $this->organization?->only(['id', 'name', 'category']),
            'user' => $this->user?->only(['id', 'name', 'phone', 'avatar', 'profession', 'business_name']),
        ];
    }
}
