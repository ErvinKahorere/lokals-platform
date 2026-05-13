<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\CityReport;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TownManagerExtensionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_town_manager_dashboard_is_accessible_to_town_manager_role(): void
    {
        Sanctum::actingAs(User::where('email', 'manager@lokals.app')->firstOrFail());

        $this->getJson('/api/v1/dashboard/town-manager')
            ->assertOk()
            ->assertJsonPath('role', 'town_manager')
            ->assertJsonStructure([
                'stats' => [
                    'total_reports',
                    'open_reports',
                    'in_progress_reports',
                    'resolved_reports',
                    'urgent_reports',
                    'municipal_alerts_sent',
                    'public_service_entries',
                    'registered_businesses',
                ],
            ]);
    }

    public function test_normal_user_is_blocked_from_town_manager_dashboard(): void
    {
        Sanctum::actingAs(User::where('email', 'resident@lokals.app')->firstOrFail());

        $this->getJson('/api/v1/dashboard/town-manager')->assertForbidden();
    }

    public function test_town_manager_can_view_reports_in_scope(): void
    {
        Sanctum::actingAs(User::where('email', 'manager@lokals.app')->firstOrFail());

        $this->getJson('/api/v1/reports')
            ->assertOk()
            ->assertJsonStructure(['data'])
            ->assertJsonFragment(['town' => 'Okahandja']);
    }

    public function test_town_manager_can_update_report_status_and_owner_gets_notification(): void
    {
        $manager = User::where('email', 'manager@lokals.app')->firstOrFail();
        $report = CityReport::where('title', 'Streetlight outage near Nau-Aib bus stop')->firstOrFail();
        Sanctum::actingAs($manager);

        $this->patchJson("/api/v1/reports/{$report->id}/status", [
            'status' => 'resolved',
            'resolution_notes' => 'Road surface patched this afternoon.',
        ])->assertOk()->assertJsonPath('status', 'resolved');

        $reportOwner = User::whereKey($report->user_id)->firstOrFail();
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $reportOwner->id,
            'notifiable_type' => User::class,
        ]);

        $notificationTypes = DatabaseNotification::query()
            ->where('notifiable_id', $reportOwner->id)
            ->latest()
            ->pluck('data')
            ->map(fn (array $payload): ?string => $payload['type'] ?? null)
            ->filter()
            ->values();

        $this->assertTrue(
            $notificationTypes->contains('report_update'),
            'Expected the report owner to receive a report_update notification after status changes.',
        );
    }

    public function test_municipal_alert_appears_in_alerts_feed(): void
    {
        $manager = User::where('email', 'manager@lokals.app')->firstOrFail();
        Sanctum::actingAs($manager);

        $this->postJson('/api/v1/alerts', [
            'title' => 'Water maintenance in Nau-Aib',
            'body' => 'Crews are closing one lane while repairs finish.',
            'type' => 'municipal_alert',
            'priority' => 'high',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
        ])->assertCreated();

        $this->assertDatabaseHas('alerts', [
            'title' => 'Water maintenance in Nau-Aib',
            'type' => 'municipal_alert',
        ]);

        $alert = Alert::where('title', 'Water maintenance in Nau-Aib')->firstOrFail();

        $this->getJson('/api/v1/alerts/feed')
            ->assertOk()
            ->assertJsonFragment([
                'title' => $alert->title,
                'type' => 'municipal_alert',
            ]);
    }

    public function test_normal_user_can_submit_report(): void
    {
        Storage::fake('public');

        $resident = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($resident);

        $response = $this->post('/api/v1/reports', [
            'category' => 'water',
            'title' => 'Burst pipe outside the flats',
            'description' => 'Water is running into the road since sunrise.',
            'location' => 'Nau-Aib, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'priority' => 'high',
            'attachments' => [
                UploadedFile::fake()->image('burst-pipe.jpg'),
                UploadedFile::fake()->create('voice-note.m4a', 24, 'audio/mp4'),
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'submitted')
            ->assertJsonCount(2, 'attachments')
            ->assertJsonPath('updates.0.type', 'submitted');
    }

    public function test_resident_can_only_view_their_own_report(): void
    {
        $otherResident = User::query()->create([
            'name' => 'Other Resident',
            'email' => 'other-resident@lokals.app',
            'phone' => '+264811234567',
            'password' => bcrypt('password'),
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
        ]);

        $report = CityReport::query()->create([
            'user_id' => $otherResident->id,
            'category' => 'roads',
            'title' => 'Damaged pavement',
            'description' => 'Broken pavement near the clinic.',
            'location' => 'Nau-Aib, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'status' => 'submitted',
        ]);

        Sanctum::actingAs(User::where('email', 'resident@lokals.app')->firstOrFail());

        $this->getJson("/api/v1/reports/{$report->id}")->assertForbidden();
    }

    public function test_town_manager_can_add_resident_visible_report_update(): void
    {
        $manager = User::where('email', 'manager@lokals.app')->firstOrFail();
        $report = CityReport::where('title', 'Streetlight outage near Nau-Aib bus stop')->firstOrFail();
        Sanctum::actingAs($manager);

        $this->postJson("/api/v1/reports/{$report->id}/updates", [
            'note' => 'The roads team has been assigned and will inspect this afternoon.',
            'visibility' => 'resident',
            'status' => 'assigned',
            'department_name' => 'Roads',
        ])->assertOk()
            ->assertJsonPath('status', 'assigned')
            ->assertJsonFragment([
                'message' => 'The roads team has been assigned and will inspect this afternoon.',
            ]);
    }
}
