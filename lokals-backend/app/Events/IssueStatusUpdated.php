<?php

namespace App\Events;

use App\Models\CityReport;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IssueStatusUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public CityReport $report)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('users.'.$this->report->user_id),
            new PrivateChannel('town.'.$this->report->town),
        ];
    }

    public function broadcastAs(): string
    {
        return 'issue.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->report->id,
            'status' => $this->report->status,
            'title' => $this->report->title,
            'town' => $this->report->town,
            'area' => $this->report->area,
        ];
    }
}
