<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizer_type',
        'organizer_id',
        'created_by',
        'title',
        'description',
        'category',
        'venue_name',
        'location',
        'town',
        'area',
        'lat',
        'lng',
        'starts_at',
        'ends_at',
        'image_url',
        'status',
        'is_free',
        'ticketing_enabled',
        'capacity',
        'metadata',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'lat' => 'float',
            'lng' => 'float',
            'is_free' => 'boolean',
            'ticketing_enabled' => 'boolean',
            'capacity' => 'integer',
            'metadata' => 'array',
            'is_featured' => 'bool',
        ];
    }

    public function organizer(): MorphTo
    {
        return $this->morphTo();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function ticketTypes(): HasMany
    {
        return $this->hasMany(EventTicketType::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(EventTicket::class);
    }

    public function saves(): HasMany
    {
        return $this->hasMany(EventSave::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(EventReminder::class);
    }
}
