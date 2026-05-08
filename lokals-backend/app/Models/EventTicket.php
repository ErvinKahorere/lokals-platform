<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'ticket_type_id',
        'user_id',
        'ticket_code',
        'status',
        'price_paid',
        'holder_name',
        'holder_phone',
        'qr_code_payload',
        'reserved_at',
        'confirmed_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'price_paid' => 'decimal:2',
            'reserved_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(EventTicketType::class, 'ticket_type_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
