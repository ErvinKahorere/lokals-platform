<?php

namespace App\Events;

use App\Models\SupportConversation;
use App\Models\SupportMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageReceived implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public SupportConversation $conversation, public SupportMessage $message)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('users.'.$this->conversation->user_id)];
    }

    public function broadcastAs(): string
    {
        return 'support.message.received';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->message->id,
            'body' => $this->message->body,
            'sender_type' => $this->message->sender_type,
        ];
    }
}
