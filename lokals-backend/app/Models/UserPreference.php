<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'default_town',
        'default_area',
        'interests',
        'preferred_roles',
        'notification_preferences',
    ];

    protected function casts(): array
    {
        return [
            'interests' => 'array',
            'preferred_roles' => 'array',
            'notification_preferences' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
