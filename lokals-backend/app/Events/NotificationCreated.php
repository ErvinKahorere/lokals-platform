<?php

namespace App\Events;

use App\Models\User;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    public function __construct(public DatabaseNotification $notification)
    {
    }

    public function broadcastOn(): array
    {
        if ($this->notification->notifiable_type !== User::class) {
            return [];
        }

        return [RealtimeChannels::user($this->notification->notifiable_id)];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        $data = is_array($this->notification->data) ? $this->notification->data : [];

        return RealtimePayload::make(
            type: 'notification.created',
            id: $this->notification->id,
            resourceType: 'notification',
            resourceId: $this->notification->id,
            townId: $data['town'] ?? null,
            userId: $this->notification->notifiable_id,
            message: $data['body'] ?? $data['title'] ?? 'You have a new notification.',
            createdAt: $this->notification->created_at,
            extra: [
                'notification_type' => $data['type'] ?? null,
            ],
        );
    }
}
