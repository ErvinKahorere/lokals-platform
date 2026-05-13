<?php

namespace App\Services;

use App\Events\MessageReceived;
use App\Events\MarketplaceMessageReceived;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageReadReceipt;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class MessagingService
{
    public function createConversation(User $creator, array $participantIds, string $context = 'general', ?Model $conversationable = null, ?string $subject = null): Conversation
    {
        $conversation = Conversation::query()->create([
            'context' => $context,
            'subject' => $subject,
            'status' => 'active',
            'created_by' => $creator->id,
            'metadata' => [],
        ]);

        if ($conversationable !== null) {
            $conversation->conversationable()->associate($conversationable);
            $conversation->save();
        }

        $allParticipantIds = collect([$creator->id, ...$participantIds])->unique()->values();
        foreach ($allParticipantIds as $userId) {
            ConversationParticipant::query()->updateOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $userId],
                ['joined_at' => now(), 'status' => 'active']
            );
        }

        return $conversation->load('participants.user');
    }

    public function sendMessage(Conversation $conversation, ?User $sender, string $body, string $messageType = 'text', array $metadata = []): Message
    {
        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $sender?->id,
            'message_type' => $messageType,
            'body' => $body,
            'status' => 'sent',
            'metadata' => $metadata,
            'is_system' => $sender === null,
        ]);

        $conversation->forceFill([
            'last_message_id' => $message->id,
            'last_message_at' => $message->created_at,
        ])->save();

        if ($conversation->context === 'marketplace') {
            broadcast(new MarketplaceMessageReceived($conversation->fresh(['participants.user', 'lastMessage']), $message->fresh('user')))->toOthers();
        }
        broadcast(new MessageReceived(
            context: $conversation->context,
            conversationId: $conversation->id,
            messageId: $message->id,
            recipientUserIds: $conversation->participants()->pluck('user_id')->all(),
            senderUserId: $sender?->id,
            body: $message->body,
            createdAt: $message->created_at,
        ))->toOthers();

        return $message->load(['user', 'attachments', 'readReceipts']);
    }

    public function markRead(Message $message, User $user): MessageReadReceipt
    {
        $receipt = MessageReadReceipt::query()->updateOrCreate(
            ['message_id' => $message->id, 'user_id' => $user->id],
            ['read_at' => now()],
        );

        ConversationParticipant::query()
            ->where('conversation_id', $message->conversation_id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        return $receipt;
    }
}
