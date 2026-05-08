<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Models\Organization;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Carbon;
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
            'phone' => '+264810001050',
            'password' => 'Password123!',
        ]);

        $login->assertOk()->assertJsonStructure(['token', 'user']);

        $register = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'phone' => '+264810009999',
            'password' => 'password',
            'password_confirmation' => 'password',
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
            'roles' => ['citizen'],
        ]);

        $register->assertCreated()->assertJsonPath('user.current_role', 'citizen');
    }

    public function test_role_switching_follow_and_booking_flow_work(): void
    {
        $user = User::where('email', 'barber@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/switch-role', ['role' => 'service_provider'])
            ->assertOk()
            ->assertJsonPath('current_role', 'service_provider');

        $citizen = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($citizen);

        $provider = ServiceProvider::where('name', 'Nau-Aib Style Barber')->firstOrFail();
        $service = Service::where('service_provider_id', $provider->id)->firstOrFail();
        $bookingDate = Carbon::now()->next(Carbon::MONDAY)->toDateString();

        $this->postJson('/api/v1/bookings', [
            'service_provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => $bookingDate,
            'start_time' => '11:00',
            'notes' => 'Test booking flow',
        ])->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'user_id' => $citizen->id,
            'service_provider_id' => $provider->id,
        ]);

        $organizationId = \App\Models\Organization::where('name', 'Okahandja Town Council')->value('id');

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

    public function test_service_provider_and_directory_endpoints_return_rich_details(): void
    {
        $provider = ServiceProvider::where('name', 'Nau-Aib Style Barber')->firstOrFail();
        $organization = Organization::where('name', 'Okahandja Town Council')->firstOrFail();

        $this->getJson('/api/v1/service-providers?verified=1&sort=top_rated')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'name',
                    'category',
                    'rating',
                    'review_count',
                    'followers_count',
                    'availability_status',
                ]],
            ]);

        $this->getJson("/api/v1/service-providers/{$provider->id}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'category',
                    'town',
                    'area',
                    'rating',
                    'review_count',
                    'followers_count',
                    'alerts',
                    'services',
                ],
            ]);

        $this->getJson('/api/v1/directory?public_service=1&verified=1&sort=open')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'name',
                    'category',
                    'rating',
                    'review_count',
                    'followers_count',
                    'open_now',
                ]],
            ]);

        $this->getJson("/api/v1/directory/{$organization->id}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'category',
                    'town',
                    'area',
                    'alerts',
                    'services_offered',
                    'opening_hours',
                ],
            ]);
    }

    public function test_booking_rejects_inactive_or_overlapping_services(): void
    {
        $citizen = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($citizen);

        $provider = ServiceProvider::where('name', 'Nau-Aib Style Barber')->firstOrFail();
        $service = Service::where('service_provider_id', $provider->id)->where('name', 'Classic haircut')->firstOrFail();

        $inactiveService = Service::create([
            'service_provider_id' => $provider->id,
            'name' => 'After-hours cut',
            'description' => 'Inactive test service',
            'duration_minutes' => 30,
            'price' => 90,
            'price_type' => 'fixed',
            'is_bookable' => true,
            'is_active' => false,
        ]);

        $this->postJson('/api/v1/bookings', [
            'service_id' => $inactiveService->id,
            'booking_date' => Carbon::now()->next(Carbon::MONDAY)->toDateString(),
            'start_time' => '09:00',
        ])->assertStatus(422);

        $bookingDate = Carbon::now()->next(Carbon::TUESDAY)->toDateString();

        $this->postJson('/api/v1/bookings', [
            'service_id' => $service->id,
            'booking_date' => $bookingDate,
            'start_time' => '10:00',
            'notes' => 'Primary booking',
        ])->assertCreated();

        $this->postJson('/api/v1/bookings', [
            'service_id' => $service->id,
            'booking_date' => $bookingDate,
            'start_time' => '10:00',
            'notes' => 'Overlapping booking',
        ])->assertStatus(422);
    }

    public function test_followed_provider_and_organization_updates_appear_in_feeds(): void
    {
        $citizen = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($citizen);

        $provider = ServiceProvider::where('name', 'Nau-Aib Style Barber')->firstOrFail();
        $organization = Organization::where('name', 'Okahandja Town Council')->firstOrFail();

        $this->postJson('/api/v1/follow', [
            'type' => 'service_provider',
            'id' => $provider->id,
        ])->assertCreated();

        $this->postJson('/api/v1/follow', [
            'type' => 'organization',
            'id' => $organization->id,
        ])->assertCreated();

        $this->getJson("/api/v1/directory/{$organization->id}/alerts")
            ->assertOk()
            ->assertJsonFragment([
                'title' => 'Resident support desk now open on Saturdays',
            ]);

        $this->getJson('/api/v1/following-feed')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_posting_alerts_and_notifications_flow_work(): void
    {
        $seller = User::where('email', 'market@lokals.app')->firstOrFail();
        Sanctum::actingAs($seller);

        $this->postJson('/api/v1/store/products', [
            'title' => 'Audit Product',
            'description' => 'Test product post',
            'price' => 120,
            'category' => 'health',
            'town' => 'Okahandja',
            'area' => 'Town Centre',
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

        $notifications = $this->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'type',
                    'data',
                    'target',
                ]],
                'unread_count',
            ]);
        $id = $notifications->json('data.0.id');

        $this->postJson("/api/v1/notifications/{$id}/read")
            ->assertOk()
            ->assertJsonStructure(['notification', 'unread_count']);

        $this->postJson('/api/v1/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);
    }

    public function test_alert_news_and_following_feeds_return_actionable_payloads(): void
    {
        $citizen = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($citizen);

        $this->getJson('/api/v1/alerts/feed')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'source_type',
                    'title',
                    'body',
                    'location',
                    'severity',
                ]],
            ]);

        $this->getJson('/api/v1/following-feed')
            ->assertOk()
            ->assertJsonStructure(['data']);

        $this->getJson('/api/v1/news/local?town=Okahandja')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'title',
                    'summary',
                    'source_name',
                    'external_url',
                    'source_domain',
                    'compliance_notice',
                ]],
            ]);
    }
}
