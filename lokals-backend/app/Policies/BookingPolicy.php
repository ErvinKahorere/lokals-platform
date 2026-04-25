<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id
            || $user->id === $booking->serviceProvider?->user_id
            || $user->hasAnyRole(['operator', 'municipality_admin', 'super_admin']);
    }

    public function updateStatus(User $user, Booking $booking): bool
    {
        return $user->id === $booking->serviceProvider?->user_id
            || $user->hasAnyRole(['operator', 'super_admin']);
    }
}
