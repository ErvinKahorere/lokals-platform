<?php

namespace App\Events;

use App\Models\DeliveryRequest;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryRequestUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    /**
     * @param  array<int, int|string|null>  $additionalRecipientUserIds
     */
    public function __construct(
        public DeliveryRequest $delivery,
        public array $additionalRecipientUserIds = [],
        public int|string|null $townId = null,
    ) {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::unique([
            ...RealtimeChannels::users([
                $this->delivery->user_id,
                $this->delivery->driver_id,
                ...$this->additionalRecipientUserIds,
            ]),
            ...RealtimeChannels::operational($this->townId),
        ]);
    }

    public function broadcastAs(): string
    {
        return 'delivery.request.updated';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'delivery.request.updated',
            id: $this->delivery->id,
            resourceType: 'delivery_request',
            resourceId: $this->delivery->id,
            townId: $this->townId,
            userId: $this->delivery->user_id,
            message: 'Delivery request is now '.str_replace('_', ' ', $this->delivery->status).'.',
            createdAt: $this->delivery->updated_at,
            extra: [
                'status' => $this->delivery->status,
                'driver_id' => $this->delivery->driver_id !== null ? (string) $this->delivery->driver_id : null,
            ],
        );
    }
}
