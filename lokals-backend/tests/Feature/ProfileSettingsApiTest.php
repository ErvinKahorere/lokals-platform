<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileSettingsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_profile_view_returns_user_saved_addresses_stats_and_enrichment(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonStructure([
                'user',
                'saved_addresses',
                'enrichment',
                'stats' => [
                    'bookings',
                    'jobs_applications',
                    'listings',
                    'products',
                    'accommodations',
                    'saved_items',
                    'tickets',
                    'follows',
                    'businesses',
                ],
            ]);
    }

    public function test_profile_update_updates_user_profile_and_preferences(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/me', [
            'name' => 'Citizen Updated',
            'phone' => '+264810001050',
            'email' => 'resident.updated@lokals.app',
            'bio' => 'Helping my neighborhood stay connected.',
            'profession' => 'Community organizer',
            'business_name' => 'Citizen Collective',
            'default_town' => 'Swakopmund',
            'default_area' => 'Nau-Aib',
            'service_radius' => 18,
            'whatsapp' => '+264810001099',
            'profile_visibility' => 'private',
            'interests' => ['Events', 'Health', 'Services'],
            'notification_preferences' => [
                'booking_updates' => true,
                'job_updates' => false,
            ],
        ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Citizen Updated')
            ->assertJsonPath('user.current_role', 'citizen');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Citizen Updated',
            'email' => 'resident.updated@lokals.app',
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
            'profile_visibility' => 'private',
        ]);

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
        ]);
    }

    public function test_profile_update_cannot_escalate_roles(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/me', [
            'name' => 'Citizen Safe Update',
            'roles' => ['super_admin'],
        ])->assertOk();

        $this->assertFalse($user->fresh()->hasRole('super_admin'));
    }

    public function test_preferences_update_returns_service_radius_and_notification_preferences(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/preferences', [
            'default_town' => 'Walvis Bay',
            'default_area' => 'Central Okahandja',
            'service_radius' => 25,
            'interests' => ['Jobs', 'Marketplace'],
            'notification_preferences' => [
                'alerts_from_followed_entities' => true,
                'booking_updates' => false,
                'job_updates' => true,
            ],
        ])
            ->assertOk()
            ->assertJsonPath('preferences.default_town', 'Okahandja')
            ->assertJsonPath('preferences.default_area', 'Central Okahandja')
            ->assertJsonPath('pilot.town', 'Okahandja')
            ->assertJsonPath('preferences.service_radius', 25);
    }

    public function test_role_switch_blocks_invalid_role_and_logout_clears_current_token(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/switch-role', [
            'role' => 'super_admin',
        ])->assertForbidden();

        $this->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out');
    }
}
