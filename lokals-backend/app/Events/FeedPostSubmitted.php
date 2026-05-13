<?php

namespace App\Events;

use App\Models\FeedPost;
use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedPostSubmitted implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    public function __construct(public FeedPost $feedPost)
    {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::operational($this->feedPost->town);
    }

    public function broadcastAs(): string
    {
        return 'feed.post.submitted';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'feed.post.submitted',
            id: $this->feedPost->id,
            resourceType: 'feed_post',
            resourceId: $this->feedPost->id,
            townId: $this->feedPost->town,
            userId: $this->feedPost->approved_by,
            message: 'Feed post is now '.str_replace('_', ' ', $this->feedPost->status).'.',
            createdAt: $this->feedPost->updated_at,
            extra: [
                'status' => $this->feedPost->status,
                'is_featured' => (bool) $this->feedPost->is_featured,
            ],
        );
    }
}
