<?php

namespace Tests\Feature;

use App\Events\EmergencyAlertPublished;
use App\Events\IssueStatusUpdated;
use App\Events\NotificationCreated;
use App\Events\RoleApplicationSubmitted;
use App\Models\CityReport;
use App\Models\EmergencyBroadcast;
use App\Models\RoleApplication;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Tests\TestCase;

class RealtimeBroadcastingContractsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_private_broadcast_channels_authorize_expected_users(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $manager = User::query()->where('email', 'manager@lokals.app')->firstOrFail();
        $admin = User::query()->where('email', 'admin@lokals.app')->firstOrFail();

        $this->actingAs($resident)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-users.'.$resident->id,
                'socket_id' => '1234.5678',
            ])
            ->assertOk();

        $this->actingAs($manager)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-towns.Okahandja.managers',
                'socket_id' => '1234.5678',
            ])
            ->assertOk();

        $this->actingAs($admin)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-platform.admins',
                'socket_id' => '1234.5678',
            ])
            ->assertOk();
    }

    public function test_realtime_events_expose_expected_aliases_channels_and_payload_shape(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $report = CityReport::query()->where('user_id', $resident->id)->firstOrFail();
        $roleApplication = RoleApplication::query()->create([
            'user_id' => $resident->id,
            'requested_role' => 'driver',
            'status' => 'pending_review',
            'full_name' => 'Resident Driver',
            'phone' => '+264810000111',
            'email' => 'resident@lokals.app',
            'town_name' => 'Okahandja',
        ]);
        $notification = DatabaseNotification::query()->create([
            'id' => (string) Str::uuid(),
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $resident->id,
            'data' => [
                'type' => 'report_update',
                'body' => 'Your report has been updated.',
                'town' => 'Okahandja',
            ],
        ]);
        $emergency = EmergencyBroadcast::query()->create([
            'title' => 'Water outage',
            'body' => 'Emergency maintenance is underway.',
            'emergency_type' => 'water_outage',
            'priority' => 'critical',
            'town' => 'Okahandja',
            'created_by' => $resident->id,
            'starts_at' => now(),
            'status' => 'published',
        ]);

        $notificationEvent = new NotificationCreated($notification);
        $issueEvent = new IssueStatusUpdated($report, 'Okahandja');
        $roleEvent = new RoleApplicationSubmitted($roleApplication, 'Okahandja');
        $emergencyEvent = new EmergencyAlertPublished($emergency, [$resident->id]);

        $this->assertSame('notification.created', $notificationEvent->broadcastAs());
        $this->assertSame('private-users.'.$resident->id, $notificationEvent->broadcastOn()[0]->name);
        $this->assertSame('notification.created', $notificationEvent->broadcastWith()['type']);

        $issueChannels = collect($issueEvent->broadcastOn())->pluck('name')->all();
        $this->assertContains('private-users.'.$resident->id, $issueChannels);
        $this->assertContains('private-towns.Okahandja.managers', $issueChannels);
        $this->assertContains('private-platform.admins', $issueChannels);
        $this->assertSame('issue.status.updated', $issueEvent->broadcastAs());
        $this->assertSame('city_report', $issueEvent->broadcastWith()['resource_type']);

        $this->assertSame('role.application.submitted', $roleEvent->broadcastAs());
        $this->assertSame('pending_review', $roleEvent->broadcastWith()['status']);

        $emergencyChannels = collect($emergencyEvent->broadcastOn())->pluck('name')->all();
        $this->assertContains('private-users.'.$resident->id, $emergencyChannels);
        $this->assertContains('private-towns.Okahandja.managers', $emergencyChannels);
        $this->assertContains('private-platform.admins', $emergencyChannels);
        $this->assertSame('emergency.alert.published', $emergencyEvent->broadcastAs());
        $this->assertSame('critical', $emergencyEvent->broadcastWith()['priority']);
    }
}
