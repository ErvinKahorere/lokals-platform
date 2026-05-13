<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewTownAnnouncement implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public array $payload)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('town.'.($this->payload['town'] ?? 'Okahandja')),
            new Channel('announcements'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'town.announcement.new';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
