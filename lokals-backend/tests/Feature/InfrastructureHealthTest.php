<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

class InfrastructureHealthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_queue_health_endpoint_is_available_to_operational_users_only(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $manager = User::query()->where('email', 'manager@lokals.app')->firstOrFail();

        $this->actingAs($resident)
            ->getJson('/api/v1/queue/health')
            ->assertForbidden();

        $this->actingAs($manager)
            ->getJson('/api/v1/queue/health')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'queue_driver',
                    'broadcast_driver',
                    'redis' => [
                        'configured',
                        'host_present',
                        'port_present',
                    ],
                    'jobs' => [
                        'table_present',
                        'pending_count',
                    ],
                    'failed_jobs' => [
                        'table_present',
                        'count',
                    ],
                    'workers' => [
                        'recommended_command',
                    ],
                    'timestamp',
                ],
            ]);
    }

    public function test_notification_smoke_command_creates_a_demo_notification(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $before = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $resident->id)
            ->count();

        $this->artisan('lokals:notification-smoke', ['email' => 'resident@lokals.app'])
            ->expectsOutput('Notification smoke test sent to resident@lokals.app.')
            ->assertSuccessful();

        $after = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $resident->id)
            ->count();

        $this->assertSame($before + 1, $after);
    }
}
