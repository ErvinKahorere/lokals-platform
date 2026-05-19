<?php

namespace App\Http\Resources;

use App\Models\HireBooking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HireBookingResource extends JsonResource
{
    /**
     * @mixin HireBooking
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_code' => sprintf('HIRE-%05d', $this->id),
            'item' => HireItemResource::make($this->whenLoaded('item')),
            'customer' => UserResource::make($this->whenLoaded('customer')),
            'owner' => UserResource::make($this->whenLoaded('owner')),
            'courier' => UserResource::make($this->whenLoaded('courier')),
            'status' => $this->status,
            'status_label' => str($this->status)->replace('_', ' ')->title()->toString(),
            'start_at' => optional($this->start_at)->toIso8601String(),
            'end_at' => optional($this->end_at)->toIso8601String(),
            'quantity' => $this->quantity,
            'totals' => [
                'rental_fee' => $this->rental_fee,
                'deposit_amount' => $this->deposit_amount,
                'delivery_fee' => $this->delivery_fee,
                'total' => $this->total,
            ],
            'payment_status' => $this->payment_status,
            'pickup_method' => $this->pickup_method,
            'delivery_info' => [
                'address' => $this->delivery_address,
                'latitude' => $this->delivery_latitude,
                'longitude' => $this->delivery_longitude,
            ],
            'timeline' => $this->timeline(),
            'next_action' => $this->nextAction(),
            'notes' => $this->notes,
            'owner_notes' => $this->owner_notes,
            'customer_rating' => $this->customer_rating,
            'customer_rating_comment' => $this->customer_rating_comment,
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
        ];
    }

    protected function timeline(): array
    {
        return [
            ['key' => 'pending', 'label' => 'Request placed', 'timestamp' => optional($this->created_at)->toIso8601String()],
            ['key' => 'accepted', 'label' => 'Accepted', 'timestamp' => optional($this->accepted_at)->toIso8601String()],
            ['key' => 'handed_over', 'label' => 'Handed over', 'timestamp' => optional($this->handed_over_at)->toIso8601String()],
            ['key' => 'returned', 'label' => 'Returned', 'timestamp' => optional($this->returned_at)->toIso8601String()],
            ['key' => 'completed', 'label' => 'Completed', 'timestamp' => optional($this->completed_at)->toIso8601String()],
            ['key' => 'cancelled', 'label' => 'Cancelled', 'timestamp' => optional($this->cancelled_at)->toIso8601String()],
        ];
    }

    protected function nextAction(): ?string
    {
        return match ($this->status) {
            HireBooking::STATUS_PENDING => 'Waiting for owner review',
            HireBooking::STATUS_ACCEPTED => 'Confirm collection or delivery',
            HireBooking::STATUS_CONFIRMED => 'Prepare for handover',
            HireBooking::STATUS_HANDED_OVER => 'Item is currently in use',
            HireBooking::STATUS_RETURN_DUE => 'Return is due soon',
            HireBooking::STATUS_RETURNED => 'Owner can complete this booking',
            default => null,
        };
    }
}
