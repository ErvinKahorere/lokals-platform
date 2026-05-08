<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Organization;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class EventService
{
    public function createEvent(User $user, array $payload): Event
    {
        $organizer = $this->resolveOrganizer($user, $payload['organizer_type'] ?? null, $payload['organizer_id'] ?? null);
        $this->validateDates($payload);

        return Event::query()->create([
            ...$payload,
            'organizer_type' => $organizer?->getMorphClass(),
            'organizer_id' => $organizer?->id,
            'created_by' => $user->id,
            'status' => $payload['status'] ?? 'draft',
        ]);
    }

    public function updateEvent(Event $event, array $payload): Event
    {
        $this->validateDates($payload, $event);
        $previousStatus = $event->status;

        $event->update($payload);
        $event->load(['creator', 'ticketTypes']);

        if (in_array($event->status, ['cancelled', 'published'], true) || $previousStatus !== $event->status) {
            $this->notifyAudience($event, $event->status === 'cancelled'
                ? 'Event cancelled'
                : 'Event updated', $event->status === 'cancelled'
                ? "{$event->title} has been cancelled."
                : "{$event->title} has new event details.");
        }

        return $event->fresh(['organizer', 'ticketTypes']);
    }

    public function saveEvent(User $user, Event $event): void
    {
        $event->saves()->firstOrCreate(['user_id' => $user->id]);

        $user->notify(new SystemNotification(
            'Event saved',
            "{$event->title} was added to your saved events.",
            [
                'type' => 'event_save',
                'target' => [
                    'type' => 'event',
                    'id' => $event->id,
                    'href' => '/events/'.$event->id,
                ],
            ],
        ));
    }

    public function unsaveEvent(User $user, Event $event): void
    {
        $event->saves()->where('user_id', $user->id)->delete();
    }

    private function validateDates(array $payload, ?Event $event = null): void
    {
        $startsAt = isset($payload['starts_at']) ? now()->parse($payload['starts_at']) : $event?->starts_at;
        $endsAt = isset($payload['ends_at']) && $payload['ends_at'] ? now()->parse($payload['ends_at']) : $event?->ends_at;
        $status = $payload['status'] ?? $event?->status ?? 'draft';

        if (! $startsAt) {
            throw ValidationException::withMessages([
                'starts_at' => ['Start date and time are required.'],
            ]);
        }

        if ($status === 'published' && $startsAt->lt(now()->subHours(2))) {
            throw ValidationException::withMessages([
                'starts_at' => ['Published events cannot start in the impossible past.'],
            ]);
        }

        if ($endsAt && $endsAt->lte($startsAt)) {
            throw ValidationException::withMessages([
                'ends_at' => ['End time must be after the start time.'],
            ]);
        }

        if (isset($payload['capacity']) && $payload['capacity'] !== null && (int) $payload['capacity'] <= 0) {
            throw ValidationException::withMessages([
                'capacity' => ['Capacity must be a positive number.'],
            ]);
        }
    }

    private function resolveOrganizer(User $user, ?string $organizerType, ?int $organizerId): Organization|ServiceProvider|null
    {
        if (! $organizerType || ! $organizerId) {
            return null;
        }

        return match ($organizerType) {
            'organization' => Organization::query()
                ->whereKey($organizerId)
                ->where(fn ($query) => $query->where('owner_user_id', $user->id)->orWhereRaw('1 = ?', [$user->hasAnyRole(['municipality_admin', 'town_manager', 'super_admin', 'operator']) ? 1 : 0]))
                ->firstOrFail(),
            'service_provider' => ServiceProvider::query()
                ->whereKey($organizerId)
                ->where(fn ($query) => $query->where('user_id', $user->id)->orWhereRaw('1 = ?', [$user->hasAnyRole(['municipality_admin', 'town_manager', 'super_admin', 'operator']) ? 1 : 0]))
                ->firstOrFail(),
            default => null,
        };
    }

    private function notifyAudience(Event $event, string $title, string $body): void
    {
        $recipients = $event->tickets()
            ->with('user')
            ->get()
            ->pluck('user')
            ->merge($event->saves()->with('user')->get()->pluck('user'))
            ->filter()
            ->unique('id');

        /** @var Collection<int, User> $recipients */
        foreach ($recipients as $recipient) {
            $recipient->notify(new SystemNotification(
                $title,
                $body,
                [
                    'type' => 'event_update',
                    'target' => [
                        'type' => 'event',
                        'id' => $event->id,
                        'href' => '/events/'.$event->id,
                    ],
                ],
            ));
        }
    }
}
