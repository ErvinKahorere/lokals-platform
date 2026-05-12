<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityImpactTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'source_type' => $this->source_type,
            'source_id' => $this->source_id,
            'points' => $this->points,
            'type' => $this->type,
            'reason' => $this->reason,
            'category' => $this->category,
            'verification_status' => $this->verification_status,
            'verified_by' => $this->verified_by,
            'verified_at' => optional($this->verified_at)->toIso8601String(),
            'internal_notes' => $request->user()?->hasTownManagerAccess() || $request->user()?->hasRole('operator') || $request->user()?->hasRole('super_admin')
                ? $this->internal_notes
                : null,
            'public_summary' => $this->public_summary,
            'is_public' => (bool) $this->is_public,
            'created_at' => optional($this->created_at)->toIso8601String(),
            'verifier' => $this->whenLoaded('verifier', fn () => [
                'id' => $this->verifier?->id,
                'name' => $this->verifier?->name,
            ]),
        ];
    }
}
