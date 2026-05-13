<?php

namespace App\Events;

use App\Models\CommunityImpactTransaction;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RewardApproved implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public CommunityImpactTransaction $transaction)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('users.'.$this->transaction->user_id)];
    }

    public function broadcastAs(): string
    {
        return 'reward.approved';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->transaction->id,
            'points' => $this->transaction->points,
            'reason' => $this->transaction->reason,
            'category' => $this->transaction->category,
        ];
    }
}
