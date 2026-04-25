<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization_id',
        'type',
        'title',
        'description',
        'price',
        'currency',
        'phone',
        'location',
        'lat',
        'lng',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'lat' => 'float',
            'lng' => 'float',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function moderationFlags(): MorphMany
    {
        return $this->morphMany(ModerationFlag::class, 'flaggable');
    }
}
