<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityImpactRewardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'reward_type' => $this->reward_type,
            'points_required' => $this->points_required,
            'quantity_available' => $this->quantity_available,
            'sponsor_name' => $this->sponsor_name,
            'sponsor_logo' => MediaUrl::resolve($this->sponsor_logo),
            'terms' => $this->terms,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
