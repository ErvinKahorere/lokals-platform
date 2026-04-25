<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'nationality',
        'preferred_language',
        'date_of_birth',
        'gender',
        'location',
        'lat',
        'lng',
        'avatar_url',
        'onboarding_stage',
        'completed_fields',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'completed_fields' => 'array',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
