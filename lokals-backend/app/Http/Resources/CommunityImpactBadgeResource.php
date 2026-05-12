<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityImpactBadgeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'icon' => $this->icon,
            'category' => $this->category,
            'points_threshold' => $this->points_threshold,
            'rule_key' => $this->rule_key,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
