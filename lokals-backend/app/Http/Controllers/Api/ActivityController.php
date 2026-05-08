<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\DeliveryRequest;
use App\Models\EventSave;
use App\Models\EventTicket;
use App\Models\JobApplication;
use App\Models\RideRequest;
use App\Models\SavedItem;
use App\Models\SosAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = $this->merge([
            Booking::query()
                ->where('user_id', $user->id)
                ->with(['service:id,name'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Booking $booking) => [
                    'type' => 'booking',
                    'title' => $booking->service?->name ?? 'Booking update',
                    'body' => 'Booking '.$booking->status,
                    'status' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                    'route' => '/my-bookings',
                ]),
            EventTicket::query()
                ->where('user_id', $user->id)
                ->with('event:id,title')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (EventTicket $ticket) => [
                    'type' => 'ticket',
                    'title' => $ticket->event?->title ?? 'Ticket update',
                    'body' => 'Ticket '.$ticket->status.' | '.$ticket->ticket_code,
                    'status' => $ticket->status,
                    'timestamp' => optional($ticket->updated_at)->toIso8601String(),
                    'route' => '/my-tickets',
                ]),
            DeliveryRequest::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (DeliveryRequest $delivery) => [
                    'type' => 'delivery',
                    'title' => 'Parcel request',
                    'body' => ($delivery->pickup_location ?? $delivery->pickup_address ?? 'Pickup').' to '.($delivery->dropoff_location ?? $delivery->dropoff_address ?? 'Drop-off'),
                    'status' => $delivery->status,
                    'timestamp' => optional($delivery->updated_at)->toIso8601String(),
                    'route' => '/delivery/'.$delivery->id,
                ]),
            RideRequest::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (RideRequest $ride) => [
                    'type' => 'ride',
                    'title' => 'Ride request',
                    'body' => $ride->pickup_location.' to '.$ride->dropoff_location,
                    'status' => $ride->status,
                    'timestamp' => optional($ride->updated_at)->toIso8601String(),
                    'route' => '/ride/'.$ride->id,
                ]),
            SosAlert::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(3)
                ->get()
                ->map(fn (SosAlert $sos) => [
                    'type' => 'sos',
                    'title' => $sos->emergency_type ?: 'SOS alert',
                    'body' => $sos->message,
                    'status' => $sos->status,
                    'timestamp' => optional($sos->updated_at)->toIso8601String(),
                    'route' => '/sos',
                ]),
            JobApplication::query()
                ->where('user_id', $user->id)
                ->with('jobPost:id,title')
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (JobApplication $application) => [
                    'type' => 'job_application',
                    'title' => $application->jobPost?->title ?? 'Job application',
                    'body' => 'Application '.$application->status,
                    'status' => $application->status,
                    'timestamp' => optional($application->updated_at)->toIso8601String(),
                    'route' => $application->job_post_id ? '/jobs/'.$application->job_post_id : '/jobs',
                ]),
            CityReport::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (CityReport $report) => [
                    'type' => 'report',
                    'title' => $report->title,
                    'body' => 'Report '.$report->status,
                    'status' => $report->status,
                    'timestamp' => optional($report->updated_at)->toIso8601String(),
                    'route' => '/dashboard/reports/'.$report->id,
                ]),
            Alert::query()
                ->latest()
                ->limit(3)
                ->get()
                ->map(fn (Alert $alert) => [
                    'type' => 'alert',
                    'title' => $alert->title,
                    'body' => Str::limit($alert->body, 96),
                    'status' => $alert->priority,
                    'timestamp' => optional($alert->published_at ?? $alert->updated_at)->toIso8601String(),
                    'route' => '/alerts',
                ]),
            DatabaseNotification::query()
                ->where('notifiable_type', $user::class)
                ->where('notifiable_id', $user->id)
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (DatabaseNotification $notification) => [
                    'type' => 'notification',
                    'title' => $notification->data['title'] ?? 'Notification',
                    'body' => $notification->data['body'] ?? $notification->data['message'] ?? 'You have a new update.',
                    'status' => $notification->read_at ? 'read' : 'unread',
                    'timestamp' => optional($notification->created_at)->toIso8601String(),
                    'route' => $notification->data['target']['href'] ?? '/notifications',
                ]),
            SavedItem::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (SavedItem $savedItem) => [
                    'type' => 'saved_item',
                    'title' => 'Saved item',
                    'body' => 'Saved '.class_basename($savedItem->saveable_type),
                    'status' => 'saved',
                    'timestamp' => optional($savedItem->created_at)->toIso8601String(),
                    'route' => '/saved-items',
                ]),
            EventSave::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(2)
                ->get()
                ->map(fn (EventSave $save) => [
                    'type' => 'saved_item',
                    'title' => 'Saved event',
                    'body' => 'Event saved for later',
                    'status' => 'saved',
                    'timestamp' => optional($save->created_at)->toIso8601String(),
                    'route' => '/saved-items',
                ]),
        ]);

        return response()->json([
            'summary' => [
                'bookings' => Booking::query()->where('user_id', $user->id)->count(),
                'tickets' => EventTicket::query()->where('user_id', $user->id)->count(),
                'deliveries' => DeliveryRequest::query()->where('user_id', $user->id)->count(),
                'rides' => RideRequest::query()->where('user_id', $user->id)->count(),
                'reports' => CityReport::query()->where('user_id', $user->id)->count(),
                'saved_items' => SavedItem::query()->where('user_id', $user->id)->count()
                    + EventSave::query()->where('user_id', $user->id)->count(),
            ],
            'data' => $items,
        ]);
    }

    private function merge(array $groups): array
    {
        return collect($groups)
            ->flatten(1)
            ->filter()
            ->sortByDesc('timestamp')
            ->values()
            ->take(30)
            ->all();
    }
}
