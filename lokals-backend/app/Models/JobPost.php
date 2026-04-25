<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class JobPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization_id',
        'title',
        'description',
        'employment_type',
        'compensation',
        'location',
        'status',
        'skills',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'compensation' => 'decimal:2',
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

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function moderationFlags(): MorphMany
    {
        return $this->morphMany(ModerationFlag::class, 'flaggable');
    }
}
