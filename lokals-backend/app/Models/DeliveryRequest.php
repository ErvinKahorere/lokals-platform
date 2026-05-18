<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pickup_address',
        'pickup_location',
        'pickup_latitude',
        'pickup_longitude',
        'dropoff_address',
        'dropoff_location',
        'dropoff_latitude',
        'dropoff_longitude',
        'item_description',
        'parcel_description',
        'notes',
        'parcel_size',
        'weight_kg',
        'urgency',
        'status',
        'price',
        'estimated_price',
        'driver_id',
        'photo_url',
        'assigned_at',
        'picked_up_at',
        'in_transit_at',
        'delivered_at',
        'cancelled_at',
        'cancel_reason',
        'rating',
        'rating_comment',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'estimated_price' => 'decimal:2',
            'weight_kg' => 'decimal:2',
            'pickup_latitude' => 'decimal:7',
            'pickup_longitude' => 'decimal:7',
            'dropoff_latitude' => 'decimal:7',
            'dropoff_longitude' => 'decimal:7',
            'assigned_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'in_transit_at' => 'datetime',
            'delivered_at' => 'datetime',
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

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
