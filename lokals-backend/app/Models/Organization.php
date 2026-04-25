<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_user_id',
        'name',
        'category',
        'subcategory',
        'description',
        'phone',
        'email',
        'logo_url',
        'whatsapp',
        'location',
        'town',
        'area',
        'lat',
        'lng',
        'is_verified',
        'status',
        'emergency_contact',
        'is_public_service',
        'opening_hours',
        'rates',
        'services_offered',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'is_verified' => 'bool',
            'emergency_contact' => 'bool',
            'is_public_service' => 'bool',
            'opening_hours' => 'array',
            'rates' => 'array',
            'services_offered' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function serviceProviders(): HasMany
    {
        return $this->hasMany(ServiceProvider::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function followers(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    public function moderationFlags(): MorphMany
    {
        return $this->morphMany(ModerationFlag::class, 'flaggable');
    }
}
