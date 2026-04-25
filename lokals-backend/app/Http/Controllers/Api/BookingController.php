<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Service;
use App\Notifications\SystemNotification;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookingService)
    {
    }

    public function store(StoreBookingRequest $request): BookingResource
    {
        $service = Service::findOrFail($request->integer('service_id'));
        $booking = $this->bookingService->createBooking(
            $request->user(),
            $service,
            $request->string('booking_date')->value(),
            $request->string('start_time')->value(),
            $request->string('notes')->value() ?: null,
        );

        return BookingResource::make($booking);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return BookingResource::collection(
            $request->user()->bookings()->with(['service', 'serviceProvider'])->latest()->paginate((int) $request->integer('per_page', 12))
        );
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): BookingResource
    {
        $this->authorize('updateStatus', $booking->load('serviceProvider'));
        $booking->update($request->validated());

        $booking->loadMissing(['user', 'serviceProvider.user', 'service']);
        $title = match ($booking->status) {
            'confirmed' => 'Booking confirmed',
            'cancelled' => 'Booking cancelled',
            'completed' => 'Booking completed',
            default => 'Booking updated',
        };

        $body = "Your booking for {$booking->service?->name} is now {$booking->status}.";
        $booking->user?->notify(new SystemNotification($title, $body, [
            'type' => 'booking_status',
            'booking_id' => $booking->id,
            'status' => $booking->status,
        ]));

        return BookingResource::make($booking->fresh()->load(['user', 'service', 'serviceProvider']));
    }
}
