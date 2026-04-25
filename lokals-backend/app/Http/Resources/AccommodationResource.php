<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccommodationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'price_period' => $this->price_period,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'location' => $this->location,
            'town' => $this->town,
            'area' => $this->area,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'image_url' => $this->image_path,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'business' => $this->business?->only(['id', 'name', 'category', 'phone', 'whatsapp']),
            'user' => $this->user?->only(['id', 'name', 'phone', 'avatar']),
        ];
    }
}
