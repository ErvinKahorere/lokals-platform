<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Booking $booking, private readonly string $recipientType)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $serviceName = $this->booking->service?->name ?? 'Service';

        return [
            'title' => $this->recipientType === 'provider' ? 'New booking request' : 'Booking received',
            'body' => $this->recipientType === 'provider'
                ? "A customer requested {$serviceName} on {$this->booking->booking_date}."
                : "Your {$serviceName} booking was submitted and is waiting for confirmation.",
            'booking_id' => $this->booking->id,
            'status' => $this->booking->status,
            'channel_todo' => 'TODO: SMS/WhatsApp delivery hooks',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())->line('Booking update available in the LOKALS app.');
    }
}
