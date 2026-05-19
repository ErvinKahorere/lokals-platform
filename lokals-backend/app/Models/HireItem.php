<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HireItem extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_PAUSED = 'paused';
    public const STATUS_UNAVAILABLE = 'unavailable';
    public const STATUS_ARCHIVED = 'archived';

    public const VERIFICATION_PENDING = 'pending';
    public const VERIFICATION_APPROVED = 'approved';
    public const VERIFICATION_REJECTED = 'rejected';

    protected $fillable = [
        'owner_id',
        'business_id',
        'title',
        'description',
        'category',
        'town',
        'area',
        'address',
        'latitude',
        'longitude',
        'price_per_hour',
        'price_per_day',
        'deposit_amount',
        'replacement_value',
        'delivery_available',
        'pickup_available',
        'condition',
        'status',
        'verification_status',
        'images',
        'rules',
        'included_items',
        'unavailable_dates',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'price_per_hour' => 'decimal:2',
            'price_per_day' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'replacement_value' => 'decimal:2',
            'delivery_available' => 'bool',
            'pickup_available' => 'bool',
            'images' => 'array',
            'rules' => 'array',
            'included_items' => 'array',
            'unavailable_dates' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'business_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(HireBooking::class);
    }
}
