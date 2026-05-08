<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventReminder;
use App\Models\User;
use App\Notifications\SystemNotification;

class EventReminderService
{
    public function createReminder(User $user, Event $event, string $remindAt, string $channel = 'in_app'): EventReminder
    {
        $reminder = EventReminder::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'channel' => $channel,
            ],
            [
                'remind_at' => $remindAt,
                'sent_at' => null,
            ]
        );

        $user->notify(new SystemNotification(
            'Event reminder set',
            "We will remind you about {$event->title} before it starts.",
            [
                'type' => 'event_reminder',
                'target' => [
                    'type' => 'event',
                    'id' => $event->id,
                    'href' => '/events/'.$event->id,
                ],
            ],
        ));

        return $reminder;
    }

    public function markSent(EventReminder $reminder): void
    {
        $reminder->forceFill(['sent_at' => now()])->save();
    }
}
