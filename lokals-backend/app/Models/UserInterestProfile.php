<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserInterestProfile extends Model
{
    protected $fillable = [
        'user_id',
        'interest_key',
        'interest_type',
        'weight',
        'metadata',
    ];

    protected $casts = [
        'weight' => 'float',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
