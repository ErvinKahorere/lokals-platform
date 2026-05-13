<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VerificationRequest extends Model
{
    protected $fillable = [
        'user_id',
        'request_type',
        'status',
        'notes',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
        'submitted_data',
    ];

    protected $casts = [
        'submitted_data' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function verifiable(): MorphTo
    {
        return $this->morphTo();
    }
}
