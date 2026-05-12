<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccommodationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $business = $this->business;
        $user = $this->user;
        $ownerName = $business?->name ?? $user?->name ?? 'Local owner';
        $ownerPhone = $business?->phone ?? $user?->phone ?? data_get($this->metadata, 'contact_phone');
        $ownerWhatsapp = $business?->whatsapp ?? $user?->whatsapp ?? $user?->phone ?? data_get($this->metadata, 'contact_whatsapp');
        $ownerLocation = collect([
            $business?->area ?? $user?->default_area,
            $business?->town ?? $user?->default_town ?? $user?->location,
        ])->filter()->implode(', ');

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
            'image_url' => MediaUrl::resolve($this->image_path),
            'status' => $this->status,
            'metadata' => $this->metadata,
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'owner' => [
                'type' => $business ? 'business' : 'user',
                'id' => $business?->id ?? $user?->id,
                'name' => $ownerName,
                'phone' => $ownerPhone,
                'whatsapp' => $ownerWhatsapp,
                'avatar' => MediaUrl::resolve($business?->logo_url ?? $user?->avatar),
                'is_verified' => (bool) ($business?->is_verified ?? false),
                'location' => $ownerLocation ?: null,
            ],
            'is_verified_owner' => (bool) ($business?->is_verified ?? false),
            'business' => $business ? [
                'id' => $business->id,
                'name' => $business->name,
                'category' => $business->category,
                'phone' => $business->phone,
                'whatsapp' => $business->whatsapp,
                'logo_url' => MediaUrl::resolve($business->logo_url),
                'town' => $business->town,
                'area' => $business->area,
                'is_verified' => $business->is_verified,
            ] : null,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'whatsapp' => $user->whatsapp,
                'avatar' => MediaUrl::resolve($user->avatar),
                'location' => $user->location,
                'default_town' => $user->default_town,
                'default_area' => $user->default_area,
            ] : null,
        ];
    }
}
