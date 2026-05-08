<?php

namespace App\Services;

use App\Models\Event;
use Illuminate\Support\Str;

class CalendarService
{
    public function generateIcs(Event $event): string
    {
        $start = $event->starts_at?->utc()->format('Ymd\THis\Z');
        $end = ($event->ends_at ?? $event->starts_at?->copy()->addHours(2))?->utc()->format('Ymd\THis\Z');
        $summary = $this->escape($event->title);
        $description = $this->escape(trim(($event->summary ?? '').' '.$event->description));
        $location = $this->escape(trim(implode(', ', array_filter([$event->venue_name, $event->location, $event->area, $event->town]))));
        $url = url('/api/v1/events/'.$event->id);

        return implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//LOKALS//Events//EN',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            'UID:event-'.$event->id.'@lokals',
            'DTSTAMP:'.now()->utc()->format('Ymd\THis\Z'),
            'DTSTART:'.$start,
            'DTEND:'.$end,
            'SUMMARY:'.$summary,
            'DESCRIPTION:'.$description,
            'LOCATION:'.$location,
            'URL:'.$url,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR',
            '',
        ]);
    }

    public function calendarMeta(Event $event): array
    {
        return [
            'ics_url' => url('/api/v1/events/'.$event->id.'/calendar.ics'),
            'title' => $event->title,
            'starts_at' => optional($event->starts_at)->toIso8601String(),
            'ends_at' => optional($event->ends_at)->toIso8601String(),
            'location' => implode(', ', array_filter([$event->venue_name, $event->location, $event->area, $event->town])),
        ];
    }

    private function escape(?string $value): string
    {
        return Str::of((string) $value)
            ->replace('\\', '\\\\')
            ->replace(',', '\,')
            ->replace(';', '\;')
            ->replace("\n", '\n')
            ->value();
    }
}
