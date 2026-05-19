<?php

namespace App\Http\Resources;

use App\Support\CommerceAvailability;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $announcements = $this->resource->relationLoaded('announcements')
            ? $this->announcements
            : collect();

        $followersCount = (int) ($this->followers_count ?? 0);
        $serviceCount = collect($this->services ?? [])->count() + collect($this->serviceProviders ?? [])->count();
        $commerceMeta = CommerceAvailability::commerceMeta(
            $this->category,
            $this->status,
            is_array($this->opening_hours) ? $this->opening_hours : null,
            $followersCount,
            $serviceCount,
            (bool) $this->is_verified,
        );
        $alerts = collect($announcements)->take(4)->map(fn ($announcement) => [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'body' => $announcement->body,
            'location' => $announcement->location,
            'published_at' => optional($announcement->published_at)->toIso8601String(),
            'status' => $announcement->status,
        ])->values();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'description' => $this->description,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo_url' => MediaUrl::resolve($this->logo_url),
            'whatsapp' => $this->whatsapp,
            'location' => $this->location,
            'town' => $this->town,
            'area' => $this->area,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'is_verified' => $this->is_verified,
            'status' => $this->status,
            'open_now' => $commerceMeta['open_now'],
            'availability_status' => $commerceMeta['availability_status'],
            'availability' => $commerceMeta['availability'],
            'availability_code' => $commerceMeta['availability_code'],
            'commerce_category' => $commerceMeta['commerce_category'],
            'delivery_fee' => $commerceMeta['delivery_fee'],
            'delivery_eta_minutes' => $commerceMeta['delivery_eta_minutes'],
            'fast_delivery' => $commerceMeta['fast_delivery'],
            'emergency_contact' => $this->emergency_contact,
            'is_public_service' => $this->is_public_service,
            'followers_count' => $followersCount,
            'review_count' => $commerceMeta['review_count'],
            'rating' => $commerceMeta['rating'],
            'opening_hours' => $this->opening_hours,
            'rates' => $this->rates,
            'services_offered' => $this->services_offered,
            'alerts' => $alerts,
            'service_providers' => ServiceProviderResource::collection($this->whenLoaded('serviceProviders')),
            'services' => ServiceResource::collection($this->whenLoaded('services')),
        ];
    }
}
