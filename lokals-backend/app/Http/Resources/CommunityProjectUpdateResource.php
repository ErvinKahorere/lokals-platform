<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityProjectUpdateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'status_after_update' => $this->status_after_update,
            'progress_percent' => $this->progress_percent,
            'approved_by_town_manager' => (bool) $this->approved_by_town_manager,
            'attachments' => collect($this->attachments ?? [])
                ->map(fn (array $attachment) => [
                    ...$attachment,
                    'file_url' => MediaUrl::resolve($attachment['file_url'] ?? $attachment['file_path'] ?? null),
                ])
                ->values(),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => \App\Support\MediaUrl::resolve($this->user->avatar),
            ] : null,
        ];
    }
}
