<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Accommodation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_id',
        'type',
        'title',
        'description',
        'price',
        'price_period',
        'bedrooms',
        'bathrooms',
        'location',
        'town',
        'area',
        'lat',
        'lng',
        'image_path',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'lat' => 'float',
            'lng' => 'float',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'business_id');
    }
}
