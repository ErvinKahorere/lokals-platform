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
        Sanctum::actingAs(User::where('email', 'resident@lokals.app')->firstOrFail());

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
        Sanctum::actingAs(User::where('email', 'market@lokals.app')->firstOrFail());

        $this->getJson('/api/v1/dashboard/business')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats',
                'quick_actions',
                'pending_tasks',
                'businesses',
                'recent_services',
                'recent_bookings',
                'recent_products',
            ]);
    }

    public function test_seller_dashboard_route_returns_business_payload(): void
    {
        $seller = User::where('email', 'market@lokals.app')->firstOrFail();
        $seller->update(['current_role' => 'seller']);

        Sanctum::actingAs($seller);

        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('dashboard_endpoint', '/dashboard/seller');

        $this->getJson('/api/v1/dashboard/seller')
            ->assertOk()
            ->assertJsonPath('role', 'seller')
            ->assertJsonStructure([
                'stats' => ['products', 'services', 'bookings', 'followers', 'alerts_promotions', 'enquiries'],
            ]);
    }

    public function test_worker_dashboard_access_and_expected_keys(): void
    {
        $worker = User::factory()->create([
            'current_role' => 'worker',
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
        ]);
        $worker->assignRole('worker');

        Sanctum::actingAs($worker);

        $this->getJson('/api/v1/dashboard/worker')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats' => ['profile_completion', 'jobs_near_me', 'applications', 'availability'],
                'quick_actions',
                'pending_tasks',
                'worker_profile',
                'jobs_near_me',
                'applications',
            ]);
    }

    public function test_service_provider_dashboard_access_and_expected_keys(): void
    {
        $provider = User::where('email', 'plumber@lokals.app')->firstOrFail();

        Sanctum::actingAs($provider);

        $this->getJson('/api/v1/dashboard/service-provider')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats' => ['bookings', 'services', 'availability_slots', 'followers', 'rates', 'recent_enquiries'],
                'quick_actions',
                'pending_tasks',
                'providers',
                'recent_bookings',
                'services_offered',
            ]);
    }

    public function test_organization_dashboard_access_and_expected_keys(): void
    {
        $organizationAdmin = User::factory()->create([
            'current_role' => 'organization_admin',
            'default_town' => 'Okahandja',
            'default_area' => 'Town Centre',
        ]);
        $organizationAdmin->assignRole('organization_admin');

        Sanctum::actingAs($organizationAdmin);

        $this->getJson('/api/v1/dashboard/organization')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats' => ['followers', 'alerts_published', 'events', 'updates'],
                'quick_actions',
                'pending_tasks',
                'organizations',
                'public_updates',
                'events',
                'profile_status',
                'news_source_status',
            ]);
    }

    public function test_municipality_dashboard_access_and_expected_keys(): void
    {
        Sanctum::actingAs(User::where('email', 'manager@lokals.app')->firstOrFail());

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
        Sanctum::actingAs(User::where('email', 'admin@lokals.app')->firstOrFail());

        $this->getJson('/api/v1/dashboard/admin')
            ->assertOk()
            ->assertJsonStructure([
                'role',
                'stats' => [
                    'users',
                    'roles',
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
                'system_overview',
                'quick_actions',
                'pending_tasks',
            ]);
    }

    public function test_unauthorized_dashboard_access_is_blocked(): void
    {
        Sanctum::actingAs(User::where('email', 'resident@lokals.app')->firstOrFail());

        $this->getJson('/api/v1/dashboard/business')->assertForbidden();
        $this->getJson('/api/v1/dashboard/town-manager')->assertForbidden();
        $this->getJson('/api/v1/dashboard/admin')->assertForbidden();
    }
}
