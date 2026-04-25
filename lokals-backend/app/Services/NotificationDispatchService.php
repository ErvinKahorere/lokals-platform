<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\User;
use App\Notifications\BookingCreatedNotification;

class NotificationDispatchService
{
    public function sendBookingCreatedNotifications(Booking $booking): void
    {
        $booking->loadMissing(['user', 'serviceProvider.user', 'service']);

        $user = $booking->user;
        $providerUser = $booking->serviceProvider->user;

        if ($user instanceof User) {
            $user->notify(new BookingCreatedNotification($booking, 'user'));
        }

        if ($providerUser instanceof User) {
            $providerUser->notify(new BookingCreatedNotification($booking, 'provider'));
        }
    }
}
