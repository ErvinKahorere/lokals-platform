<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserEngagementMetric extends Model
{
    protected $fillable = [
        'user_id',
        'metric_key',
        'metric_value',
        'metadata',
        'last_recorded_at',
    ];

    protected $casts = [
        'metric_value' => 'float',
        'metadata' => 'array',
        'last_recorded_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
