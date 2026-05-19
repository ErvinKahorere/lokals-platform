<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HireBooking extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_HANDED_OVER = 'handed_over';
    public const STATUS_IN_USE = 'in_use';
    public const STATUS_RETURN_DUE = 'return_due';
    public const STATUS_RETURNED = 'returned';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_DISPUTED = 'disputed';

    public const ACTIVE_AVAILABILITY_STATUSES = [
        self::STATUS_ACCEPTED,
        self::STATUS_CONFIRMED,
        self::STATUS_HANDED_OVER,
        self::STATUS_IN_USE,
        self::STATUS_RETURN_DUE,
    ];

    protected $fillable = [
        'hire_item_id',
        'customer_id',
        'owner_id',
        'courier_id',
        'status',
        'start_at',
        'end_at',
        'quantity',
        'rental_fee',
        'deposit_amount',
        'delivery_fee',
        'total',
        'payment_status',
        'pickup_method',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'notes',
        'owner_notes',
        'accepted_at',
        'handed_over_at',
        'returned_at',
        'completed_at',
        'cancelled_at',
        'customer_rating',
        'customer_rating_comment',
        'rated_at',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'rental_fee' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'total' => 'decimal:2',
            'delivery_latitude' => 'float',
            'delivery_longitude' => 'float',
            'accepted_at' => 'datetime',
            'handed_over_at' => 'datetime',
            'returned_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'rated_at' => 'datetime',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(HireItem::class, 'hire_item_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }
}
