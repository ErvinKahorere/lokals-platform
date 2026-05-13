<?php

namespace App\Events;

use App\Models\CityReport;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IssueStatusUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    public function __construct(public CityReport $report, public int|string|null $townId = null)
    {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::unique([
            RealtimeChannels::user($this->report->user_id),
            ...RealtimeChannels::operational($this->townId ?? $this->report->town),
        ]);
    }

    public function broadcastAs(): string
    {
        return 'issue.status.updated';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'issue.status.updated',
            id: $this->report->id,
            resourceType: 'city_report',
            resourceId: $this->report->id,
            townId: $this->townId ?? $this->report->town,
            userId: $this->report->user_id,
            message: "Issue report '{$this->report->title}' is now {$this->report->status}.",
            createdAt: $this->report->updated_at,
            extra: [
                'status' => $this->report->status,
                'title' => $this->report->title,
                'area' => $this->report->area,
            ],
        );
    }
}
