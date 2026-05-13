<?php

namespace App\Events;

use App\Models\EmergencyBroadcast;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmergencyAlertPublished implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    /**
     * @param  array<int, int|string|null>  $recipientUserIds
     */
    public function __construct(
        public EmergencyBroadcast $alert,
        public array $recipientUserIds = [],
    ) {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::unique([
            ...RealtimeChannels::users($this->recipientUserIds),
            ...RealtimeChannels::operational($this->alert->town),
        ]);
    }

    public function broadcastAs(): string
    {
        return 'emergency.alert.published';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'emergency.alert.published',
            id: $this->alert->id,
            resourceType: 'emergency_alert',
            resourceId: $this->alert->id,
            townId: $this->alert->town,
            userId: $this->alert->created_by,
            message: $this->alert->title,
            createdAt: $this->alert->created_at,
            extra: [
                'priority' => $this->alert->priority,
                'emergency_type' => $this->alert->emergency_type,
            ],
        );
    }
}
