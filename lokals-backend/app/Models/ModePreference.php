<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModePreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_mode',
        'pinned_modes',
    ];

    protected function casts(): array
    {
        return [
            'pinned_modes' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
