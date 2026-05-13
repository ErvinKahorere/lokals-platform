<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationBadge extends Model
{
    protected $fillable = [
        'key',
        'title',
        'description',
        'scope',
        'icon',
        'tone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
