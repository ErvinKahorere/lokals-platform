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
        'dropoff_address',
        'dropoff_location',
        'item_description',
        'parcel_description',
        'parcel_size',
        'status',
        'price',
        'estimated_price',
        'driver_id',
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'estimated_price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
