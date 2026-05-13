<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchSuggestion extends Model
{
    protected $fillable = [
        'query',
        'category',
        'town',
        'area',
        'hits',
        'popularity',
        'is_trending',
        'last_used_at',
    ];

    protected $casts = [
        'is_trending' => 'boolean',
        'last_used_at' => 'datetime',
    ];
}
