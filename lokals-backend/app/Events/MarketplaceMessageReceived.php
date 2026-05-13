<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MarketplaceMessageReceived implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Conversation $conversation, public Message $message)
    {
    }

    public function broadcastOn(): array
    {
        return $this->conversation->participants
            ->map(fn ($participant) => new PrivateChannel('users.'.$participant->user_id))
            ->all();
    }

    public function broadcastAs(): string
    {
        return 'marketplace.message.received';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->message->id,
            'body' => $this->message->body,
            'context' => $this->conversation->context,
        ];
    }
}
