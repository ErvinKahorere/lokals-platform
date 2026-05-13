<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AiAssistRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'module' => $this->module,
            'provider_key' => $this->provider_key,
            'status' => $this->status,
            'original_media_url' => $this->original_media_url,
            'original_filename' => $this->original_filename,
            'payload' => $this->payload ?? [],
            'safety_status' => $this->safety_status,
            'confidence_score' => $this->confidence_score,
            'needs_user_review' => (bool) $this->needs_user_review,
            'suggestions' => $this->whenLoaded('suggestions', fn () => $this->suggestions->map(fn ($item) => [
                'id' => $item->id,
                'suggestion_type' => $item->suggestion_type,
                'content' => $item->content ?? [],
                'is_primary' => (bool) $item->is_primary,
            ])),
        ];
    }
}
