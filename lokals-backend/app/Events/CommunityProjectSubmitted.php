<?php

namespace App\Events;

use App\Models\CommunityProject;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommunityProjectSubmitted implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    public function __construct(public CommunityProject $project)
    {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::unique([
            RealtimeChannels::user($this->project->user_id),
            ...RealtimeChannels::operational($this->project->town),
        ]);
    }

    public function broadcastAs(): string
    {
        return 'community.project.submitted';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'community.project.submitted',
            id: $this->project->id,
            resourceType: 'community_project',
            resourceId: $this->project->id,
            townId: $this->project->town,
            userId: $this->project->user_id,
            message: 'Community project status is now '.str_replace('_', ' ', $this->project->verification_status).'.',
            createdAt: $this->project->updated_at,
            extra: [
                'status' => $this->project->status,
                'verification_status' => $this->project->verification_status,
            ],
        );
    }
}
