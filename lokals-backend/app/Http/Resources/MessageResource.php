<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'user_id' => $this->user_id,
            'message_type' => $this->message_type,
            'body' => $this->body,
            'status' => $this->status,
            'is_system' => (bool) $this->is_system,
            'metadata' => $this->metadata ?? [],
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => MediaUrl::resolve($this->user->avatar),
            ] : null,
            'attachments' => $this->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'file_url' => MediaUrl::resolve($attachment->file_url ?: $attachment->file_path),
                'thumbnail_url' => MediaUrl::resolve($attachment->thumbnail_url),
                'file_type' => $attachment->file_type,
                'mime_type' => $attachment->mime_type,
                'file_size' => $attachment->file_size,
            ])->values(),
            'read_receipts' => $this->readReceipts->map(fn ($receipt) => [
                'user_id' => $receipt->user_id,
                'read_at' => optional($receipt->read_at)?->toIso8601String(),
            ])->values(),
        ];
    }
}
