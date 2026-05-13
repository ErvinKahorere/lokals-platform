<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiAssistRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'module',
        'provider_key',
        'status',
        'original_media_url',
        'original_filename',
        'payload',
        'safety_status',
        'confidence_score',
        'needs_user_review',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'needs_user_review' => 'boolean',
            'confidence_score' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function suggestions(): HasMany
    {
        return $this->hasMany(AiAssistSuggestion::class);
    }
}
