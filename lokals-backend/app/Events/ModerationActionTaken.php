<?php

namespace App\Events;

use App\Models\ModerationAction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ModerationActionTaken implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public ModerationAction $action)
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel('moderation.queue')];
    }

    public function broadcastAs(): string
    {
        return 'moderation.action.taken';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->action->id,
            'action' => $this->action->action,
            'notes' => $this->action->notes,
        ];
    }
}
