<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'summary' => $this->summary,
            'body' => $this->body,
            'media_url' => $this->media_url,
            'external_url' => $this->external_url,
            'town' => $this->town,
            'area' => $this->area,
            'status' => $this->status,
            'is_featured' => (bool) $this->is_featured,
            'priority' => $this->priority,
            'published_at' => optional($this->published_at)->toIso8601String(),
            'rejection_reason' => $request->user()?->hasTownManagerAccess() ? $this->rejection_reason : null,
            'category' => $this->whenLoaded('category', fn () => FeedCategoryResource::make($this->category)),
            'source' => $this->whenLoaded('source', fn () => [
                'id' => $this->source?->id,
                'name' => $this->source?->name,
                'source_type' => $this->source?->source_type,
            ]),
            'metadata' => $this->metadata ?? [],
        ];
    }
}
