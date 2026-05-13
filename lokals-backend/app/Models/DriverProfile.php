<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role_application_id',
        'license_number',
        'vehicle_registration',
        'vehicle_type',
        'vehicle_make',
        'vehicle_model',
        'is_online',
        'is_verified',
        'rating',
        'completed_trips',
        'lifetime_earnings',
    ];

    protected function casts(): array
    {
        return [
            'is_online' => 'boolean',
            'is_verified' => 'boolean',
            'rating' => 'decimal:2',
            'lifetime_earnings' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function roleApplication(): BelongsTo
    {
        return $this->belongsTo(RoleApplication::class);
    }
}
