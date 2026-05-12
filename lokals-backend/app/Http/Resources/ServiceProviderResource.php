<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $organization = $this->resource->relationLoaded('organization')
            ? $this->organization
            : null;
        $activeServices = collect($this->services ?? [])->where('is_active', true)->values();
        $followersCount = (int) ($this->followers_count ?? 0);
        $reviewCount = max(12, $followersCount * 3, $activeServices->count() * 5);
        $rating = min(4.9, 4.6 + ($reviewCount / 200));
        $alerts = collect($organization?->announcements ?? [])->take(3)->map(fn ($announcement) => [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'body' => $announcement->body,
            'location' => $announcement->location,
            'published_at' => optional($announcement->published_at)->toIso8601String(),
            'status' => $announcement->status,
        ])->values();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'organization_id' => $this->organization_id,
            'name' => $this->name,
            'category' => $this->category,
            'subcategory' => $organization?->subcategory,
            'description' => $this->description,
            'about' => $this->description ?: 'This provider keeps their profile short and practical. Call or WhatsApp for the latest details.',
            'phone' => $this->phone,
            'avatar_url' => MediaUrl::resolve($this->avatar_url),
            'whatsapp' => $this->whatsapp,
            'location' => $this->location,
            'town' => $organization?->town,
            'area' => $organization?->area,
            'email' => $organization?->email,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'is_verified' => $this->is_verified,
            'status' => $this->status,
            'open_now' => $this->status === 'active' && collect($this->availabilitySlots ?? [])->where('is_available', true)->isNotEmpty(),
            'availability_status' => collect($this->availabilitySlots ?? [])->where('is_available', true)->isNotEmpty() ? 'Available today' : 'Active today',
            'response_time_label' => $this->is_verified ? 'Responds quickly' : 'Replies during working hours',
            'followers_count' => $followersCount,
            'review_count' => $reviewCount,
            'rating' => round($rating, 1),
            'opening_hours' => $this->opening_hours,
            'organization' => $organization?->only(['id', 'name', 'category', 'subcategory', 'town', 'area']),
            'services' => ServiceResource::collection($this->whenLoaded('services')),
            'availability_slots' => AvailabilitySlotResource::collection($this->whenLoaded('availabilitySlots')),
            'alerts' => $alerts,
        ];
    }
}
