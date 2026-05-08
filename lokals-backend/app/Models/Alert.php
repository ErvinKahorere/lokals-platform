<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'type',
        'audience',
        'location',
        'town',
        'area',
        'priority',
        'starts_at',
        'ends_at',
        'is_active',
        'is_public',
        'created_by',
        'channels',
        'alertable_type',
        'alertable_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'bool',
            'is_public' => 'bool',
            'channels' => 'array',
        ];
    }
}
