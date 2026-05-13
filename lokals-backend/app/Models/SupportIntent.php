<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportIntent extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'training_phrases',
        'response_template',
        'suggested_route',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'training_phrases' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
