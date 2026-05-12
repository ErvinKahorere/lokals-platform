<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityImpactRedemptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'reward_id' => $this->reward_id,
            'points_spent' => $this->points_spent,
            'status' => $this->status,
            'fulfillment_notes' => $this->fulfillment_notes,
            'fulfilled_by' => $this->fulfilled_by,
            'fulfilled_at' => optional($this->fulfilled_at)->toIso8601String(),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'reward' => $this->whenLoaded('reward', fn () => CommunityImpactRewardResource::make($this->reward)),
            'user' => $this->whenLoaded('user', fn () => ['id' => $this->user?->id, 'name' => $this->user?->name]),
            'fulfiller' => $this->whenLoaded('fulfiller', fn () => ['id' => $this->fulfiller?->id, 'name' => $this->fulfiller?->name]),
        ];
    }
}
