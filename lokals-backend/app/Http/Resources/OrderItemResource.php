<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'name' => $this->name,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'total_price' => $this->total_price,
            'notes' => $this->notes,
            'product' => $this->product ? [
                'id' => $this->product->id,
                'title' => $this->product->title,
                'image_url' => MediaUrl::resolve($this->product->image_path),
            ] : null,
        ];
    }
}
