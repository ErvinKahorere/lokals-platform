<?php

namespace App\Services;

use App\Events\BookingCreated;
use App\Models\Booking;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function createBooking(User $user, Service $service, string $date, string $time, ?string $notes = null): Booking
    {
        $provider = $service->serviceProvider()->with('availabilitySlots')->firstOrFail();
        $start = Carbon::createFromFormat('H:i', $time);
        $end = (clone $start)->addMinutes($service->duration_minutes);

        if (! $service->is_active) {
            throw ValidationException::withMessages([
                'service_id' => ['This service is not currently bookable.'],
            ]);
        }

        if (! $service->is_bookable) {
            throw ValidationException::withMessages([
                'service_id' => ['This service requires direct contact instead of instant booking.'],
            ]);
        }

        if ($provider->status !== 'active') {
            throw ValidationException::withMessages([
                'service_provider_id' => ['This provider is not currently accepting bookings.'],
            ]);
        }

        if (Carbon::parse($date.' '.$time)->isPast()) {
            throw ValidationException::withMessages([
                'booking_date' => ['Bookings cannot be created in the past.'],
            ]);
        }

        if (! $this->checkAvailability($provider, $date, $time, $end->format('H:i'))) {
            throw ValidationException::withMessages([
                'start_time' => ['This provider is not available at the selected time.'],
            ]);
        }

        $slotTaken = Booking::query()
            ->where('service_provider_id', $provider->id)
            ->whereDate('booking_date', $date)
            ->where('start_time', $start->format('H:i:s'))
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($slotTaken) {
            throw ValidationException::withMessages([
                'start_time' => ['This time slot has already been taken. Please choose another one.'],
            ]);
        }

        $booking = Booking::create([
            'user_id' => $user->id,
            'service_provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => $start->format('H:i:s'),
            'end_time' => $end->format('H:i:s'),
            'status' => 'pending',
            'notes' => $notes,
        ]);

        event(new BookingCreated($booking));

        return $booking->load(['user', 'serviceProvider.user', 'service']);
    }

    public function checkAvailability(ServiceProvider $provider, string $date, string $startTime, ?string $endTime = null): bool
    {
        $dateInstance = Carbon::parse($date);
        $normalizedStart = strlen($startTime) === 5 ? $startTime.':00' : $startTime;
        $endTime ??= Carbon::createFromFormat('H:i', substr($startTime, 0, 5))->addHour()->format('H:i');
        $normalizedEnd = strlen($endTime) === 5 ? $endTime.':00' : $endTime;

        $daySlotExists = $provider->availabilitySlots()
            ->where('day_of_week', $dateInstance->dayOfWeek)
            ->where('is_available', true)
            ->where('start_time', '<=', $normalizedStart)
            ->where('end_time', '>=', $normalizedEnd)
            ->exists();

        if (! $daySlotExists) {
            return false;
        }

        $conflictingBookings = Booking::query()
            ->where('service_provider_id', $provider->id)
            ->whereDate('booking_date', $date)
            ->whereNotIn('status', ['cancelled'])
            ->get();

        $requestedStart = Carbon::createFromFormat('H:i:s', $normalizedStart);
        $requestedEnd = Carbon::createFromFormat('H:i:s', $normalizedEnd);

        return ! $conflictingBookings->contains(function (Booking $booking) use ($requestedStart, $requestedEnd): bool {
            $existingStart = Carbon::createFromFormat('H:i:s', $booking->start_time);
            $existingEnd = Carbon::createFromFormat('H:i:s', $booking->end_time);

            return $existingStart < $requestedEnd && $existingEnd > $requestedStart;
        });
    }
}
