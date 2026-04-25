<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlatformFlowsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_login_and_register_work(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'phone' => '+264810000002',
            'password' => 'password',
        ]);

        $login->assertOk()->assertJsonStructure(['token', 'user']);

        $register = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'phone' => '+264810009999',
            'password' => 'password',
            'password_confirmation' => 'password',
            'default_town' => 'Windhoek',
            'default_area' => 'Eros',
            'roles' => ['citizen'],
        ]);

        $register->assertCreated()->assertJsonPath('user.current_role', 'citizen');
    }

    public function test_role_switching_follow_and_booking_flow_work(): void
    {
        $user = User::where('email', 'doctor@lokals.test')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/switch-role', ['role' => 'service_provider'])
            ->assertOk()
            ->assertJsonPath('current_role', 'service_provider');

        $citizen = User::where('email', 'citizen@lokals.test')->firstOrFail();
        Sanctum::actingAs($citizen);

        $provider = ServiceProvider::where('name', 'FreshFade Katutura')->firstOrFail();
        $service = Service::where('service_provider_id', $provider->id)->firstOrFail();

        $this->postJson('/api/v1/bookings', [
            'service_provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(4)->toDateString(),
            'start_time' => '11:00',
            'notes' => 'Test booking flow',
        ])->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'user_id' => $citizen->id,
            'service_provider_id' => $provider->id,
        ]);

        $organizationId = \App\Models\Organization::where('name', 'Eembaxu Health Centre')->value('id');

        $follow = $this->postJson('/api/v1/follow', [
            'type' => 'organization',
            'id' => $organizationId,
        ]);

        $follow->assertCreated();
        $followId = $follow->json('id');

        $this->assertDatabaseHas('follows', [
            'user_id' => $citizen->id,
            'followable_id' => $organizationId,
        ]);

        $this->deleteJson("/api/v1/follow/{$followId}")
            ->assertOk();
    }

    public function test_posting_alerts_and_notifications_flow_work(): void
    {
        $seller = User::where('email', 'doctor@lokals.test')->firstOrFail();
        Sanctum::actingAs($seller);

        $this->postJson('/api/v1/store/products', [
            'title' => 'Audit Product',
            'description' => 'Test product post',
            'price' => 120,
            'category' => 'health',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'status' => 'published',
        ])->assertCreated();

        $this->assertDatabaseHas('products', [
            'title' => 'Audit Product',
        ]);

        $this->getJson('/api/v1/alerts/feed')
            ->assertOk()
            ->assertJsonStructure(['data']);

        DatabaseNotification::query()->create([
            'id' => (string) str()->uuid(),
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $seller->id,
            'data' => [
                'type' => 'booking_update',
                'title' => 'Booking updated',
                'body' => 'A booking has changed.',
                'target' => [
                    'type' => 'booking',
                    'id' => 1,
                    'href' => '/dashboard/bookings',
                ],
            ],
        ]);

        $notifications = $this->getJson('/api/v1/notifications')->assertOk();
        $id = $notifications->json('data.0.id');

        $this->postJson("/api/v1/notifications/{$id}/read")->assertOk();
        $this->postJson('/api/v1/notifications/read-all')->assertOk();
    }
}
