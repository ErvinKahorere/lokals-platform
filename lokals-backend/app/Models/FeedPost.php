<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'summary',
        'body',
        'source_type',
        'source_id',
        'feed_source_id',
        'category_id',
        'media_url',
        'external_url',
        'town',
        'area',
        'status',
        'is_featured',
        'priority',
        'published_at',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'priority' => 'integer',
            'metadata' => 'array',
            'published_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(FeedSource::class, 'feed_source_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(FeedCategory::class, 'category_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(FeedInteraction::class);
    }

    public function moderationLogs(): HasMany
    {
        return $this->hasMany(FeedModerationLog::class);
    }
}
