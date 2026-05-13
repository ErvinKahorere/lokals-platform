<?php

namespace App\Events;

use App\Models\RoleApplication;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoleApplicationSubmitted implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    public function __construct(
        public RoleApplication $application,
        public int|string|null $townId = null,
    ) {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::unique([
            RealtimeChannels::user($this->application->user_id),
            ...RealtimeChannels::operational($this->townId),
        ]);
    }

    public function broadcastAs(): string
    {
        return 'role.application.submitted';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'role.application.submitted',
            id: $this->application->id,
            resourceType: 'role_application',
            resourceId: $this->application->id,
            townId: $this->townId,
            userId: $this->application->user_id,
            message: 'Role application is now '.str_replace('_', ' ', $this->application->status).'.',
            createdAt: $this->application->updated_at,
            extra: [
                'status' => $this->application->status,
                'requested_role' => $this->application->requested_role,
            ],
        );
    }
}
