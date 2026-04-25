<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostDraft extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'image_url',
        'suggested_title',
        'suggested_category',
        'suggested_description',
        'suggested_price',
        'location',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'suggested_price' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
