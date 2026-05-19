<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing([
            'customer:id,name,phone,avatar,default_town,default_area',
            'business:id,owner_user_id,name,category,phone,whatsapp,logo_url,town,area,location,lat,lng,is_verified',
            'courier:id,name,phone,avatar,default_town,default_area',
            'items.product:id,title,image_path',
        ]);

        return [
            'id' => $this->id,
            'reference_code' => sprintf('ORD-%05d', $this->id),
            'status' => $this->status,
            'status_label' => $this->statusLabel((string) $this->status),
            'tracking_status' => $this->trackingStatus((string) $this->status),
            'next_action_label' => $this->nextActionLabel((string) $this->status),
            'estimated_arrival_minutes' => $this->estimatedArrivalMinutes((string) $this->status),
            'customer' => $this->customer ? [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone,
                'avatar' => $this->customer->avatar,
                'default_town' => $this->customer->default_town,
                'default_area' => $this->customer->default_area,
            ] : null,
            'seller' => $this->business ? [
                'id' => $this->business->id,
                'name' => $this->business->name,
                'category' => $this->business->category,
                'phone' => $this->business->phone,
                'whatsapp' => $this->business->whatsapp,
                'logo_url' => $this->business->logo_url,
                'town' => $this->business->town,
                'area' => $this->business->area,
                'location' => $this->business->location,
                'is_verified' => $this->business->is_verified,
            ] : null,
            'business' => $this->business ? [
                'id' => $this->business->id,
                'name' => $this->business->name,
                'category' => $this->business->category,
                'phone' => $this->business->phone,
                'whatsapp' => $this->business->whatsapp,
                'logo_url' => $this->business->logo_url,
                'town' => $this->business->town,
                'area' => $this->business->area,
                'location' => $this->business->location,
                'is_verified' => $this->business->is_verified,
            ] : null,
            'courier' => $this->courier ? [
                'id' => $this->courier->id,
                'name' => $this->courier->name,
                'phone' => $this->courier->phone,
                'avatar' => $this->courier->avatar,
            ] : null,
            'items' => OrderItemResource::collection($this->items),
            'totals' => [
                'subtotal' => $this->subtotal,
                'delivery_fee' => $this->delivery_fee,
                'service_fee' => $this->service_fee,
                'total' => $this->total,
            ],
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'notes' => $this->notes,
            'delivery_location' => [
                'address' => $this->delivery_address,
                'latitude' => $this->delivery_latitude,
                'longitude' => $this->delivery_longitude,
                'town' => $this->town,
                'area' => $this->area,
            ],
            'pickup_location' => [
                'address' => $this->pickup_address,
                'latitude' => $this->pickup_latitude,
                'longitude' => $this->pickup_longitude,
            ],
            'customer_rating' => $this->customer_rating,
            'customer_rating_comment' => $this->customer_rating_comment,
            'support_shortcuts' => [
                'call_seller' => filled($this->business?->phone),
                'call_courier' => filled($this->courier?->phone),
                'supports_whatsapp' => filled($this->business?->whatsapp),
            ],
            'reorder_payload' => [
                'business_id' => $this->business_id,
                'items' => $this->items->map(fn ($item) => [
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                ])->values(),
            ],
            'timeline' => array_values(array_filter([
                ['key' => Order::STATUS_PENDING, 'label' => 'Order placed', 'timestamp' => optional($this->created_at)->toIso8601String()],
                ['key' => Order::STATUS_ACCEPTED, 'label' => 'Seller accepted', 'timestamp' => optional($this->accepted_at)->toIso8601String()],
                ['key' => Order::STATUS_PREPARING, 'label' => 'Preparing order', 'timestamp' => optional($this->preparing_at)->toIso8601String()],
                ['key' => Order::STATUS_READY_FOR_PICKUP, 'label' => 'Ready for pickup', 'timestamp' => optional($this->ready_at)->toIso8601String()],
                ['key' => Order::STATUS_COURIER_ASSIGNED, 'label' => 'Courier assigned', 'timestamp' => optional($this->updated_at && $this->status === Order::STATUS_COURIER_ASSIGNED ? $this->updated_at : null)->toIso8601String()],
                ['key' => Order::STATUS_PICKED_UP, 'label' => 'Picked up', 'timestamp' => optional($this->picked_up_at)->toIso8601String()],
                ['key' => Order::STATUS_DELIVERED, 'label' => 'Delivered', 'timestamp' => optional($this->delivered_at)->toIso8601String()],
                ['key' => Order::STATUS_CANCELLED, 'label' => 'Cancelled', 'timestamp' => optional($this->cancelled_at)->toIso8601String()],
            ], fn (array $item) => filled($item['timestamp']))),
            'tracking_steps' => $this->trackingSteps((string) $this->status),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
        ];
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            Order::STATUS_READY_FOR_PICKUP => 'Ready for pickup',
            Order::STATUS_COURIER_ASSIGNED => 'Courier assigned',
            Order::STATUS_PICKED_UP => 'Picked up',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    private function trackingStatus(string $status): string
    {
        return match ($status) {
            Order::STATUS_ACCEPTED, Order::STATUS_PREPARING => 'seller_preparing',
            Order::STATUS_READY_FOR_PICKUP => 'awaiting_courier',
            Order::STATUS_COURIER_ASSIGNED => 'courier_heading_to_pickup',
            Order::STATUS_PICKED_UP => 'courier_en_route',
            default => $status,
        };
    }

    private function nextActionLabel(string $status): string
    {
        return match ($status) {
            Order::STATUS_PENDING => 'Waiting for seller confirmation',
            Order::STATUS_ACCEPTED => 'Seller accepted your order',
            Order::STATUS_PREPARING => 'Preparing your order',
            Order::STATUS_READY_FOR_PICKUP => 'Waiting for a courier',
            Order::STATUS_COURIER_ASSIGNED => 'Courier heading to pickup',
            Order::STATUS_PICKED_UP => 'Courier is on the way',
            Order::STATUS_DELIVERED => 'Delivered successfully',
            Order::STATUS_CANCELLED => 'Order cancelled',
            Order::STATUS_REJECTED => 'Order rejected',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    private function estimatedArrivalMinutes(string $status): ?int
    {
        return match ($status) {
            Order::STATUS_PENDING => 40,
            Order::STATUS_ACCEPTED => 32,
            Order::STATUS_PREPARING => 24,
            Order::STATUS_READY_FOR_PICKUP => 18,
            Order::STATUS_COURIER_ASSIGNED => 14,
            Order::STATUS_PICKED_UP => 8,
            default => null,
        };
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function trackingSteps(string $status): array
    {
        $rank = match ($status) {
            Order::STATUS_PENDING => 1,
            Order::STATUS_ACCEPTED => 2,
            Order::STATUS_PREPARING => 3,
            Order::STATUS_READY_FOR_PICKUP => 4,
            Order::STATUS_COURIER_ASSIGNED => 5,
            Order::STATUS_PICKED_UP => 6,
            Order::STATUS_DELIVERED => 8,
            default => 0,
        };

        return [
            ['key' => 'placed', 'label' => 'Order placed', 'state' => $rank >= 1 ? 'complete' : 'upcoming'],
            ['key' => 'accepted', 'label' => 'Accepted', 'state' => $rank >= 2 ? 'complete' : 'upcoming'],
            ['key' => 'preparing', 'label' => 'Preparing', 'state' => $rank >= 3 ? 'complete' : 'upcoming'],
            ['key' => 'ready_for_pickup', 'label' => 'Ready', 'state' => $rank >= 4 ? 'complete' : 'upcoming'],
            ['key' => 'courier_assigned', 'label' => 'Courier assigned', 'state' => $rank >= 5 ? 'complete' : 'upcoming'],
            ['key' => 'picked_up', 'label' => 'Picked up', 'state' => $rank >= 6 ? 'complete' : 'upcoming'],
            ['key' => 'nearby', 'label' => 'Nearby', 'state' => $rank >= 7 ? 'complete' : ($status === Order::STATUS_PICKED_UP ? 'active' : 'upcoming')],
            ['key' => 'delivered', 'label' => 'Delivered', 'state' => $rank >= 8 ? 'complete' : 'upcoming'],
        ];
    }
}
