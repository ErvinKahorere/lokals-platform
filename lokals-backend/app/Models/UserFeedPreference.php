<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFeedPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'interests',
        'hidden_category_ids',
        'muted_source_ids',
        'preferred_town',
        'preferred_area',
        'prioritize_followed_organizations',
    ];

    protected function casts(): array
    {
        return [
            'interests' => 'array',
            'hidden_category_ids' => 'array',
            'muted_source_ids' => 'array',
            'prioritize_followed_organizations' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
