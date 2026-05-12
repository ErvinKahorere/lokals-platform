<?php

namespace App\Http\Resources;

use App\Services\CommunityImpactService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityImpactAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $service = app(CommunityImpactService::class);
        $currentBadge = $service->currentBadge($this->resource);
        $nextBadge = $service->nextBadge($this->resource);

        return [
            'user_id' => $this->user_id,
            'total_points' => $this->total_points,
            'available_points' => $this->available_points,
            'lifetime_points' => $this->lifetime_points,
            'redeemed_points' => $this->redeemed_points,
            'current_level' => $this->current_level,
            'public_leaderboard_opt_in' => (bool) $this->public_leaderboard_opt_in,
            'public_display_name' => $this->public_display_name,
            'privacy_mode' => $this->privacy_mode,
            'last_awarded_at' => optional($this->last_awarded_at)->toIso8601String(),
            'current_badge' => $currentBadge ? CommunityImpactBadgeResource::make($currentBadge) : null,
            'next_badge' => $nextBadge ? CommunityImpactBadgeResource::make($nextBadge) : null,
        ];
    }
}
