<?php

namespace App\Events;

use App\Models\CommunityProject;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommunityProjectUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public CommunityProject $project)
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel('town.'.$this->project->town)];
    }

    public function broadcastAs(): string
    {
        return 'community.project.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->project->id,
            'title' => $this->project->title,
            'status' => $this->project->status,
            'verification_status' => $this->project->verification_status,
            'progress_percent' => $this->project->progress_percent,
            'town' => $this->project->town,
        ];
    }
}
