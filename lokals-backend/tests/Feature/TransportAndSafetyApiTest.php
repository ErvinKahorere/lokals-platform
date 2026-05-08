<?php

namespace Tests\Feature;

use App\Models\DeliveryRequest;
use App\Models\RideRequest;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransportAndSafetyApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_delivery_list_create_and_detail_work(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/deliveries')
            ->assertOk()
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'pickup_location',
                    'dropoff_location',
                    'parcel_description',
                    'status',
                ],
            ]);

        $created = $this->postJson('/api/v1/deliveries', [
            'pickup_location' => 'Nau-Aib Community Hall',
            'dropoff_location' => 'Okahandja Town Council',
            'parcel_description' => 'Bakery order for same-day delivery',
            'parcel_size' => 'medium',
            'estimated_price' => 65,
            'notes' => 'Collect near the main gate.',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'requested');

        $deliveryId = $created->json('data.id');

        $this->getJson("/api/v1/deliveries/{$deliveryId}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'pickup_location',
                    'dropoff_location',
                    'parcel_description',
                    'notes',
                    'status',
                    'user',
                ],
            ]);
    }

    public function test_delivery_creation_validates_required_fields(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/deliveries', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'pickup_address',
                'pickup_location',
                'dropoff_address',
                'dropoff_location',
                'item_description',
                'parcel_description',
            ]);
    }

    public function test_ride_list_create_and_detail_work(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/rides')
            ->assertOk()
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'pickup_location',
                    'dropoff_location',
                    'ride_type',
                    'status',
                ],
            ]);

        $created = $this->postJson('/api/v1/rides', [
            'pickup_location' => 'Taxi Rank, Okahandja',
            'dropoff_location' => 'Okahandja State Clinic',
            'ride_type' => 'Comfort',
            'trip_purpose' => 'Clinic visit',
            'fare_estimate' => 58,
            'notes' => 'Pickup next to the pharmacy sign.',
        ])->assertCreated()
            ->assertJsonPath('data.ride_type', 'Comfort');

        $rideId = $created->json('data.id');

        $this->getJson("/api/v1/rides/{$rideId}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'pickup_location',
                    'dropoff_location',
                    'ride_type',
                    'trip_purpose',
                    'status',
                    'user',
                ],
            ]);
    }

    public function test_ride_creation_validates_required_fields(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/rides', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'pickup_location',
                'pickup_address',
                'dropoff_location',
                'dropoff_address',
            ]);
    }

    public function test_sos_creation_works_with_emergency_metadata(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/sos', [
            'message' => 'Unsafe roadside situation',
            'emergency_type' => 'Roadside',
            'location' => 'Nau-Aib football ground',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'sent')
            ->assertJsonPath('data.emergency_type', 'Roadside');
    }

    public function test_transport_requests_stay_scoped_to_requesting_user(): void
    {
        $citizen = User::where('email', 'resident@lokals.app')->firstOrFail();
        $admin = User::where('email', 'admin@lokals.app')->firstOrFail();
        $delivery = DeliveryRequest::where('user_id', $citizen->id)->firstOrFail();
        $ride = RideRequest::where('user_id', $citizen->id)->firstOrFail();

        Sanctum::actingAs($admin);
        $this->getJson("/api/v1/deliveries/{$delivery->id}")->assertOk();
        $this->getJson("/api/v1/rides/{$ride->id}")->assertOk();
    }
}
