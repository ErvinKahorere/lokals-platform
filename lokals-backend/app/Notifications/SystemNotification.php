<?php

namespace App\Notifications;

use App\Support\NotificationPayload;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    public function __construct(
        private readonly string $title,
        private readonly string $body,
        private readonly array $meta = [],
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return NotificationPayload::enrich([
            'title' => $this->title,
            'body' => $this->body,
            ...$this->meta,
        ]);
    }
}
