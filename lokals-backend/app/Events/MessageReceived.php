<?php

namespace App\Events;

use App\Support\RealtimeChannels;
use App\Support\RealtimePayload;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReceived implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public bool $afterCommit = true;

    /**
     * @param  array<int, int|string>  $recipientUserIds
     */
    public function __construct(
        public string $context,
        public int|string $conversationId,
        public int|string $messageId,
        public array $recipientUserIds,
        public int|string|null $senderUserId = null,
        public int|string|null $townId = null,
        public ?string $body = null,
        public mixed $createdAt = null,
    ) {
    }

    public function broadcastOn(): array
    {
        return RealtimeChannels::users($this->recipientUserIds);
    }

    public function broadcastAs(): string
    {
        return 'message.received';
    }

    public function broadcastWith(): array
    {
        return RealtimePayload::make(
            type: 'message.received',
            id: $this->messageId,
            resourceType: 'message',
            resourceId: $this->messageId,
            townId: $this->townId,
            userId: $this->senderUserId,
            message: $this->body ?: 'A new message arrived.',
            createdAt: $this->createdAt,
            extra: [
                'conversation_id' => (string) $this->conversationId,
                'context' => $this->context,
            ],
        );
    }
}
