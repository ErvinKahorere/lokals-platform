<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityImpactReward extends Model
{
    protected $fillable = [
        'title',
        'description',
        'reward_type',
        'points_required',
        'quantity_available',
        'sponsor_name',
        'sponsor_logo',
        'terms',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(CommunityImpactRedemption::class, 'reward_id');
    }
}
