<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class RecommendationScore extends Model
{
    protected $fillable = [
        'user_id',
        'category',
        'score',
        'signals',
        'calculated_at',
    ];

    protected $casts = [
        'score' => 'float',
        'signals' => 'array',
        'calculated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recommendable(): MorphTo
    {
        return $this->morphTo();
    }
}
