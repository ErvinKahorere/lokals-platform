<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ModerationFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'flaggable_type',
        'flaggable_id',
        'reason',
        'details',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function flaggable(): MorphTo
    {
        return $this->morphTo();
    }
}
