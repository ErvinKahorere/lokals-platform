<?php

namespace App\Events;

use App\Models\RideRequest;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RideRequestUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    /**
     * @param  array<int, int|string|null>  $additionalRecipientUserIds
     */
    public function __construct(
        public RideRequest $ride,
        public array $additionalRecipientUserIds = [],
        public int|string|null $townId = null,
    ) {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::unique([
            ...RealtimeChannels::users([
                $this->ride->user_id,
                $this->ride->driver_id,
                ...$this->additionalRecipientUserIds,
            ]),
            ...RealtimeChannels::operational($this->townId),
        ]);
    }

    public function broadcastAs(): string
    {
        return 'ride.request.updated';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'ride.request.updated',
            id: $this->ride->id,
            resourceType: 'ride_request',
            resourceId: $this->ride->id,
            townId: $this->townId,
            userId: $this->ride->user_id,
            message: 'Ride request is now '.str_replace('_', ' ', $this->ride->status).'.',
            createdAt: $this->ride->updated_at,
            extra: [
                'status' => $this->ride->status,
                'driver_id' => $this->ride->driver_id !== null ? (string) $this->ride->driver_id : null,
            ],
        );
    }
}
