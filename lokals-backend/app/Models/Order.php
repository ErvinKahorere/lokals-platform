<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_PREPARING = 'preparing';
    public const STATUS_READY_FOR_PICKUP = 'ready_for_pickup';
    public const STATUS_COURIER_ASSIGNED = 'courier_assigned';
    public const STATUS_PICKED_UP = 'picked_up';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'business_id',
        'courier_id',
        'town',
        'area',
        'status',
        'subtotal',
        'delivery_fee',
        'service_fee',
        'total',
        'payment_method',
        'payment_status',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
        'notes',
        'accepted_at',
        'preparing_at',
        'ready_at',
        'picked_up_at',
        'delivered_at',
        'cancelled_at',
        'customer_rating',
        'customer_rating_comment',
        'rated_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'total' => 'decimal:2',
            'delivery_latitude' => 'decimal:7',
            'delivery_longitude' => 'decimal:7',
            'pickup_latitude' => 'decimal:7',
            'pickup_longitude' => 'decimal:7',
            'accepted_at' => 'datetime',
            'preparing_at' => 'datetime',
            'ready_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'rated_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'business_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
