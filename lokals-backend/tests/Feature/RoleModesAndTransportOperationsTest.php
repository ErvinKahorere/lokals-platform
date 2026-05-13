<?php

namespace Tests\Feature;

use App\Models\DeliveryRequest;
use App\Models\RideRequest;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleModesAndTransportOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_can_submit_driver_application_and_manager_can_approve_it(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $manager = User::query()->where('email', 'manager@lokals.app')->firstOrFail();

        Sanctum::actingAs($resident);
        $application = $this->postJson('/api/v1/role-applications', [
            'requested_role' => 'driver',
            'full_name' => 'Resident Driver',
            'phone' => '+264810000999',
            'email' => 'resident@lokals.app',
            'town_name' => 'Okahandja',
            'address' => 'Nau-Aib, Okahandja',
            'license_number' => 'DL-OKA-123',
            'vehicle_registration' => 'N 12345 W',
            'vehicle_type' => 'Sedan',
            'documents' => [['type' => 'license', 'label' => 'Driver licence']],
        ])->assertCreated();

        $applicationId = $application->json('data.id');
        $this->postJson("/api/v1/my/role-applications/{$applicationId}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_review');

        Sanctum::actingAs($manager);
        $this->patchJson("/api/v1/admin/role-applications/{$applicationId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $resident->refresh();
        $this->assertTrue($resident->hasRole('driver'));

        Sanctum::actingAs($resident);
        $this->getJson('/api/v1/my/modes')
            ->assertOk()
            ->assertJsonFragment(['driver']);

        $this->patchJson('/api/v1/my/current-mode', ['mode' => 'driver'])
            ->assertOk()
            ->assertJsonPath('current_mode', 'driver');
    }

    public function test_driver_can_accept_and_complete_ride(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $driver = User::query()->where('email', 'taxi@lokals.app')->firstOrFail();

        Sanctum::actingAs($resident);
        $rideResponse = $this->postJson('/api/v1/rides/request', [
            'pickup_location' => 'Taxi Rank, Okahandja',
            'dropoff_location' => 'Town Hall',
            'ride_type' => 'Standard',
            'fare_estimate' => 60,
        ])->assertCreated();

        $rideId = $rideResponse->json('data.id');

        Sanctum::actingAs($driver);
        $this->postJson("/api/v1/driver/rides/{$rideId}/accept")->assertOk()->assertJsonPath('data.status', 'accepted');
        $this->patchJson("/api/v1/driver/rides/{$rideId}/arrived")->assertOk()->assertJsonPath('data.status', 'arrived');
        $this->patchJson("/api/v1/driver/rides/{$rideId}/start")->assertOk()->assertJsonPath('data.status', 'in_progress');
        $this->patchJson("/api/v1/driver/rides/{$rideId}/complete")->assertOk()->assertJsonPath('data.status', 'completed');

        $this->getJson('/api/v1/driver/earnings')
            ->assertOk()
            ->assertJsonPath('data.lifetime', '60.00');
    }

    public function test_courier_can_accept_and_deliver_delivery_request(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $courier = User::query()->where('email', 'courier@lokals.app')->firstOrFail();

        Sanctum::actingAs($resident);
        $deliveryResponse = $this->postJson('/api/v1/deliveries/request', [
            'pickup_location' => 'Nau-Aib market',
            'dropoff_location' => 'Five Rand hardware',
            'parcel_description' => 'Household supplies',
            'parcel_size' => 'medium',
            'estimated_price' => 75,
        ])->assertCreated();

        $deliveryId = $deliveryResponse->json('data.id');

        Sanctum::actingAs($courier);
        $this->postJson("/api/v1/courier/deliveries/{$deliveryId}/accept")->assertOk()->assertJsonPath('data.status', 'accepted');
        $this->patchJson("/api/v1/courier/deliveries/{$deliveryId}/pickup-confirmed")->assertOk()->assertJsonPath('data.status', 'pickup_confirmed');
        $this->patchJson("/api/v1/courier/deliveries/{$deliveryId}/in-transit")->assertOk()->assertJsonPath('data.status', 'in_transit');
        $this->patchJson("/api/v1/courier/deliveries/{$deliveryId}/delivered")->assertOk()->assertJsonPath('data.status', 'delivered');

        $this->getJson('/api/v1/courier/earnings')
            ->assertOk()
            ->assertJsonPath('data.lifetime', '75.00');
    }
}
