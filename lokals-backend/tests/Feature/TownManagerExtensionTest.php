<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\CityReport;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
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
        Sanctum::actingAs(User::where('email', 'municipality@lokals.test')->firstOrFail());

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
        Sanctum::actingAs(User::where('email', 'citizen@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/dashboard/town-manager')->assertForbidden();
    }

    public function test_town_manager_can_view_reports_in_scope(): void
    {
        Sanctum::actingAs(User::where('email', 'municipality@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/reports')
            ->assertOk()
            ->assertJsonStructure(['data'])
            ->assertJsonFragment(['town' => 'Okahandja']);
    }

    public function test_town_manager_can_update_report_status_and_owner_gets_notification(): void
    {
        $manager = User::where('email', 'municipality@lokals.test')->firstOrFail();
        $report = CityReport::where('title', 'Pothole on main road')->firstOrFail();
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

        $notification = DatabaseNotification::query()
            ->where('notifiable_id', $reportOwner->id)
            ->latest()
            ->firstOrFail();

        $this->assertSame('report_update', $notification->data['type']);
    }

    public function test_municipal_alert_appears_in_alerts_feed(): void
    {
        $manager = User::where('email', 'municipality@lokals.test')->firstOrFail();
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
        $citizen = User::where('email', 'citizen@lokals.test')->firstOrFail();
        Sanctum::actingAs($citizen);

        $this->postJson('/api/v1/reports', [
            'category' => 'water',
            'title' => 'Burst pipe outside the flats',
            'description' => 'Water is running into the road since sunrise.',
            'location' => 'Nau-Aib, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'priority' => 'high',
        ])->assertCreated()->assertJsonPath('status', 'open');
    }
}
