<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityImpactLeaderboardSnapshot extends Model
{
    protected $fillable = [
        'period_key',
        'captured_at',
        'rows',
    ];

    protected function casts(): array
    {
        return [
            'captured_at' => 'datetime',
            'rows' => 'array',
        ];
    }
}
