<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityProjectAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'file_url' => MediaUrl::resolve($this->file_url ?: $this->file_path),
            'file_path' => $this->file_path,
            'mime_type' => $this->mime_type,
            'file_type' => $this->file_type,
            'original_name' => $this->original_name,
            'size' => $this->size,
            'caption' => $this->caption,
            'created_at' => optional($this->created_at)?->toIso8601String(),
        ];
    }
}
