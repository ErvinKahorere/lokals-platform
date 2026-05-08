<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Announcement;
use App\Models\CityReport;
use App\Models\DeliveryRequest;
use App\Models\Organization;
use App\Models\RideRequest;
use App\Models\SosAlert;
use App\Models\User;
use Database\Seeders\Support\BuildsDemoRecords;
use Illuminate\Database\Seeder;

class DemoTownManagerSeeder extends Seeder
{
    use BuildsDemoRecords;

    public function run(): void
    {
        $manager = $this->upsertUser(
            'manager@lokals.app',
            [
                'name' => 'Hilma Tjitemisa',
                'phone' => '+264810001001',
                'location' => 'Town Centre, Okahandja',
                'default_town' => 'Okahandja',
                'default_area' => 'Town Centre',
                'current_role' => 'town_manager',
                'whatsapp' => '+264810001001',
                'lat' => -21.9834,
                'lng' => 16.9182,
            ],
            ['town_manager'],
            [
                'bio' => 'Demo town manager account for public-service workflows and operational dashboards.',
            ],
            [
                'interests' => ['Service delivery', 'Resident feedback', 'Emergency coordination'],
            ],
        );

        $resident = $this->upsertUser(
            'resident@lokals.app',
            [
                'name' => 'Meriam Kambatuku',
                'phone' => '+264810001050',
                'location' => 'Nau-Aib, Okahandja',
                'default_town' => 'Okahandja',
                'default_area' => 'Nau-Aib',
                'current_role' => 'citizen',
                'whatsapp' => '+264810001050',
                'lat' => -21.9870,
                'lng' => 16.9112,
            ],
            ['citizen'],
            [
                'bio' => 'Demo resident used for town manager, transport, and SOS scenarios.',
            ],
            [
                'interests' => ['Town notices', 'Transport', 'Emergency updates'],
            ],
        );

        $council = $this->upsertOrganization('Okahandja Town Council', [
            'owner_user_id' => $manager->id,
            'category' => 'government',
            'subcategory' => 'municipal_office',
            'description' => 'Service desk for rates, permits, outages, public notices, and resident support.',
            'phone' => '+264610001001',
            'email' => 'manager@lokals.app',
            'whatsapp' => '+264810001001',
            'location' => 'Town Centre, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Town Centre',
            'lat' => -21.9834,
            'lng' => 16.9182,
            'is_verified' => true,
            'status' => 'active',
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Mon-Fri', 'open' => '08:00', 'close' => '17:00']],
            'services_offered' => ['Resident support', 'Permits', 'Town notices', 'Service requests'],
        ]);

        $this->upsertOrganization('Okahandja Police Station', [
            'owner_user_id' => $manager->id,
            'category' => 'public_safety',
            'subcategory' => 'police_station',
            'description' => 'Public safety contact point for incident reporting and urgent assistance.',
            'phone' => '+264610001011',
            'location' => 'Town Centre, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Town Centre',
            'lat' => -21.9830,
            'lng' => 16.9192,
            'is_verified' => true,
            'status' => 'active',
            'emergency_contact' => true,
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '00:00', 'close' => '23:59']],
            'services_offered' => ['Emergency response', 'Incident reporting'],
        ]);

        $this->upsertOrganization('Okahandja Fire and Rescue', [
            'owner_user_id' => $manager->id,
            'category' => 'emergency',
            'subcategory' => 'fire_station',
            'description' => 'Demo emergency response contact for fire and rescue incidents.',
            'phone' => '+264610001012',
            'location' => 'Town Centre, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Town Centre',
            'lat' => -21.9841,
            'lng' => 16.9198,
            'is_verified' => true,
            'status' => 'active',
            'emergency_contact' => true,
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '00:00', 'close' => '23:59']],
            'services_offered' => ['Fire response', 'Rescue support', 'Hazard dispatch'],
        ]);

        $this->upsertOrganization('Okahandja State Clinic', [
            'owner_user_id' => $manager->id,
            'category' => 'healthcare',
            'subcategory' => 'clinic',
            'description' => 'Primary healthcare, family consultations, and referral support.',
            'phone' => '+264610001013',
            'location' => 'Nau-Aib, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'lat' => -21.9864,
            'lng' => 16.9107,
            'is_verified' => true,
            'status' => 'active',
            'emergency_contact' => true,
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Mon-Fri', 'open' => '08:00', 'close' => '17:00']],
            'services_offered' => ['Primary care', 'Maternal health', 'Vaccination support'],
        ]);

        Announcement::query()->updateOrCreate(
            ['organization_id' => $council->id, 'title' => 'Resident support desk now open on Saturdays'],
            [
                'organization_id' => $council->id,
                'body' => 'The customer desk now helps with rates, account questions, and statement printing on Saturday mornings.',
                'location' => 'Town Centre, Okahandja',
                'published_at' => now()->subDays(2),
                'status' => 'published',
            ],
        );

        Announcement::query()->updateOrCreate(
            ['organization_id' => $council->id, 'title' => 'Refuse collection route update for Nau-Aib'],
            [
                'organization_id' => $council->id,
                'body' => 'Collection teams will move through Nau-Aib from 07:00 on Fridays while road patching continues.',
                'location' => 'Nau-Aib, Okahandja',
                'published_at' => now()->subDay(),
                'status' => 'published',
            ],
        );

        Alert::query()->updateOrCreate(
            ['title' => 'Planned water interruption in Nau-Aib'],
            [
                'body' => 'Maintenance teams will pause supply between 09:00 and 13:00 while a damaged valve is replaced.',
                'type' => 'service_update',
                'audience' => 'public',
                'location' => 'Nau-Aib, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'priority' => 'high',
                'starts_at' => now()->addDay()->setTime(9, 0),
                'ends_at' => now()->addDay()->setTime(13, 0),
                'is_active' => true,
                'is_public' => true,
                'created_by' => $manager->id,
                'channels' => ['in_app', 'sms'],
                'alertable_type' => Organization::class,
                'alertable_id' => $council->id,
            ],
        );

        Alert::query()->updateOrCreate(
            ['title' => 'Traffic advisory near taxi rank'],
            [
                'body' => 'Drivers should expect slower movement near the taxi rank while lighting upgrades are completed this evening.',
                'type' => 'traffic',
                'audience' => 'public',
                'location' => 'Town Centre, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Town Centre',
                'priority' => 'medium',
                'starts_at' => now()->addHours(4),
                'ends_at' => now()->addHours(10),
                'is_active' => true,
                'is_public' => true,
                'created_by' => $manager->id,
                'channels' => ['in_app'],
                'alertable_type' => Organization::class,
                'alertable_id' => $council->id,
            ],
        );

        CityReport::query()->updateOrCreate(
            ['user_id' => $resident->id, 'title' => 'Streetlight outage near Nau-Aib bus stop'],
            [
                'user_id' => $resident->id,
                'category' => 'lighting',
                'description' => 'The pole closest to the bus stop has been dark for three nights and the area feels unsafe after 19:00.',
                'location' => 'Nau-Aib bus stop',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'lat' => -21.9873,
                'lng' => 16.9105,
                'status' => 'in_progress',
                'priority' => 'high',
                'assigned_to' => $manager->id,
                'resolution_notes' => 'Electrical team scheduled for inspection on the next maintenance round.',
            ],
        );

        $taxiDriver = User::query()->where('email', 'taxi@lokals.app')->first();
        $courier = User::query()->where('email', 'courier@lokals.app')->first();
        $pharmacy = Organization::query()->where('name', 'Nau-Aib Pharmacy')->first();

        DeliveryRequest::query()->updateOrCreate(
            ['user_id' => $resident->id, 'pickup_address' => 'Nau-Aib Pharmacy'],
            [
                'user_id' => $resident->id,
                'pickup_location' => 'Nau-Aib, Okahandja',
                'dropoff_address' => 'House 18, Nau-Aib Extension 2',
                'dropoff_location' => 'Nau-Aib, Okahandja',
                'item_description' => 'Blood pressure medication refill',
                'parcel_description' => 'Small medicine packet from local pharmacy',
                'notes' => 'Please call on arrival at the gate.',
                'parcel_size' => 'small',
                'status' => 'assigned',
                'price' => 55,
                'estimated_price' => 55,
                'driver_id' => $courier?->id,
                'photo_url' => null,
            ],
        );

        RideRequest::query()->updateOrCreate(
            ['user_id' => $resident->id, 'pickup_location' => 'Nau-Aib Community Hall'],
            [
                'user_id' => $resident->id,
                'driver_id' => $taxiDriver?->id,
                'dropoff_location' => 'Okahandja Town Council',
                'ride_type' => 'local_taxi',
                'trip_purpose' => 'Council billing enquiry',
                'notes' => 'Passenger prefers pickup near the front gate.',
                'status' => 'accepted',
                'fare_estimate' => 45,
            ],
        );

        SosAlert::query()->updateOrCreate(
            ['user_id' => $resident->id, 'message' => 'Need urgent roadside help near Nau-Aib football ground'],
            [
                'user_id' => $resident->id,
                'emergency_type' => 'Vehicle breakdown',
                'location' => 'Nau-Aib football ground',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'lat' => -21.9882,
                'lng' => 16.9120,
                'status' => 'sent',
            ],
        );
    }
}
