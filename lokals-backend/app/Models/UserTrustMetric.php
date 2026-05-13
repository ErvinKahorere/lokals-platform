<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserTrustMetric extends Model
{
    protected $fillable = [
        'user_id',
        'score',
        'completed_requests',
        'successful_transactions',
        'contribution_count',
        'reports_resolved',
        'volunteer_activity',
        'avg_response_minutes',
        'badges',
        'last_verified_at',
    ];

    protected $casts = [
        'badges' => 'array',
        'last_verified_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trustable(): MorphTo
    {
        return $this->morphTo();
    }
}
