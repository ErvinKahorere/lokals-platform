<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'context' => $this->context,
            'subject' => $this->subject,
            'status' => $this->status,
            'conversationable_type' => $this->conversationable_type,
            'conversationable_id' => $this->conversationable_id,
            'last_message_at' => optional($this->last_message_at)?->toIso8601String(),
            'metadata' => $this->metadata ?? [],
            'participants' => $this->participants->map(fn ($participant) => [
                'id' => $participant->id,
                'user_id' => $participant->user_id,
                'role' => $participant->role,
                'status' => $participant->status,
                'joined_at' => optional($participant->joined_at)?->toIso8601String(),
                'last_read_at' => optional($participant->last_read_at)?->toIso8601String(),
                'user' => $participant->user ? [
                    'id' => $participant->user->id,
                    'name' => $participant->user->name,
                    'phone' => $participant->user->phone,
                    'avatar' => $participant->user->avatar,
                ] : null,
            ])->values(),
            'last_message' => $this->whenLoaded('lastMessage', fn () => MessageResource::make($this->lastMessage)),
            'messages' => $this->whenLoaded('messages', fn () => MessageResource::collection($this->messages)),
        ];
    }
}
