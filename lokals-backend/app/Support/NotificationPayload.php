<?php

namespace App\Support;

class NotificationPayload
{
    public static function enrich(array $payload): array
    {
        $target = is_array($payload['target'] ?? null) ? $payload['target'] : [];
        $type = (string) ($payload['type'] ?? 'system');

        $targetType = $target['type'] ?? self::defaultTargetType($type);
        $targetId = $target['id'] ?? ($payload['target_id'] ?? null);
        $href = $target['href'] ?? self::defaultHref($type, $targetId);

        return [
            ...$payload,
            'target_type' => $payload['target_type'] ?? $targetType,
            'target_id' => $targetId,
            'target' => [
                ...$target,
                'type' => $targetType,
                'id' => $targetId,
                'href' => $href,
            ],
        ];
    }

    private static function defaultTargetType(string $type): string
    {
        return match ($type) {
            'municipal_alert' => 'alert',
            'report_update', 'report_created' => 'report',
            'booking_update', 'booking_status' => 'booking',
            'job_update', 'job_application' => 'job',
            'event_reminder', 'event_update' => 'event',
            'ticket_update', 'event_ticket', 'event_attendee' => 'event_ticket',
            'delivery_update' => 'delivery',
            'ride_update' => 'ride',
            'news_update' => 'news',
            default => 'system',
        };
    }

    private static function defaultHref(string $type, mixed $targetId): string
    {
        return match ($type) {
            'municipal_alert' => '/alerts',
            'report_update', 'report_created' => $targetId ? '/dashboard/reports/'.$targetId : '/dashboard/reports',
            'booking_update', 'booking_status' => '/dashboard/bookings',
            'job_update', 'job_application' => $targetId ? '/jobs/'.$targetId : '/dashboard/jobs',
            'event_reminder', 'event_update' => $targetId ? '/events/'.$targetId : '/events',
            'ticket_update', 'event_ticket' => $targetId ? '/tickets/'.$targetId : '/my-tickets',
            'event_attendee' => $targetId ? '/events/'.$targetId.'/tickets' : '/dashboard/tickets',
            'delivery_update' => $targetId ? '/delivery/'.$targetId : '/delivery',
            'ride_update' => $targetId ? '/ride/'.$targetId : '/ride',
            'news_update' => $targetId ? '/news/'.$targetId : '/news',
            default => '/notifications',
        };
    }
}
