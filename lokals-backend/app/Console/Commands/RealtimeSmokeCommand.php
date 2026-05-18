<?php

namespace App\Console\Commands;

use App\Events\DeliveryRequestUpdated;
use App\Events\EmergencyAlertPublished;
use App\Events\IssueStatusUpdated;
use App\Events\MessageReceived;
use App\Events\NotificationCreated;
use App\Events\RideRequestUpdated;
use App\Events\RoleApplicationSubmitted;
use App\Models\CityReport;
use App\Models\DeliveryRequest;
use App\Models\EmergencyBroadcast;
use App\Models\RoleApplication;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

class RealtimeSmokeCommand extends Command
{
    protected $signature = 'lokals:realtime-smoke {event=all : Specific event alias group or "all"}';

    protected $description = 'Broadcast a safe non-production realtime smoke event set for dashboard verification.';

    public function handle(): int
    {
        if (app()->environment('production')) {
            $this->error('Realtime smoke broadcasting is disabled in production.');

            return self::FAILURE;
        }

        $event = (string) $this->argument('event');
        $resident = User::query()
            ->whereIn('email', [
                'resident@lokals.app',
                'resident@lokals.test',
            ])
            ->first();

        if (! $resident instanceof User) {
            $this->error('Demo resident user not found.');

            return self::FAILURE;
        }

        $handlers = [
            'notification.created' => fn () => $this->broadcastNotification($resident),
            'message.received' => fn () => $this->broadcastMessage($resident),
            'issue.status.updated' => fn () => $this->broadcastIssueUpdate($resident),
            'ride.request.updated' => fn () => $this->broadcastRideUpdate($resident),
            'delivery.request.updated' => fn () => $this->broadcastDeliveryUpdate($resident),
            'role.application.submitted' => fn () => $this->broadcastRoleApplication($resident),
            'emergency.alert.published' => fn () => $this->broadcastEmergencyAlert($resident),
        ];

        if ($event !== 'all') {
            $handler = $handlers[$event] ?? null;
            if ($handler === null) {
                $this->error('Unknown event: '.$event);

                return self::FAILURE;
            }

            $handler();
            $this->info('Broadcast smoke event: '.$event);

            return self::SUCCESS;
        }

        foreach ($handlers as $name => $handler) {
            $handler();
            $this->line('Broadcast smoke event: '.$name);
        }

        $this->info('Realtime smoke event set broadcast successfully.');

        return self::SUCCESS;
    }

    private function broadcastNotification(User $resident): void
    {
        $notification = DatabaseNotification::query()->create([
            'id' => (string) Str::uuid(),
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $resident->id,
            'data' => [
                'type' => 'smoke_test',
                'title' => 'Realtime smoke notification',
                'body' => 'Dashboard notification smoke event fired.',
                'town' => $resident->default_town,
            ],
        ]);

        broadcast(new NotificationCreated($notification));
    }

    private function broadcastMessage(User $resident): void
    {
        broadcast(new MessageReceived(
            context: 'general',
            conversationId: 'smoke-test',
            messageId: 'smoke-'.Str::uuid(),
            recipientUserIds: [$resident->id],
            senderUserId: $resident->id,
            body: 'Dashboard message smoke event fired.',
            createdAt: now(),
        ));
    }

    private function broadcastIssueUpdate(User $resident): void
    {
        $report = CityReport::query()->where('user_id', $resident->id)->first()
            ?? CityReport::query()->create([
                'user_id' => $resident->id,
                'title' => 'Realtime smoke report',
                'description' => 'Temporary smoke report for realtime verification.',
                'category' => 'other',
                'status' => 'in_progress',
                'town' => $resident->default_town,
                'area' => $resident->default_area,
            ]);

        broadcast(new IssueStatusUpdated($report->fresh(), $resident->default_town));
    }

    private function broadcastRideUpdate(User $resident): void
    {
        $ride = RideRequest::query()->where('user_id', $resident->id)->latest()->first()
            ?? RideRequest::query()->create([
                'user_id' => $resident->id,
                'pickup_location' => 'Nau-Aib',
                'dropoff_location' => 'Town Centre',
                'ride_type' => 'Standard',
                'status' => 'searching',
                'fare_estimate' => 55,
            ]);

        broadcast(new RideRequestUpdated($ride->fresh(), [], $resident->default_town));
    }

    private function broadcastDeliveryUpdate(User $resident): void
    {
        $delivery = DeliveryRequest::query()->where('user_id', $resident->id)->latest()->first()
            ?? DeliveryRequest::query()->create([
                'user_id' => $resident->id,
                'pickup_address' => 'Nau-Aib',
                'pickup_location' => 'Nau-Aib',
                'dropoff_address' => 'Town Centre',
                'dropoff_location' => 'Town Centre',
                'item_description' => 'Smoke test parcel',
                'parcel_description' => 'Smoke test parcel',
                'status' => 'requested',
                'estimated_price' => 72,
            ]);

        broadcast(new DeliveryRequestUpdated($delivery->fresh(), [], $resident->default_town));
    }

    private function broadcastRoleApplication(User $resident): void
    {
        $application = RoleApplication::query()->create([
            'user_id' => $resident->id,
            'requested_role' => 'driver',
            'status' => 'pending_review',
            'full_name' => $resident->name,
            'phone' => $resident->phone ?? '+264000000000',
            'email' => $resident->email,
            'town_name' => $resident->default_town,
        ]);

        broadcast(new RoleApplicationSubmitted($application, $resident->default_town));
    }

    private function broadcastEmergencyAlert(User $resident): void
    {
        $alert = EmergencyBroadcast::query()->create([
            'title' => 'Realtime smoke emergency',
            'body' => 'Dashboard emergency smoke event fired.',
            'emergency_type' => 'public_safety',
            'priority' => 'critical',
            'town' => $resident->default_town,
            'area' => $resident->default_area,
            'status' => 'published',
            'created_by' => $resident->id,
            'starts_at' => now(),
        ]);

        broadcast(new EmergencyAlertPublished($alert, [$resident->id]));
    }
}
