<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RideRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'driver_id',
        'pickup_location',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
        'dropoff_location',
        'dropoff_address',
        'dropoff_latitude',
        'dropoff_longitude',
        'ride_type',
        'trip_purpose',
        'notes',
        'status',
        'fare_estimate',
        'estimated_distance_km',
        'assigned_at',
        'arrived_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'cancel_reason',
        'rating',
        'rating_comment',
        'vehicle_label',
    ];

    protected function casts(): array
    {
        return [
            'fare_estimate' => 'decimal:2',
            'estimated_distance_km' => 'decimal:2',
            'pickup_latitude' => 'decimal:7',
            'pickup_longitude' => 'decimal:7',
            'dropoff_latitude' => 'decimal:7',
            'dropoff_longitude' => 'decimal:7',
            'assigned_at' => 'datetime',
            'arrived_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
