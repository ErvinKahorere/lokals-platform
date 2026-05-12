<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityImpactAccount extends Model
{
    protected $fillable = [
        'user_id',
        'total_points',
        'available_points',
        'lifetime_points',
        'redeemed_points',
        'current_level',
        'public_leaderboard_opt_in',
        'public_display_name',
        'privacy_mode',
        'last_awarded_at',
    ];

    protected function casts(): array
    {
        return [
            'public_leaderboard_opt_in' => 'boolean',
            'last_awarded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
