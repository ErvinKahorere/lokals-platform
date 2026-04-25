<?php

namespace App\Listeners;

use App\Events\BookingCreated;
use App\Services\NotificationDispatchService;

class SendBookingNotifications
{
    public function __construct(private readonly NotificationDispatchService $notificationDispatchService)
    {
    }

    public function handle(BookingCreated $event): void
    {
        $this->notificationDispatchService->sendBookingCreatedNotifications($event->booking);
    }
}
