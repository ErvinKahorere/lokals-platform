<?php

namespace App\Http\Resources;

use App\Support\CommerceAvailability;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $followersCount = (int) ($this->business?->followers_count ?? 0);
        $serviceCount = collect($this->business?->services ?? [])->count() + collect($this->business?->serviceProviders ?? [])->count();
        $commerceMeta = CommerceAvailability::commerceMeta(
            $this->category ?? $this->business?->category,
            $this->business?->status ?? $this->status,
            is_array($this->business?->opening_hours) ? $this->business->opening_hours : null,
            $followersCount,
            $serviceCount,
            (bool) ($this->business?->is_verified ?? false),
        );

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'image_url' => MediaUrl::resolve($this->image_path),
            'category' => $this->category,
            'town' => $this->town,
            'area' => $this->area,
            'stock_status' => $this->stock_status,
            'status' => $this->status,
            'hero_image_url' => MediaUrl::resolve($this->image_path ?: $this->business?->logo_url),
            'open_now' => $commerceMeta['open_now'],
            'availability_status' => $commerceMeta['availability_status'],
            'availability' => $commerceMeta['availability'],
            'availability_code' => $commerceMeta['availability_code'],
            'delivery_fee' => $commerceMeta['delivery_fee'],
            'delivery_eta_minutes' => $commerceMeta['delivery_eta_minutes'],
            'fast_delivery' => $commerceMeta['fast_delivery'],
            'rating' => $commerceMeta['rating'],
            'review_count' => $commerceMeta['review_count'],
            'commerce_category' => $commerceMeta['commerce_category'],
            'is_featured' => $commerceMeta['featured'],
            'is_popular' => $commerceMeta['popular'],
            'business' => $this->business ? [
                'id' => $this->business->id,
                'name' => $this->business->name,
                'category' => $this->business->category,
                'phone' => $this->business->phone,
                'whatsapp' => $this->business->whatsapp,
                'logo_url' => MediaUrl::resolve($this->business->logo_url),
                'is_verified' => $this->business->is_verified,
                'town' => $this->business->town,
                'area' => $this->business->area,
                'location' => $this->business->location,
                'open_now' => $commerceMeta['open_now'],
                'availability_status' => $commerceMeta['availability_status'],
                'availability' => $commerceMeta['availability'],
                'availability_code' => $commerceMeta['availability_code'],
                'delivery_fee' => $commerceMeta['delivery_fee'],
                'delivery_eta_minutes' => $commerceMeta['delivery_eta_minutes'],
                'fast_delivery' => $commerceMeta['fast_delivery'],
                'rating' => $commerceMeta['rating'],
                'review_count' => $commerceMeta['review_count'],
                'opening_hours' => $this->business->opening_hours,
            ] : null,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'phone' => $this->user->phone,
                'avatar' => MediaUrl::resolve($this->user->avatar),
                'business_name' => $this->user->business_name,
                'whatsapp' => $this->user->whatsapp,
                'default_town' => $this->user->default_town,
                'default_area' => $this->user->default_area,
                'location' => $this->user->location,
            ] : null,
        ];
    }
}
