<?php

namespace App\Http\Resources;

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
            'image_url' => $this->image_path,
            'category' => $this->category,
            'town' => $this->town,
            'area' => $this->area,
            'stock_status' => $this->stock_status,
            'status' => $this->status,
            'business' => $this->business?->only(['id', 'name', 'category', 'phone', 'whatsapp', 'logo_url']),
            'user' => $this->user?->only(['id', 'name', 'phone', 'avatar', 'business_name']),
        ];
    }
}
