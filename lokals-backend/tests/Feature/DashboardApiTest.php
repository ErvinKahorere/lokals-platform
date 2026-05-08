<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_citizen_dashboard_access_and_expected_keys(): void
    {
        Sanctum::actingAs(User::where('email', 'citizen@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/dashboard/citizen')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats',
                'quick_actions',
                'pending_tasks',
                'upcoming_bookings',
                'recent_activity',
            ]);
    }

    public function test_business_dashboard_access_and_expected_keys(): void
    {
        Sanctum::actingAs(User::where('email', 'doctor@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/dashboard/business')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats',
                'quick_actions',
                'pending_tasks',
                'businesses',
                'recent_products',
            ]);
    }

    public function test_municipality_dashboard_access_and_expected_keys(): void
    {
        Sanctum::actingAs(User::where('email', 'municipality@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/dashboard/town-manager')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats',
                'quick_actions',
                'pending_tasks',
                'reports_by_status',
                'recent_reports',
            ]);
    }

    public function test_super_admin_dashboard_access_and_expected_keys(): void
    {
        Sanctum::actingAs(User::where('email', 'admin@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/dashboard/admin')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats' => [
                    'users',
                    'organizations',
                    'businesses',
                    'providers',
                    'reports',
                    'alerts',
                    'events',
                    'products',
                    'accommodations',
                    'flagged_content',
                ],
                'quick_actions',
                'pending_tasks',
            ]);
    }

    public function test_unauthorized_dashboard_access_is_blocked(): void
    {
        Sanctum::actingAs(User::where('email', 'citizen@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/dashboard/business')->assertForbidden();
        $this->getJson('/api/v1/dashboard/town-manager')->assertForbidden();
        $this->getJson('/api/v1/dashboard/admin')->assertForbidden();
    }
}
