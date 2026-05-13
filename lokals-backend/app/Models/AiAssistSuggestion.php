<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiAssistSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_assist_request_id',
        'suggestion_type',
        'content',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_primary' => 'boolean',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(AiAssistRequest::class, 'ai_assist_request_id');
    }
}
