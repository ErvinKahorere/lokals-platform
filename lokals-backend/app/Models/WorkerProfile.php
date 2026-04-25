<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'headline',
        'skills',
        'experience_years',
        'hourly_rate',
        'is_available',
        'location',
        'lat',
        'lng',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'hourly_rate' => 'decimal:2',
            'is_available' => 'bool',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
