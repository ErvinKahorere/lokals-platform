<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'channel' => $this->channel,
            'status' => $this->status,
            'topic' => $this->topic,
            'last_message_at' => optional($this->last_message_at)->toIso8601String(),
            'messages' => $this->whenLoaded('messages', fn () => $this->messages->map(fn ($message) => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'body' => $message->body,
                'intent_key' => $message->intent_key,
                'attachments' => $message->attachments ?? [],
                'metadata' => $message->metadata ?? [],
                'created_at' => optional($message->created_at)->toIso8601String(),
            ])),
            'escalations' => $this->whenLoaded('escalations', fn () => $this->escalations->map(fn ($escalation) => [
                'id' => $escalation->id,
                'reason' => $escalation->reason,
                'status' => $escalation->status,
                'notes' => $escalation->notes,
                'resolved_at' => optional($escalation->resolved_at)->toIso8601String(),
            ])),
        ];
    }
}
