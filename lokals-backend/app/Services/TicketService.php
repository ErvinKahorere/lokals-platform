<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\EventTicketType;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TicketService
{
    public function reserveTicket(User $user, Event $event, ?EventTicketType $ticketType, array $payload): EventTicket
    {
        if ($event->status !== 'published') {
            throw ValidationException::withMessages([
                'event' => ['Tickets are only available for published events.'],
            ]);
        }

        if (! $event->ticketing_enabled && ! $event->is_free) {
            throw ValidationException::withMessages([
                'event' => ['Ticketing is not enabled for this event yet.'],
            ]);
        }

        if ($ticketType && (! $ticketType->is_active || $ticketType->event_id !== $event->id)) {
            throw ValidationException::withMessages([
                'ticket_type_id' => ['This ticket type is not active.'],
            ]);
        }

        if ($ticketType) {
            $this->assertTicketWindowOpen($ticketType);
            $this->assertNotOversold($ticketType, $event);
        } elseif (! $event->is_free) {
            throw ValidationException::withMessages([
                'ticket_type_id' => ['Choose a ticket type to continue.'],
            ]);
        }

        if ($event->capacity !== null && $event->tickets()->whereIn('status', ['reserved', 'confirmed', 'used'])->count() >= $event->capacity) {
            throw ValidationException::withMessages([
                'event' => ['This event has reached capacity.'],
            ]);
        }

        $status = ($ticketType?->price ?? 0) > 0 || ! $event->is_free ? 'reserved' : 'confirmed';
        $pricePaid = $status === 'confirmed' ? ($ticketType?->price ?? 0) : null;

        $ticket = EventTicket::query()->create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType?->id,
            'user_id' => $user->id,
            'ticket_code' => strtoupper(Str::random(10)),
            'status' => $status,
            'price_paid' => $pricePaid,
            'holder_name' => $payload['holder_name'] ?? $user->name,
            'holder_phone' => $payload['holder_phone'] ?? $user->phone,
            'qr_code_payload' => 'lokals-ticket:'.$event->id.':'.Str::uuid(),
            'reserved_at' => now(),
            'confirmed_at' => $status === 'confirmed' ? now() : null,
        ]);

        if ($ticketType) {
            $ticketType->increment('quantity_sold');
        }

        $user->notify(new SystemNotification(
            $status === 'confirmed' ? 'Ticket confirmed' : 'Ticket reserved',
            $status === 'confirmed'
                ? "Your place for {$event->title} is confirmed."
                : "Your ticket request for {$event->title} is reserved pending payment or organizer follow-up.",
            [
                'type' => 'event_ticket',
                'target' => [
                    'type' => 'event_ticket',
                    'id' => $ticket->id,
                    'href' => '/tickets/'.$ticket->id,
                ],
            ],
        ));

        $event->creator?->notify(new SystemNotification(
            'New event attendee',
            "{$user->name} reserved a ticket for {$event->title}.",
            [
                'type' => 'event_attendee',
                'target' => [
                    'type' => 'event',
                    'id' => $event->id,
                    'href' => '/events/'.$event->id.'/tickets',
                ],
            ],
        ));

        return $ticket->load(['event', 'ticketType', 'user']);
    }

    public function cancelTicket(EventTicket $ticket): EventTicket
    {
        if (in_array($ticket->status, ['used', 'cancelled', 'expired'], true)) {
            throw ValidationException::withMessages([
                'ticket' => ['This ticket can no longer be cancelled.'],
            ]);
        }

        $ticket->forceFill(['status' => 'cancelled'])->save();

        if ($ticket->ticketType && $ticket->ticketType->quantity_sold > 0) {
            $ticket->ticketType->decrement('quantity_sold');
        }

        return $ticket->fresh(['event', 'ticketType', 'user']);
    }

    public function checkInTicket(EventTicket $ticket): EventTicket
    {
        if (in_array($ticket->status, ['cancelled', 'expired'], true)) {
            throw ValidationException::withMessages([
                'ticket' => ['Cancelled or expired tickets cannot be checked in.'],
            ]);
        }

        $ticket->forceFill([
            'status' => 'used',
            'used_at' => now(),
            'confirmed_at' => $ticket->confirmed_at ?? now(),
        ])->save();

        return $ticket->fresh(['event', 'ticketType', 'user']);
    }

    private function assertTicketWindowOpen(EventTicketType $ticketType): void
    {
        if ($ticketType->sales_start_at && now()->lt($ticketType->sales_start_at)) {
            throw ValidationException::withMessages([
                'ticket_type_id' => ['Ticket sales have not opened yet.'],
            ]);
        }

        if ($ticketType->sales_end_at && now()->gt($ticketType->sales_end_at)) {
            throw ValidationException::withMessages([
                'ticket_type_id' => ['Ticket sales have ended for this option.'],
            ]);
        }
    }

    private function assertNotOversold(EventTicketType $ticketType, Event $event): void
    {
        if ($ticketType->quantity_available !== null && $ticketType->quantity_sold >= $ticketType->quantity_available) {
            throw ValidationException::withMessages([
                'ticket_type_id' => ['This ticket type is sold out.'],
            ]);
        }

        if ($event->capacity !== null) {
            $activeTickets = $event->tickets()->whereIn('status', ['reserved', 'confirmed', 'used'])->count();
            if ($activeTickets >= $event->capacity) {
                throw ValidationException::withMessages([
                    'event' => ['This event is sold out.'],
                ]);
            }
        }
    }
}
