<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityImpactTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'source_type',
        'source_id',
        'points',
        'type',
        'reason',
        'category',
        'verification_status',
        'verified_by',
        'verified_at',
        'internal_notes',
        'public_summary',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'is_public' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
