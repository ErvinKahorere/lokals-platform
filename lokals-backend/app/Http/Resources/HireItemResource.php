<?php

namespace App\Http\Resources;

use App\Models\HireItem;
use App\Support\HireAvailability;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HireItemResource extends JsonResource
{
    /**
     * @mixin HireItem
     */
    public function toArray(Request $request): array
    {
        $start = $request->query('start_at') ? Carbon::parse((string) $request->query('start_at')) : null;
        $end = $request->query('end_at') ? Carbon::parse((string) $request->query('end_at')) : null;
        $availability = HireAvailability::summary($this->resource, $start, $end);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'owner' => UserResource::make($this->whenLoaded('owner')),
            'business' => OrganizationResource::make($this->whenLoaded('business')),
            'town' => $this->town,
            'area' => $this->area,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'prices' => [
                'price_per_hour' => $this->price_per_hour,
                'price_per_day' => $this->price_per_day,
            ],
            'deposit' => $this->deposit_amount,
            'replacement_value' => $this->replacement_value,
            'delivery_available' => $this->delivery_available,
            'pickup_available' => $this->pickup_available,
            'condition' => $this->condition,
            'status' => $this->status,
            'verification_status' => $this->verification_status,
            'images' => $this->images ?? [],
            'rules' => $this->rules ?? [],
            'included_items' => $this->included_items ?? [],
            'rating' => round(4.3 + min(0.6, ((int) ($this->bookings_count ?? 0)) / 20), 1),
            'bookings_count' => (int) ($this->bookings_count ?? 0),
            'availability_summary' => $availability,
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
