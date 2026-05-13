<?php

namespace Database\Seeders;

use App\Models\CourierProfile;
use App\Models\DeliveryRequest;
use App\Models\DriverProfile;
use App\Models\RideRequest;
use Database\Seeders\Support\BuildsDemoRecords;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoTransportAccountsSeeder extends Seeder
{
    use BuildsDemoRecords;

    public function run(): void
    {
        foreach (['citizen', 'driver', 'courier'] as $roleName) {
            Role::findOrCreate($roleName, 'sanctum');
        }

        $resident = $this->upsertUser(
            'resident@lokals.test',
            [
                'name' => 'Demo Resident',
                'phone' => '+264810009901',
                'password' => Hash::make('password'),
                'location' => 'Nau-Aib, Okahandja',
                'default_town' => 'Okahandja',
                'default_area' => 'Nau-Aib',
                'current_role' => 'citizen',
            ],
            ['citizen'],
            [
                'bio' => 'Resident test profile for taxi and delivery verification.',
            ],
            [
                'interests' => ['Taxi', 'Delivery', 'Community updates'],
            ],
        );

        $driver = $this->upsertUser(
            'driver@lokals.test',
            [
                'name' => 'Demo Driver',
                'phone' => '+264810009902',
                'password' => Hash::make('password'),
                'location' => 'Town Centre, Okahandja',
                'default_town' => 'Okahandja',
                'default_area' => 'Town Centre',
                'current_role' => 'driver',
                'profession' => 'Driver',
            ],
            ['citizen', 'driver'],
            [
                'bio' => 'Approved driver test account for resident ride matching.',
            ],
            [
                'preferred_roles' => ['citizen', 'driver'],
                'interests' => ['Transport operations'],
            ],
        );

        DriverProfile::query()->updateOrCreate(
            ['user_id' => $driver->id],
            [
                'license_number' => 'DRV-OKA-TEST-01',
                'vehicle_registration' => 'N12345OK',
                'vehicle_type' => 'Sedan',
                'vehicle_make' => 'Toyota',
                'vehicle_model' => 'Corolla',
                'is_online' => true,
                'is_verified' => true,
                'rating' => 4.8,
                'completed_trips' => 18,
                'lifetime_earnings' => 2480,
            ],
        );

        $courier = $this->upsertUser(
            'courier@lokals.test',
            [
                'name' => 'Demo Courier',
                'phone' => '+264810009903',
                'password' => Hash::make('password'),
                'location' => 'Town Centre, Okahandja',
                'default_town' => 'Okahandja',
                'default_area' => 'Town Centre',
                'current_role' => 'courier',
                'profession' => 'Courier',
            ],
            ['citizen', 'courier'],
            [
                'bio' => 'Approved courier test account for local delivery verification.',
            ],
            [
                'preferred_roles' => ['citizen', 'courier'],
                'interests' => ['Delivery operations'],
            ],
        );

        CourierProfile::query()->updateOrCreate(
            ['user_id' => $courier->id],
            [
                'license_number' => 'CR-OKA-TEST-01',
                'vehicle_registration' => 'C12345OK',
                'vehicle_type' => 'Motorcycle',
                'is_online' => true,
                'is_verified' => true,
                'rating' => 4.7,
                'completed_deliveries' => 24,
                'lifetime_earnings' => 1960,
            ],
        );

        RideRequest::query()->updateOrCreate(
            [
                'user_id' => $resident->id,
                'pickup_location' => 'Okahandja taxi rank',
                'dropoff_location' => 'Okahandja State Clinic',
            ],
            [
                'driver_id' => $driver->id,
                'pickup_address' => 'Okahandja taxi rank',
                'dropoff_address' => 'Okahandja State Clinic',
                'ride_type' => 'Standard',
                'trip_purpose' => 'Clinic visit',
                'notes' => 'Meet me next to the pharmacy sign.',
                'status' => 'completed',
                'fare_estimate' => 58,
                'estimated_distance_km' => 4.2,
                'vehicle_label' => 'Toyota Corolla N12345OK',
                'assigned_at' => now()->subHours(3),
                'arrived_at' => now()->subHours(2)->subMinutes(48),
                'started_at' => now()->subHours(2)->subMinutes(44),
                'completed_at' => now()->subHours(2)->subMinutes(18),
                'rating' => 5,
                'rating_comment' => 'Smooth and punctual trip.',
            ],
        );

        RideRequest::query()->updateOrCreate(
            [
                'user_id' => $resident->id,
                'pickup_location' => 'Nau-Aib Community Hall',
                'dropoff_location' => 'Okahandja Town Council',
            ],
            [
                'pickup_address' => 'Nau-Aib Community Hall',
                'dropoff_address' => 'Okahandja Town Council',
                'ride_type' => 'Comfort',
                'trip_purpose' => 'Town errand',
                'notes' => 'Please stop by the main gate.',
                'status' => 'searching',
                'fare_estimate' => 64,
                'estimated_distance_km' => 5.1,
            ],
        );

        DeliveryRequest::query()->updateOrCreate(
            [
                'user_id' => $resident->id,
                'pickup_location' => 'Okahandja Town Council',
                'dropoff_location' => 'Nau-Aib community hall',
            ],
            [
                'driver_id' => $courier->id,
                'pickup_address' => 'Okahandja Town Council',
                'dropoff_address' => 'Nau-Aib community hall',
                'item_description' => 'Document envelope',
                'parcel_description' => 'Document envelope',
                'parcel_size' => 'small',
                'weight_kg' => 0.5,
                'urgency' => 'standard',
                'notes' => 'Leave at reception if the hall office is open.',
                'estimated_price' => 45,
                'price' => 45,
                'status' => 'delivered',
                'assigned_at' => now()->subHours(4),
                'picked_up_at' => now()->subHours(3)->subMinutes(40),
                'in_transit_at' => now()->subHours(3)->subMinutes(25),
                'delivered_at' => now()->subHours(3),
                'rating' => 5,
                'rating_comment' => 'Fast drop-off and clear communication.',
            ],
        );

        DeliveryRequest::query()->updateOrCreate(
            [
                'user_id' => $resident->id,
                'pickup_location' => 'Home',
                'dropoff_location' => 'Five Rand',
            ],
            [
                'pickup_address' => 'Home',
                'dropoff_address' => 'Five Rand',
                'item_description' => 'Groceries and essentials',
                'parcel_description' => 'Groceries and essentials',
                'parcel_size' => 'medium',
                'weight_kg' => 4.2,
                'urgency' => 'express',
                'notes' => 'Fragile items on top, please.',
                'estimated_price' => 97,
                'price' => 97,
                'status' => 'requested',
            ],
        );
    }
}
