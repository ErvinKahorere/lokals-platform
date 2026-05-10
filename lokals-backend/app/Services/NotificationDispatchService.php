<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\DeviceToken;
use App\Models\User;
use App\Notifications\BookingCreatedNotification;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class NotificationDispatchService
{
    public function sendBookingCreatedNotifications(Booking $booking): void
    {
        $booking->loadMissing(['user', 'serviceProvider.user', 'service']);

        $user = $booking->user;
        $providerUser = $booking->serviceProvider->user;

        if ($user instanceof User) {
            $this->notify($user, new BookingCreatedNotification($booking, 'user'));
        }

        if ($providerUser instanceof User) {
            $this->notify($providerUser, new BookingCreatedNotification($booking, 'provider'));
        }
    }

    public function notify(User $user, Notification $notification): void
    {
        $user->notify($notification);
        $this->dispatchPushIfConfigured($user, $notification);
    }

    private function dispatchPushIfConfigured(User $user, Notification $notification): void
    {
        $serverKey = config('services.firebase.server_key');
        if (! $serverKey) {
            return;
        }

        $tokens = DeviceToken::query()
            ->where('user_id', $user->id)
            ->pluck('token')
            ->filter()
            ->values();

        if ($tokens->isEmpty()) {
            return;
        }

        Log::info('Firebase push dispatch placeholder reached.', [
            'user_id' => $user->id,
            'tokens' => $tokens->count(),
            'notification' => get_class($notification),
        ]);
    }
}
