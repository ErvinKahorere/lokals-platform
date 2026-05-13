<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportKnowledgeBaseArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'summary',
        'body',
        'route_hint',
        'is_published',
        'town',
        'tags',
        'priority',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'tags' => 'array',
            'priority' => 'integer',
        ];
    }
}
