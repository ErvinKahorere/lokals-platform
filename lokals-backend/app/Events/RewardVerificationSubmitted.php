<?php

namespace App\Events;

use App\Models\CommunityImpactTransaction;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RewardVerificationSubmitted implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    public function __construct(
        public CommunityImpactTransaction $transaction,
        public int|string|null $townId = null,
    ) {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::unique([
            RealtimeChannels::user($this->transaction->user_id),
            ...RealtimeChannels::operational($this->townId),
        ]);
    }

    public function broadcastAs(): string
    {
        return 'reward.verification.submitted';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'reward.verification.submitted',
            id: $this->transaction->id,
            resourceType: 'community_impact_transaction',
            resourceId: $this->transaction->id,
            townId: $this->townId,
            userId: $this->transaction->user_id,
            message: 'Reward verification is now '.str_replace('_', ' ', $this->transaction->verification_status).'.',
            createdAt: $this->transaction->updated_at,
            extra: [
                'verification_status' => $this->transaction->verification_status,
                'points' => $this->transaction->points,
                'category' => $this->transaction->category,
            ],
        );
    }
}
