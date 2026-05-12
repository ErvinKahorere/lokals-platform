<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
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
