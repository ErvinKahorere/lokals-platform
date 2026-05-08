<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'news_source_id',
        'title',
        'summary',
        'source_name',
        'source_url',
        'external_url',
        'image_url',
        'category',
        'town',
        'area',
        'region',
        'tags',
        'is_featured',
        'is_hidden',
        'published_at',
        'fetched_at',
        'source_type',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_featured' => 'boolean',
            'is_hidden' => 'boolean',
            'published_at' => 'datetime',
            'fetched_at' => 'datetime',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(NewsSource::class, 'news_source_id');
    }
}
