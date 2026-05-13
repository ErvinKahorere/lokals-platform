<?php

namespace App\Events;

use App\Models\ModerationAction;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ModerationActionTaken implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    public function __construct(public ModerationAction $action)
    {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::operational($this->action->metadata['town'] ?? null);
    }

    public function broadcastAs(): string
    {
        return 'moderation.action.taken';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'moderation.action.taken',
            id: $this->action->id,
            resourceType: 'moderation_action',
            resourceId: $this->action->id,
            townId: $this->action->metadata['town'] ?? null,
            userId: $this->action->actor_id,
            message: $this->action->notes ?: 'Moderation action recorded.',
            createdAt: $this->action->created_at,
            extra: [
                'action' => $this->action->action,
            ],
        );
    }
}
