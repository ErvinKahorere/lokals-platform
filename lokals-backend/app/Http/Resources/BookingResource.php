<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_date' => optional($this->booking_date)->toDateString(),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'notes' => $this->notes,
            'user' => UserResource::make($this->whenLoaded('user')),
            'service' => ServiceResource::make($this->whenLoaded('service')),
            'service_provider' => ServiceProviderResource::make($this->whenLoaded('serviceProvider')),
        ];
    }
}
