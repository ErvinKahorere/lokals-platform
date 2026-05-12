<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityImpactBadge extends Model
{
    protected $fillable = [
        'title',
        'description',
        'icon',
        'category',
        'points_threshold',
        'rule_key',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
