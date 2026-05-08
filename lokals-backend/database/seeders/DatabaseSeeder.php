<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Announcement;
use App\Models\AvailabilitySlot;
use App\Models\Block;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\DeliveryRequest;
use App\Models\Event;
use App\Models\EventReminder;
use App\Models\EventSave;
use App\Models\EventTicket;
use App\Models\EventTicketType;
use App\Models\Follow;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\ModerationFlag;
use App\Models\NewsItem;
use App\Models\NewsSource;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Profile;
use App\Models\ProviderPackage;
use App\Models\PromotedListing;
use App\Models\RideRequest;
use App\Models\SavedAddress;
use App\Models\SavedItem;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\SosAlert;
use App\Models\SubscriptionPlan;
use App\Models\Accommodation;
use App\Models\User;
use App\Models\UserPreference;
use App\Models\UserSubscription;
use App\Models\WorkerProfile;
use Illuminate\Database\Seeder;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    private const ROLES = [
        'citizen',
        'worker',
        'seller',
        'business_owner',
        'driver',
        'service_provider',
        'organization_admin',
        'organization_representative',
        'town_manager',
        'municipality_admin',
        'operator',
        'super_admin',
    ];

    public function run(): void
    {
        foreach (self::ROLES as $role) {
            Role::findOrCreate($role, 'sanctum');
        }

        $superAdmin = User::query()->updateOrCreate(['email' => 'admin@lokals.test'], [
            'name' => 'Aina Shivute',
            'phone' => '+264810000001',
            'email' => 'admin@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Windhoek',
            'default_town' => 'Windhoek',
            'default_area' => 'CBD',
            'current_role' => 'super_admin',
            'lat' => -22.5609,
            'lng' => 17.0658,
        ]);
        $superAdmin->assignRole('super_admin');

        $citizen = User::query()->updateOrCreate(['email' => 'citizen@lokals.test'], [
            'name' => 'Petrina Kamati',
            'phone' => '+264810000002',
            'email' => 'citizen@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Nau-Aib, Okahandja',
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
            'current_role' => 'citizen',
            'lat' => -21.9839,
            'lng' => 16.9174,
        ]);
        $citizen->assignRole('citizen');

        $barberOwner = User::query()->updateOrCreate(['email' => 'barber@lokals.test'], [
            'name' => 'Moses Ndeitunga',
            'phone' => '+264810000003',
            'email' => 'barber@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Katutura',
            'default_town' => 'Windhoek',
            'default_area' => 'Katutura',
            'current_role' => 'service_provider',
            'lat' => -22.532,
            'lng' => 17.061,
        ]);
        $barberOwner->assignRole('service_provider');

        $doctorOwner = User::query()->updateOrCreate(['email' => 'doctor@lokals.test'], [
            'name' => 'Dr. Selma Uusiku',
            'phone' => '+264810000004',
            'email' => 'doctor@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Klein Windhoek',
            'default_town' => 'Windhoek',
            'default_area' => 'Klein Windhoek',
            'current_role' => 'seller',
            'lat' => -22.5672,
            'lng' => 17.0912,
        ]);
        $doctorOwner->assignRole(['service_provider', 'seller']);

        $mechanicOwner = User::query()->updateOrCreate(['email' => 'mechanic@lokals.test'], [
            'name' => 'Pius Garage',
            'phone' => '+264810000005',
            'email' => 'mechanic@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Northern Industrial',
            'default_town' => 'Windhoek',
            'default_area' => 'Northern Industrial',
            'current_role' => 'service_provider',
            'lat' => -22.5201,
            'lng' => 17.0648,
        ]);
        $mechanicOwner->assignRole(['service_provider', 'worker']);

        $municipalityAdmin = User::query()->updateOrCreate(['email' => 'municipality@lokals.test'], [
            'name' => 'Selma City Desk',
            'phone' => '+264810000006',
            'email' => 'municipality@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Central Okahandja',
            'default_town' => 'Okahandja',
            'default_area' => 'Central Okahandja',
            'current_role' => 'town_manager',
            'lat' => -21.9833,
            'lng' => 16.9180,
        ]);
        $municipalityAdmin->assignRole(['municipality_admin', 'town_manager']);

        $driver = User::query()->updateOrCreate(['email' => 'driver@lokals.test'], [
            'name' => 'Johanna Shuttle',
            'phone' => '+264810000009',
            'email' => 'driver@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Olympia',
            'default_town' => 'Windhoek',
            'default_area' => 'Olympia',
            'current_role' => 'driver',
            'lat' => -22.5798,
            'lng' => 17.0917,
        ]);
        $driver->assignRole('driver');

        $cleanerWorker = User::query()->updateOrCreate(['email' => 'cleaner@lokals.test'], [
            'name' => 'Maria Tjivinda',
            'phone' => '+264810000010',
            'email' => 'cleaner@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Khomasdal',
            'default_town' => 'Windhoek',
            'default_area' => 'Khomasdal',
            'current_role' => 'worker',
            'profession' => 'House cleaner',
            'whatsapp' => '+264810000010',
            'lat' => -22.5479,
            'lng' => 17.0462,
        ]);
        $cleanerWorker->assignRole('worker');

        $painterWorker = User::query()->updateOrCreate(['email' => 'painter@lokals.test'], [
            'name' => 'Johannes Haufiku',
            'phone' => '+264810000011',
            'email' => 'painter@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Klein Windhoek',
            'default_town' => 'Windhoek',
            'default_area' => 'Klein Windhoek',
            'current_role' => 'worker',
            'profession' => 'Painter',
            'whatsapp' => '+264810000011',
            'lat' => -22.5658,
            'lng' => 17.0899,
        ]);
        $painterWorker->assignRole('worker');

        $gardenerWorker = User::query()->updateOrCreate(['email' => 'gardener@lokals.test'], [
            'name' => 'Selma Nekundi',
            'phone' => '+264810000012',
            'email' => 'gardener@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Eros',
            'default_town' => 'Windhoek',
            'default_area' => 'Eros',
            'current_role' => 'worker',
            'profession' => 'Gardener',
            'whatsapp' => '+264810000012',
            'lat' => -22.5485,
            'lng' => 17.0938,
        ]);
        $gardenerWorker->assignRole('worker');

        $tutorWorker = User::query()->updateOrCreate(['email' => 'tutor@lokals.test'], [
            'name' => 'Laura Mwiya',
            'phone' => '+264810000013',
            'email' => 'tutor@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Wanaheda',
            'default_town' => 'Windhoek',
            'default_area' => 'Wanaheda',
            'current_role' => 'worker',
            'profession' => 'Tutor',
            'whatsapp' => '+264810000013',
            'lat' => -22.5294,
            'lng' => 17.0727,
        ]);
        $tutorWorker->assignRole('worker');

        foreach ([$superAdmin, $citizen, $barberOwner, $doctorOwner, $mechanicOwner, $municipalityAdmin, $driver, $cleanerWorker, $painterWorker, $gardenerWorker, $tutorWorker] as $user) {
            Profile::updateOrCreate(['user_id' => $user->id], [
                'bio' => 'LOKALS demo account',
                'location' => $user->location,
                'lat' => $user->lat,
                'lng' => $user->lng,
                'preferred_language' => 'English',
                'completed_fields' => ['name', 'phone', 'location'],
            ]);

            UserPreference::updateOrCreate(['user_id' => $user->id], [
                'default_town' => $user->default_town,
                'default_area' => $user->default_area,
                'interests' => ['Find services', 'Follow alerts'],
                'preferred_roles' => $user->getRoleNames()->values()->all(),
                'notification_preferences' => [
                    'alerts_from_followed_entities' => true,
                    'booking_updates' => true,
                    'job_updates' => true,
                    'sale_alerts' => true,
                    'city_alerts' => true,
                ],
            ]);
        }

        SavedAddress::updateOrCreate(['user_id' => $citizen->id, 'label' => 'Home'], [
            'label' => 'Home',
            'address_line' => '45 Independence Avenue',
            'city' => 'Windhoek',
            'region' => 'Khomas',
            'lat' => -22.5714,
            'lng' => 17.0839,
            'is_default' => true,
        ]);

        SavedAddress::updateOrCreate(['user_id' => $citizen->id, 'label' => 'Work'], [
            'label' => 'Work',
            'address_line' => 'NamPower Head Office, CBD',
            'city' => 'Windhoek',
            'region' => 'Khomas',
            'lat' => -22.5691,
            'lng' => 17.0832,
            'is_default' => false,
        ]);

        SavedAddress::updateOrCreate(['user_id' => $citizen->id, 'label' => 'Clinic'], [
            'label' => 'Clinic',
            'address_line' => 'Eembaxu Health Centre, Klein Windhoek',
            'city' => 'Windhoek',
            'region' => 'Khomas',
            'lat' => -22.5672,
            'lng' => 17.0912,
            'is_default' => false,
        ]);

        $clinic = Organization::updateOrCreate(['name' => 'Eembaxu Health Centre'], [
            'owner_user_id' => $doctorOwner->id,
            'name' => 'Eembaxu Health Centre',
            'category' => 'healthcare',
            'subcategory' => 'clinic',
            'description' => 'Community clinic with walk-in and appointment services.',
            'phone' => '+26461123456',
            'email' => 'clinic@lokals.test',
            'location' => 'Klein Windhoek',
            'town' => 'Windhoek',
            'area' => 'Klein Windhoek',
            'lat' => -22.5672,
            'lng' => 17.0912,
            'is_verified' => true,
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Mon-Fri', 'open' => '08:00', 'close' => '17:00']],
            'services_offered' => ['Consultations', 'Vaccinations', 'Family care'],
            'rates' => [['name' => 'Consultation', 'price' => 'N$250']],
        ]);

        $garage = Organization::updateOrCreate(['name' => 'Okapale Mechanics'], [
            'owner_user_id' => $mechanicOwner->id,
            'name' => 'Okapale Mechanics',
            'category' => 'automotive',
            'subcategory' => 'garage',
            'description' => 'Trusted mechanic shop for quick diagnostics and repairs.',
            'phone' => '+26461222333',
            'location' => 'Northern Industrial',
            'town' => 'Windhoek',
            'area' => 'Northern Industrial',
            'lat' => -22.5201,
            'lng' => 17.0648,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '18:00']],
            'services_offered' => ['Diagnostics', 'Repairs', 'Battery replacement'],
            'rates' => [['name' => 'Diagnostics', 'price' => 'N$200']],
        ]);

        $police = Organization::updateOrCreate(['name' => 'Okahandja Police Station'], [
            'name' => 'Okahandja Police Station',
            'category' => 'public_safety',
            'subcategory' => 'police_station',
            'description' => 'Public safety and reporting centre for Okahandja residents.',
            'phone' => '+264-61-000-1010 (demo)',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'lat' => -21.9830,
            'lng' => 16.9190,
            'is_verified' => true,
            'is_public_service' => true,
            'emergency_contact' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '00:00', 'close' => '23:59']],
            'services_offered' => ['Emergency response', 'Public notices', 'Reporting desk'],
        ]);

        $municipalOffice = Organization::updateOrCreate(['name' => 'Okahandja Town Council'], [
            'owner_user_id' => $municipalityAdmin->id,
            'name' => 'Okahandja Town Council',
            'category' => 'government',
            'subcategory' => 'municipal_office',
            'description' => 'Customer service desk for rates, permits, and neighbourhood service requests in Okahandja.',
            'phone' => '+264-61-000-1000 (demo)',
            'whatsapp' => '+264-81-000-1000 (demo)',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'lat' => -21.9834,
            'lng' => 16.9182,
            'is_verified' => true,
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Mon-Fri', 'open' => '08:00', 'close' => '17:00']],
            'services_offered' => ['Accounts support', 'Service requests', 'Permit queries', 'Public notices'],
        ]);

        $okahandjaClinic = Organization::updateOrCreate(['name' => 'Nau-Aib Clinic'], [
            'owner_user_id' => $doctorOwner->id,
            'name' => 'Nau-Aib Clinic',
            'category' => 'healthcare',
            'subcategory' => 'clinic',
            'description' => 'Community clinic serving families in Nau-Aib with weekday consultations and basic screenings.',
            'phone' => '+264-61-000-1020 (demo)',
            'whatsapp' => '+264-81-000-1020 (demo)',
            'location' => 'Nau-Aib',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'lat' => -21.9872,
            'lng' => 16.9108,
            'is_verified' => true,
            'is_public_service' => true,
            'emergency_contact' => true,
            'opening_hours' => [['day' => 'Mon-Fri', 'open' => '08:00', 'close' => '17:00']],
            'services_offered' => ['Primary care', 'Vaccination support', 'Health referrals'],
        ]);

        $okahandjaFire = Organization::updateOrCreate(['name' => 'Okahandja Fire & Emergency Services'], [
            'owner_user_id' => $municipalityAdmin->id,
            'name' => 'Okahandja Fire & Emergency Services',
            'category' => 'emergency',
            'subcategory' => 'fire_station',
            'description' => 'Emergency response contact for fire incidents, rescue support, and urgent municipal hazards.',
            'phone' => '+264-61-000-1030 (demo)',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'lat' => -21.9841,
            'lng' => 16.9195,
            'is_verified' => true,
            'is_public_service' => true,
            'emergency_contact' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '00:00', 'close' => '23:59']],
            'services_offered' => ['Fire response', 'Emergency dispatch', 'Hazard response'],
        ]);

        $okahandjaLibrary = Organization::updateOrCreate(['name' => 'Okahandja Library'], [
            'owner_user_id' => $municipalityAdmin->id,
            'name' => 'Okahandja Library',
            'category' => 'public_facility',
            'subcategory' => 'library',
            'description' => 'Public reading, study, and youth learning space for the wider Okahandja community.',
            'phone' => '+264-61-000-1040 (demo)',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'lat' => -21.9838,
            'lng' => 16.9172,
            'is_verified' => true,
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:30', 'close' => '17:30']],
            'services_offered' => ['Public library', 'Study desks', 'Community notices'],
        ]);

        $nauAibBarber = Organization::updateOrCreate(['name' => 'Nau-Aib Style Corner'], [
            'owner_user_id' => $barberOwner->id,
            'name' => 'Nau-Aib Style Corner',
            'category' => 'beauty',
            'subcategory' => 'barber_shop',
            'description' => 'Neighbourhood barber and grooming spot serving walk-ins and quick trims in Nau-Aib.',
            'phone' => '+264-81-000-2010 (demo)',
            'whatsapp' => '+264-81-000-2010 (demo)',
            'location' => 'Nau-Aib',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'lat' => -21.9876,
            'lng' => 16.9114,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '18:00']],
            'services_offered' => ['Haircuts', 'Beard trim', 'Kids cuts'],
            'rates' => [['name' => 'Standard cut', 'price' => 'N$60']],
        ]);

        $fiveRandPlumbing = Organization::updateOrCreate(['name' => 'Five Rand Plumbing Service'], [
            'owner_user_id' => $mechanicOwner->id,
            'name' => 'Five Rand Plumbing Service',
            'category' => 'home_services',
            'subcategory' => 'plumber',
            'description' => 'Local plumbing call-out support for leaks, blocked drains, and household repairs.',
            'phone' => '+264-81-000-2020 (demo)',
            'whatsapp' => '+264-81-000-2020 (demo)',
            'location' => 'Five Rand',
            'town' => 'Okahandja',
            'area' => 'Five Rand',
            'lat' => -21.9799,
            'lng' => 16.9234,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sat', 'open' => '07:30', 'close' => '18:00']],
            'services_offered' => ['Leak repair', 'Pipe replacement', 'Drain clearing'],
            'rates' => [['name' => 'Call-out from', 'price' => 'N$250']],
        ]);

        $industrialMechanic = Organization::updateOrCreate(['name' => 'Industrial Area Motor Works'], [
            'owner_user_id' => $mechanicOwner->id,
            'name' => 'Industrial Area Motor Works',
            'category' => 'automotive',
            'subcategory' => 'garage',
            'description' => 'Trusted workshop near the industrial area for diagnostics, servicing, and small fleet repairs.',
            'phone' => '+264-81-000-2030 (demo)',
            'whatsapp' => '+264-81-000-2030 (demo)',
            'location' => 'Okahandja Industrial Area',
            'town' => 'Okahandja',
            'area' => 'Okahandja Industrial Area',
            'lat' => -21.9729,
            'lng' => 16.9283,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '17:30']],
            'services_offered' => ['Diagnostics', 'Brake service', 'Oil change'],
            'rates' => [['name' => 'Vehicle check', 'price' => 'N$280']],
        ]);

        $osonaGarden = Organization::updateOrCreate(['name' => 'Osona Garden Service'], [
            'owner_user_id' => $gardenerWorker->id,
            'name' => 'Osona Garden Service',
            'category' => 'home_services',
            'subcategory' => 'gardener',
            'description' => 'Garden cleanups, trimming, and yard maintenance for homes around Osona and nearby areas.',
            'phone' => '+264-81-000-2040 (demo)',
            'whatsapp' => '+264-81-000-2040 (demo)',
            'location' => 'Osona',
            'town' => 'Okahandja',
            'area' => 'Osona',
            'lat' => -21.9445,
            'lng' => 16.9451,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '17:00']],
            'services_offered' => ['Lawn cleanup', 'Hedge trimming', 'Once-off garden jobs'],
            'rates' => [['name' => 'Yard cleanup from', 'price' => 'N$350']],
        ]);

        $okahandjaMiniMarket = Organization::updateOrCreate(['name' => 'Central Okahandja Mini Market'], [
            'owner_user_id' => $doctorOwner->id,
            'name' => 'Central Okahandja Mini Market',
            'category' => 'retail',
            'subcategory' => 'mini_market',
            'description' => 'Everyday household items, snacks, school basics, and quick grocery pickups in central town.',
            'phone' => '+264-81-000-2050 (demo)',
            'whatsapp' => '+264-81-000-2050 (demo)',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'lat' => -21.9836,
            'lng' => 16.9188,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sun', 'open' => '07:00', 'close' => '20:00']],
            'services_offered' => ['Groceries', 'Household goods', 'School supplies'],
        ]);

        $pharmacy = Organization::updateOrCreate(['name' => 'Khomas Care Pharmacy'], [
            'owner_user_id' => $doctorOwner->id,
            'name' => 'Khomas Care Pharmacy',
            'category' => 'healthcare',
            'subcategory' => 'pharmacy',
            'description' => 'Neighborhood pharmacy with prescriptions and everyday essentials.',
            'phone' => '+26461234567',
            'whatsapp' => '+264812345678',
            'location' => 'Eros',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'lat' => -22.5487,
            'lng' => 17.0941,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sun', 'open' => '08:00', 'close' => '21:00']],
            'services_offered' => ['Prescription pickup', 'Wellness products'],
            'rates' => [['name' => 'Cold and flu pack', 'price' => 'N$95']],
        ]);

        $school = Organization::updateOrCreate(['name' => 'Katutura Community School'], [
            'name' => 'Katutura Community School',
            'category' => 'education',
            'subcategory' => 'school',
            'description' => 'Community school serving families in Katutura.',
            'phone' => '+26461888777',
            'location' => 'Katutura',
            'town' => 'Windhoek',
            'area' => 'Katutura',
            'lat' => -22.5354,
            'lng' => 17.0578,
            'is_verified' => true,
            'is_public_service' => true,
            'opening_hours' => [['day' => 'Mon-Fri', 'open' => '07:30', 'close' => '16:00']],
            'services_offered' => ['Primary school', 'Community events'],
        ]);

        $church = Organization::updateOrCreate(['name' => 'Grace Community Church'], [
            'name' => 'Grace Community Church',
            'category' => 'faith',
            'subcategory' => 'church',
            'description' => 'Local church with youth and family programs.',
            'phone' => '+26461444555',
            'location' => 'Khomasdal',
            'town' => 'Windhoek',
            'area' => 'Khomasdal',
            'lat' => -22.5478,
            'lng' => 17.0459,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Sun', 'open' => '09:00', 'close' => '12:00']],
        ]);

        $restaurant = Organization::updateOrCreate(['name' => 'Town Square Grill'], [
            'owner_user_id' => $barberOwner->id,
            'name' => 'Town Square Grill',
            'category' => 'food',
            'subcategory' => 'restaurant',
            'description' => 'Popular local spot for grilled plates and lunch specials.',
            'phone' => '+26461999111',
            'whatsapp' => '+264819991111',
            'location' => 'Kleine Kuppe',
            'town' => 'Windhoek',
            'area' => 'Kleine Kuppe',
            'lat' => -22.5989,
            'lng' => 17.0957,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sun', 'open' => '10:00', 'close' => '22:00']],
            'services_offered' => ['Dine-in', 'Takeaway', 'Delivery'],
        ]);

        $taxiOperator = Organization::updateOrCreate(['name' => 'CityHop Taxi'], [
            'owner_user_id' => $driver->id,
            'name' => 'CityHop Taxi',
            'category' => 'transport',
            'subcategory' => 'taxi_service',
            'description' => 'Fast local taxi dispatch for school runs, airport trips, and late shifts.',
            'phone' => $driver->phone,
            'whatsapp' => '+264810000019',
            'location' => 'Olympia',
            'town' => 'Windhoek',
            'area' => 'Olympia',
            'lat' => -22.5798,
            'lng' => 17.0917,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '04:30', 'close' => '23:59']],
            'services_offered' => ['Taxi request', 'Airport transfer', 'School pickup'],
            'rates' => [['name' => 'In-town trip', 'price' => 'N$45 - N$85']],
        ]);

        $stayHost = Organization::updateOrCreate(['name' => 'NamStay Homes'], [
            'owner_user_id' => $doctorOwner->id,
            'name' => 'NamStay Homes',
            'category' => 'accommodation',
            'subcategory' => 'short_stay',
            'description' => 'Verified local short-stay host for business trips and weekend stays.',
            'phone' => '+26461199887',
            'whatsapp' => '+264811998877',
            'location' => 'Klein Windhoek',
            'town' => 'Windhoek',
            'area' => 'Klein Windhoek',
            'lat' => -22.5681,
            'lng' => 17.0908,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '07:00', 'close' => '21:00']],
            'services_offered' => ['B&B', 'Short stay', 'Airport pickup on request'],
        ]);

        $guesthouseHost = Organization::updateOrCreate(['name' => 'Eros Palm Guesthouse'], [
            'owner_user_id' => $superAdmin->id,
            'name' => 'Eros Palm Guesthouse',
            'category' => 'accommodation',
            'subcategory' => 'guesthouse',
            'description' => 'Quiet guesthouse with breakfast and trusted local host support.',
            'phone' => '+26461122334',
            'whatsapp' => '+264811223344',
            'location' => 'Eros',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'lat' => -22.5491,
            'lng' => 17.0924,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '06:00', 'close' => '22:00']],
            'services_offered' => ['Guesthouse rooms', 'Breakfast', 'Secure parking'],
        ]);

        $shop = Organization::updateOrCreate(['name' => 'Wanaheda Corner Shop'], [
            'owner_user_id' => $doctorOwner->id,
            'name' => 'Wanaheda Corner Shop',
            'category' => 'retail',
            'subcategory' => 'shop',
            'description' => 'Everyday groceries and household essentials.',
            'phone' => '+26461777123',
            'location' => 'Wanaheda',
            'town' => 'Windhoek',
            'area' => 'Wanaheda',
            'lat' => -22.5311,
            'lng' => 17.0735,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '07:00', 'close' => '20:00']],
        ]);

        $barberShop = Organization::updateOrCreate(['name' => 'FreshFade Studio'], [
            'owner_user_id' => $barberOwner->id,
            'name' => 'FreshFade Studio',
            'category' => 'beauty',
            'subcategory' => 'barber_shop',
            'description' => 'Neighborhood barbershop with quick cuts and beard trims.',
            'phone' => $barberOwner->phone,
            'location' => 'Katutura',
            'town' => 'Windhoek',
            'area' => 'Katutura',
            'lat' => -22.5320,
            'lng' => 17.0610,
            'is_verified' => true,
            'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '19:00']],
            'services_offered' => ['Haircuts', 'Beard trim', 'Kids cuts'],
            'rates' => [['name' => 'Haircut', 'price' => 'N$80']],
        ]);

        $barber = ServiceProvider::updateOrCreate(['name' => 'FreshFade Katutura'], [
            'user_id' => $barberOwner->id,
            'organization_id' => $barberShop->id,
            'name' => 'FreshFade Katutura',
            'category' => 'barber',
            'description' => 'Mobile-first barber appointments with fast turnaround.',
            'phone' => $barberOwner->phone,
            'location' => 'Katutura',
            'lat' => -22.532,
            'lng' => 17.061,
            'is_verified' => true,
        ]);

        $doctor = ServiceProvider::updateOrCreate(['name' => 'Dr. Selma Uusiku'], [
            'user_id' => $doctorOwner->id,
            'organization_id' => $clinic->id,
            'name' => 'Dr. Selma Uusiku',
            'category' => 'doctor',
            'description' => 'Primary care consultations and follow-up appointments.',
            'phone' => $doctorOwner->phone,
            'location' => 'Klein Windhoek',
            'lat' => -22.5672,
            'lng' => 17.0912,
            'is_verified' => true,
        ]);

        $mechanic = ServiceProvider::updateOrCreate(['name' => 'Pius Mobile Repairs'], [
            'user_id' => $mechanicOwner->id,
            'organization_id' => $garage->id,
            'name' => 'Pius Mobile Repairs',
            'category' => 'mechanic',
            'description' => 'On-demand minor repairs and diagnostics.',
            'phone' => $mechanicOwner->phone,
            'location' => 'Northern Industrial',
            'lat' => -22.5201,
            'lng' => 17.0648,
            'is_verified' => true,
        ]);

        $plumber = ServiceProvider::updateOrCreate(['name' => 'BlueTap Plumbing'], [
            'user_id' => $mechanicOwner->id,
            'name' => 'BlueTap Plumbing',
            'category' => 'plumber',
            'description' => 'Local plumbing support for leaks, fittings, and urgent call-outs.',
            'phone' => '+264810000007',
            'location' => 'Khomasdal',
            'lat' => -22.5478,
            'lng' => 17.0459,
            'is_verified' => true,
        ]);

        $electrician = ServiceProvider::updateOrCreate(['name' => 'BrightWire Electrical'], [
            'user_id' => $mechanicOwner->id,
            'name' => 'BrightWire Electrical',
            'category' => 'electrician',
            'description' => 'Fast electrical troubleshooting and home wiring support.',
            'phone' => '+264810000008',
            'location' => 'Eros',
            'lat' => -22.5487,
            'lng' => 17.0941,
            'is_verified' => true,
        ]);

        $cleaner = ServiceProvider::updateOrCreate(['name' => 'Maria Clean Homes'], [
            'user_id' => $cleanerWorker->id,
            'name' => 'Maria Clean Homes',
            'category' => 'cleaner',
            'description' => 'Home cleaning, ironing, and move-in refresh support with flexible weekly slots.',
            'phone' => $cleanerWorker->phone,
            'whatsapp' => $cleanerWorker->whatsapp,
            'location' => 'Khomasdal',
            'lat' => -22.5479,
            'lng' => 17.0462,
            'is_verified' => true,
        ]);

        $taxiDispatch = ServiceProvider::updateOrCreate(['name' => 'CityHop Taxi Dispatch'], [
            'user_id' => $driver->id,
            'organization_id' => $taxiOperator->id,
            'name' => 'CityHop Taxi Dispatch',
            'category' => 'transport',
            'description' => 'Local taxi request support with live dispatch-style response.',
            'phone' => $driver->phone,
            'location' => 'Olympia',
            'lat' => -22.5798,
            'lng' => 17.0917,
            'is_verified' => true,
        ]);

        $haircut = Service::updateOrCreate(['service_provider_id' => $barber->id, 'name' => 'Haircut'], [
            'organization_id' => $barberShop->id,
            'name' => 'Haircut',
            'description' => 'Standard haircut and styling.',
            'duration_minutes' => 45,
            'price' => 120,
            'price_type' => 'fixed',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        $consultation = Service::updateOrCreate(['service_provider_id' => $doctor->id, 'name' => 'Consultation'], [
            'name' => 'Consultation',
            'description' => 'General consultation with a doctor.',
            'duration_minutes' => 30,
            'price' => 350,
            'organization_id' => $clinic->id,
            'price_type' => 'fixed',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        $repair = Service::updateOrCreate(['service_provider_id' => $mechanic->id, 'name' => 'Repair'], [
            'name' => 'Repair',
            'description' => 'Vehicle inspection and minor repair booking.',
            'duration_minutes' => 60,
            'price' => 450,
            'organization_id' => $garage->id,
            'price_type' => 'from',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        Service::updateOrCreate(['service_provider_id' => $mechanic->id, 'name' => 'Diagnostics'], [
            'organization_id' => $garage->id,
            'name' => 'Diagnostics',
            'description' => 'Electrical and engine diagnostics.',
            'duration_minutes' => 40,
            'price' => 200,
            'price_type' => 'fixed',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        Service::updateOrCreate(['service_provider_id' => $plumber->id, 'name' => 'Call-out'], [
            'name' => 'Call-out',
            'description' => 'Leak assessment and repair visit.',
            'duration_minutes' => 60,
            'price' => 150,
            'price_type' => 'from',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        Service::updateOrCreate(['service_provider_id' => $electrician->id, 'name' => 'Home diagnostics'], [
            'name' => 'Home diagnostics',
            'description' => 'Electrical fault inspection and troubleshooting.',
            'duration_minutes' => 50,
            'price' => 200,
            'price_type' => 'fixed',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        Service::updateOrCreate(['service_provider_id' => $cleaner->id, 'name' => 'Home cleaning'], [
            'name' => 'Home cleaning',
            'description' => 'Once-off or recurring cleaning for flats and family homes.',
            'duration_minutes' => 120,
            'price' => 180,
            'price_type' => 'from',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        Service::updateOrCreate(['service_provider_id' => $cleaner->id, 'name' => 'Laundry and ironing'], [
            'name' => 'Laundry and ironing',
            'description' => 'Laundry wash, fold, and ironing service for busy households.',
            'duration_minutes' => 90,
            'price' => 120,
            'price_type' => 'fixed',
            'is_bookable' => true,
            'is_active' => true,
        ]);

        Service::updateOrCreate(['service_provider_id' => $taxiDispatch->id, 'name' => 'Taxi request'], [
            'organization_id' => $taxiOperator->id,
            'name' => 'Taxi request',
            'description' => 'Quick taxi pickup within Windhoek with simple point-to-point fares.',
            'duration_minutes' => 25,
            'price' => 45,
            'price_type' => 'from',
            'is_bookable' => false,
            'is_active' => true,
        ]);

        foreach ([$barber, $doctor, $mechanic, $plumber, $electrician, $cleaner] as $provider) {
            foreach ([1, 2, 3, 4, 5] as $day) {
                AvailabilitySlot::updateOrCreate([
                    'service_provider_id' => $provider->id,
                    'day_of_week' => $day,
                ], [
                    'start_time' => '08:00:00',
                    'end_time' => '17:00:00',
                    'is_available' => true,
                ]);
            }
        }

        Booking::updateOrCreate([
            'user_id' => $citizen->id,
            'service_provider_id' => $barber->id,
            'service_id' => $haircut->id,
            'booking_date' => now()->addDays(1)->toDateString(),
        ], [
            'booking_date' => now()->addDays(1)->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '10:45:00',
            'status' => 'confirmed',
            'notes' => 'Demo haircut booking',
        ]);

        Booking::updateOrCreate([
            'user_id' => $citizen->id,
            'service_provider_id' => $doctor->id,
            'service_id' => $consultation->id,
            'booking_date' => now()->addDays(2)->toDateString(),
        ], [
            'booking_date' => now()->addDays(2)->toDateString(),
            'start_time' => '09:30:00',
            'end_time' => '10:00:00',
            'status' => 'pending',
            'notes' => 'Follow-up consultation',
        ]);

        Booking::updateOrCreate([
            'user_id' => $citizen->id,
            'service_provider_id' => $plumber->id,
            'service_id' => Service::where('service_provider_id', $plumber->id)->where('name', 'Call-out')->value('id'),
            'booking_date' => now()->addDays(3)->toDateString(),
        ], [
            'booking_date' => now()->addDays(3)->toDateString(),
            'start_time' => '14:00:00',
            'end_time' => '15:00:00',
            'status' => 'pending',
            'notes' => 'Kitchen sink leak',
        ]);

        $deskListing = Listing::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Second-hand study desk'], [
            'type' => 'marketplace',
            'title' => 'Second-hand study desk',
            'description' => 'Solid wood desk, good condition.',
            'price' => 800,
            'phone' => $citizen->phone,
            'location' => 'Windhoek West',
            'status' => 'published',
        ]);

        $medicineDeliveryListing = Listing::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Same-day medicine delivery'], [
            'organization_id' => $clinic->id,
            'type' => 'delivery',
            'title' => 'Same-day medicine delivery',
            'description' => 'Medicine pickup and drop-off within Windhoek.',
            'price' => 75,
            'phone' => $doctorOwner->phone,
            'location' => 'Windhoek',
            'status' => 'published',
        ]);

        Listing::updateOrCreate(['user_id' => $barberOwner->id, 'title' => 'Kids haircut special'], [
            'organization_id' => $barberShop->id,
            'type' => 'service_offer',
            'title' => 'Kids haircut special',
            'description' => 'Saturday morning haircut special for school kids.',
            'price' => 60,
            'phone' => $barberOwner->phone,
            'location' => 'Katutura',
            'status' => 'published',
        ]);

        Listing::updateOrCreate(['user_id' => $mechanicOwner->id, 'title' => 'Battery jump-start call-out'], [
            'organization_id' => $garage->id,
            'type' => 'service_offer',
            'title' => 'Battery jump-start call-out',
            'description' => 'Quick roadside support for flat batteries in Windhoek.',
            'price' => 180,
            'phone' => $mechanicOwner->phone,
            'location' => 'Windhoek',
            'status' => 'published',
        ]);

        $receptionistJob = JobPost::updateOrCreate(['user_id' => $superAdmin->id, 'title' => 'Part-time receptionist'], [
            'organization_id' => $clinic->id,
            'title' => 'Part-time receptionist',
            'description' => 'Front desk support for weekday afternoons.',
            'employment_type' => 'part_time',
            'compensation' => 4500,
            'location' => 'Windhoek',
            'status' => 'open',
            'skills' => ['customer service', 'computer literacy'],
        ]);

        $driverAssistantJob = JobPost::updateOrCreate(['user_id' => $mechanicOwner->id, 'title' => 'Weekend driver assistant'], [
            'organization_id' => $garage->id,
            'title' => 'Weekend driver assistant',
            'description' => 'Flexible side hustle assisting with parts delivery.',
            'employment_type' => 'gig',
            'compensation' => 900,
            'location' => 'Windhoek',
            'status' => 'open',
            'skills' => ['driving', 'customer care'],
        ]);

        JobPost::updateOrCreate(['user_id' => $driver->id, 'title' => 'School route driver'], [
            'organization_id' => $taxiOperator->id,
            'title' => 'School route driver',
            'description' => 'Morning and afternoon school pickup route with trusted-family focus.',
            'employment_type' => 'contract',
            'compensation' => 6800,
            'location' => 'Windhoek',
            'status' => 'open',
            'skills' => ['safe driving', 'timekeeping', 'child-friendly service'],
        ]);

        $gardenHelperJob = JobPost::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Garden helper needed'], [
            'title' => 'Garden helper needed',
            'description' => 'One-day help with trimming, sweeping, and planting in a family yard.',
            'employment_type' => 'gig',
            'compensation' => 650,
            'location' => 'Eros',
            'status' => 'open',
            'skills' => ['gardening', 'lifting', 'reliable'],
        ]);

        $houseCleanerJob = JobPost::updateOrCreate(['user_id' => $citizen->id, 'title' => 'House cleaner needed'], [
            'title' => 'House cleaner needed',
            'description' => 'Weekly apartment cleaning help for a two-bedroom home.',
            'employment_type' => 'part_time',
            'compensation' => 180,
            'location' => 'Khomasdal',
            'status' => 'open',
            'skills' => ['cleaning', 'laundry', 'trustworthy'],
        ]);

        $painterJob = JobPost::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Painter needed for clinic refresh'], [
            'organization_id' => $clinic->id,
            'title' => 'Painter needed for clinic refresh',
            'description' => 'Two-day interior painting support for reception and consultation rooms.',
            'employment_type' => 'gig',
            'compensation' => 1350,
            'location' => 'Klein Windhoek',
            'status' => 'open',
            'skills' => ['painting', 'surface prep', 'detail-oriented'],
        ]);

        $tutorJob = JobPost::updateOrCreate(['user_id' => $superAdmin->id, 'title' => 'Math tutor for after-school support'], [
            'organization_id' => $school->id,
            'title' => 'Math tutor for after-school support',
            'description' => 'Assist Grade 8 and 9 learners with two weekly math support sessions.',
            'employment_type' => 'contract',
            'compensation' => 2200,
            'location' => 'Katutura',
            'status' => 'open',
            'skills' => ['tutoring', 'maths', 'youth support'],
        ]);

        JobPost::updateOrCreate(['user_id' => $municipalityAdmin->id, 'title' => 'Weekend market stall assistant'], [
            'organization_id' => $municipalOffice->id,
            'title' => 'Weekend market stall assistant',
            'description' => 'Help vendors with setup, directions, and attendee support during the Okahandja weekend market.',
            'employment_type' => 'gig',
            'compensation' => 550,
            'location' => 'Central Okahandja, Okahandja',
            'status' => 'open',
            'skills' => ['customer support', 'setup', 'communication'],
        ]);

        JobPost::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Need plumber for water leak repair'], [
            'organization_id' => $fiveRandPlumbing->id,
            'title' => 'Need plumber for water leak repair',
            'description' => 'Urgent help needed for a persistent yard pipe leak near Five Rand before the weekend.',
            'employment_type' => 'gig',
            'compensation' => 900,
            'location' => 'Five Rand, Okahandja',
            'status' => 'open',
            'skills' => ['plumbing', 'leak repair', 'tools'],
        ]);

        JobPost::updateOrCreate(['user_id' => $municipalityAdmin->id, 'title' => 'Delivery driver needed'], [
            'organization_id' => $okahandjaMiniMarket->id,
            'title' => 'Delivery driver needed',
            'description' => 'Short-distance local deliveries for household goods between Central Okahandja and Nau-Aib.',
            'employment_type' => 'contract',
            'compensation' => 4800,
            'location' => 'Central Okahandja, Okahandja',
            'status' => 'open',
            'skills' => ['driving', 'timekeeping', 'customer care'],
        ]);

        WorkerProfile::updateOrCreate(['user_id' => $mechanicOwner->id], [
            'headline' => 'Mechanic available for call-outs',
            'skills' => ['engine diagnostics', 'battery replacement'],
            'experience_years' => 6,
            'hourly_rate' => 180,
            'is_available' => true,
            'location' => 'Windhoek',
            'lat' => -22.5201,
            'lng' => 17.0648,
        ]);

        WorkerProfile::updateOrCreate(['user_id' => $cleanerWorker->id], [
            'headline' => 'House cleaner available for weekly or once-off jobs',
            'skills' => ['cleaning', 'laundry', 'ironing'],
            'experience_years' => 4,
            'hourly_rate' => 85,
            'is_available' => true,
            'location' => 'Khomasdal, Windhoek',
            'lat' => -22.5479,
            'lng' => 17.0462,
        ]);

        WorkerProfile::updateOrCreate(['user_id' => $painterWorker->id], [
            'headline' => 'Painter for homes, walls, and quick touch-ups',
            'skills' => ['painting', 'wall prep', 'touch-ups'],
            'experience_years' => 5,
            'hourly_rate' => 120,
            'is_available' => true,
            'location' => 'Klein Windhoek, Windhoek',
            'lat' => -22.5658,
            'lng' => 17.0899,
        ]);

        WorkerProfile::updateOrCreate(['user_id' => $gardenerWorker->id], [
            'headline' => 'Gardener for yard cleanups and monthly maintenance',
            'skills' => ['gardening', 'hedge trimming', 'cleanup'],
            'experience_years' => 3,
            'hourly_rate' => 90,
            'is_available' => true,
            'location' => 'Eros, Windhoek',
            'lat' => -22.5485,
            'lng' => 17.0938,
        ]);

        WorkerProfile::updateOrCreate(['user_id' => $driver->id], [
            'headline' => 'Driver available for school runs and local deliveries',
            'skills' => ['driving', 'deliveries', 'school transport'],
            'experience_years' => 7,
            'hourly_rate' => 110,
            'is_available' => true,
            'location' => 'Olympia, Windhoek',
            'lat' => -22.5798,
            'lng' => 17.0917,
        ]);

        WorkerProfile::updateOrCreate(['user_id' => $tutorWorker->id], [
            'headline' => 'Tutor for homework support and exam revision',
            'skills' => ['tutoring', 'maths', 'english'],
            'experience_years' => 4,
            'hourly_rate' => 140,
            'is_available' => true,
            'location' => 'Wanaheda, Windhoek',
            'lat' => -22.5294,
            'lng' => 17.0727,
        ]);

        Alert::updateOrCreate(['title' => 'Water outage notice'], [
            'title' => 'Water outage notice',
            'body' => 'Scheduled pipe maintenance will affect households near Nau-Aib from 07:00 to 11:00 tomorrow.',
            'type' => 'public_notice',
            'audience' => 'all',
            'location' => 'Nau-Aib, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'priority' => 'medium',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
            'is_active' => true,
            'created_by' => $municipalityAdmin->id,
            'is_public' => true,
        ]);

        Alert::updateOrCreate(['title' => 'Storm advisory'], [
            'title' => 'Storm advisory',
            'body' => 'Strong winds expected in coastal areas. Avoid unnecessary travel.',
            'type' => 'weather',
            'audience' => 'all',
            'location' => 'Swakopmund',
            'priority' => 'medium',
            'starts_at' => now(),
            'ends_at' => now()->addHours(12),
            'is_active' => true,
        ]);

        Alert::updateOrCreate(['title' => 'Taxi demand surge tonight'], [
            'title' => 'Taxi demand surge tonight',
            'body' => 'Expect slower pickup times after 19:00 near CBD and Klein Windhoek.',
            'type' => 'transport',
            'audience' => 'all',
            'location' => 'Windhoek',
            'priority' => 'medium',
            'starts_at' => now(),
            'ends_at' => now()->addHours(8),
            'is_active' => true,
        ]);

        Alert::updateOrCreate(['title' => 'Clinic vaccination queue advisory'], [
            'title' => 'Clinic vaccination queue advisory',
            'body' => 'Expect longer walk-in waits at family vaccination desks between 10:00 and 12:00.',
            'type' => 'health',
            'audience' => 'all',
            'location' => 'Klein Windhoek',
            'priority' => 'medium',
            'starts_at' => now(),
            'ends_at' => now()->addHours(6),
            'is_active' => true,
        ]);

        Alert::updateOrCreate(['title' => 'Police public safety notice'], [
            'title' => 'Police public safety notice',
            'body' => 'Residents are advised to use well-lit pickup points after late events around the CBD.',
            'type' => 'public_notice',
            'audience' => 'all',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'priority' => 'high',
            'starts_at' => now(),
            'ends_at' => now()->addHours(10),
            'is_active' => true,
            'created_by' => $municipalityAdmin->id,
            'is_public' => true,
        ]);

        Alert::updateOrCreate(['title' => 'Road closure'], [
            'title' => 'Road closure',
            'body' => 'A section near Gross Barmen Road is reduced to one lane while crews repair road damage near the town entrance.',
            'type' => 'service_update',
            'audience' => 'all',
            'location' => 'Gross Barmen Road Area, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Gross Barmen Road Area',
            'priority' => 'medium',
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDays(2),
            'is_active' => true,
            'created_by' => $municipalityAdmin->id,
            'is_public' => true,
        ]);

        Alert::updateOrCreate(['title' => 'Public notice'], [
            'title' => 'Public notice',
            'body' => 'Residents are reminded to settle council accounts before month-end cut-off dates.',
            'type' => 'public_notice',
            'audience' => 'all',
            'location' => 'Okahandja Town Council',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'priority' => 'low',
            'starts_at' => now(),
            'ends_at' => now()->addHours(24),
            'is_active' => true,
            'created_by' => $municipalityAdmin->id,
            'is_public' => true,
        ]);

        Announcement::updateOrCreate(['organization_id' => $clinic->id, 'title' => 'Saturday walk-in clinic'], [
            'title' => 'Saturday walk-in clinic',
            'body' => 'Walk-ins open from 08:00 to 13:00 this weekend.',
            'location' => 'Klein Windhoek',
            'published_at' => now(),
            'status' => 'published',
        ]);

        Announcement::updateOrCreate(['organization_id' => $police->id, 'title' => 'Road closure notice'], [
            'title' => 'Road closure notice',
            'body' => 'Temporary road closure near Independence Avenue due to maintenance.',
            'location' => 'CBD',
            'published_at' => now()->subHours(2),
            'status' => 'published',
        ]);

        Announcement::updateOrCreate(['organization_id' => $pharmacy->id, 'title' => 'Weekend wellness sale'], [
            'title' => 'Weekend wellness sale',
            'body' => 'Save on family health essentials this weekend.',
            'location' => 'Eros',
            'published_at' => now()->subHours(6),
            'status' => 'published',
        ]);

        Announcement::updateOrCreate(['organization_id' => $school->id, 'title' => 'School open day reminder'], [
            'title' => 'School open day reminder',
            'body' => 'Parents are invited to tour classrooms and meet teachers this Friday morning.',
            'location' => 'Wanaheda',
            'published_at' => now()->subHours(3),
            'status' => 'published',
        ]);

        Announcement::updateOrCreate(['organization_id' => $restaurant->id, 'title' => 'Food festival vendor offers live now'], [
            'title' => 'Food festival vendor offers live now',
            'body' => 'Local food vendors have opened pre-orders and tasting bundles for the weekend festival.',
            'location' => 'Kleine Kuppe',
            'published_at' => now()->subHours(4),
            'status' => 'published',
        ]);

        $namibian = NewsSource::updateOrCreate(['website_url' => 'https://www.namibian.com.na'], [
            'name' => 'The Namibian',
            'feed_url' => 'https://www.namibian.com.na/feed/',
            'source_type' => 'publication',
            'region' => 'National',
            'is_active' => true,
        ]);

        $newEra = NewsSource::updateOrCreate(['website_url' => 'https://neweralive.na'], [
            'name' => 'New Era',
            'feed_url' => 'https://neweralive.na/feed/',
            'source_type' => 'publication',
            'region' => 'National',
            'is_active' => true,
        ]);

        $windhoekMunicipality = NewsSource::updateOrCreate(['website_url' => 'https://www.windhoekcc.org.na'], [
            'name' => 'City of Windhoek',
            'feed_url' => null,
            'source_type' => 'municipality',
            'town' => 'Windhoek',
            'region' => 'Khomas',
            'is_active' => true,
        ]);

        $clinicSource = NewsSource::updateOrCreate(['website_url' => 'https://eembaxu.example.org'], [
            'name' => 'Eembaxu Health Centre',
            'source_type' => 'organization',
            'town' => 'Windhoek',
            'region' => 'Khomas',
            'is_active' => true,
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://www.namibian.com.na/local-businesses-prepare-for-winter-demand'], [
            'news_source_id' => $namibian->id,
            'title' => 'Local businesses prepare for winter demand in Windhoek',
            'summary' => 'Retailers, clinics, and service providers are adjusting opening hours and stock levels ahead of colder mornings and stronger commuter demand.',
            'source_name' => 'The Namibian',
            'source_url' => 'https://www.namibian.com.na',
            'image_url' => null,
            'category' => 'business',
            'town' => 'Windhoek',
            'area' => 'CBD',
            'region' => 'Khomas',
            'tags' => ['business', 'windhoek', 'retail'],
            'published_at' => now()->subHours(3),
            'fetched_at' => now(),
            'source_type' => 'publication',
            'is_featured' => true,
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://neweralive.na/posts/community-clinics-expand-weekend-support'], [
            'news_source_id' => $newEra->id,
            'title' => 'Community clinics expand weekend support',
            'summary' => 'Health teams are extending weekend consultation windows in parts of Windhoek to reduce weekday queues and improve family access.',
            'source_name' => 'New Era',
            'source_url' => 'https://neweralive.na',
            'image_url' => null,
            'category' => 'health',
            'town' => 'Windhoek',
            'area' => 'Klein Windhoek',
            'region' => 'Khomas',
            'tags' => ['health', 'clinic', 'weekend care'],
            'published_at' => now()->subHours(6),
            'fetched_at' => now(),
            'source_type' => 'publication',
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://www.windhoekcc.org.na/notices/water-maintenance-update'], [
            'news_source_id' => $windhoekMunicipality->id,
            'title' => 'Public notice from Okahandja Town Council',
            'summary' => 'The council has shared revised service windows for planned maintenance affecting Nau-Aib and nearby neighbourhoods.',
            'source_name' => 'Okahandja Town Council',
            'source_url' => 'https://www.windhoekcc.org.na',
            'image_url' => null,
            'category' => 'government',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'region' => 'Otjozondjupa',
            'tags' => ['municipality', 'water', 'maintenance', 'okahandja'],
            'published_at' => now()->subHours(2),
            'fetched_at' => now(),
            'source_type' => 'municipality',
            'is_featured' => true,
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://eembaxu.example.org/updates/family-vaccination-day'], [
            'news_source_id' => $clinicSource->id,
            'title' => 'Eembaxu Health Centre announces family vaccination day',
            'summary' => 'The clinic is preparing an extra family-focused vaccination session with faster walk-in support and guidance for parents.',
            'source_name' => 'Eembaxu Health Centre',
            'source_url' => 'https://eembaxu.example.org',
            'image_url' => null,
            'category' => 'health',
            'town' => 'Windhoek',
            'area' => 'Klein Windhoek',
            'region' => 'Khomas',
            'tags' => ['clinic', 'vaccination', 'family health'],
            'published_at' => now()->subHours(10),
            'fetched_at' => now(),
            'source_type' => 'organization',
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://www.namibian.com.na/taxi-operators-report-late-evening-demand-growth'], [
            'news_source_id' => $namibian->id,
            'title' => 'Taxi operators report higher late-evening demand across the city',
            'summary' => 'Local transport operators say school pickups, shift changes, and weekend movement are pushing up evening trip demand around CBD and Klein Windhoek.',
            'source_name' => 'The Namibian',
            'source_url' => 'https://www.namibian.com.na',
            'image_url' => null,
            'category' => 'transport',
            'town' => 'Windhoek',
            'area' => 'Olympia',
            'region' => 'Khomas',
            'tags' => ['transport', 'taxi', 'commute'],
            'published_at' => now()->subHours(14),
            'fetched_at' => now(),
            'source_type' => 'publication',
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://neweralive.na/posts/community-sports-program-extends-weekend-training'], [
            'news_source_id' => $newEra->id,
            'title' => 'Community sports program extends weekend training in Khomasdal',
            'summary' => 'Weekend youth training sessions are expanding to support more community teams ahead of the winter league fixtures.',
            'source_name' => 'New Era',
            'source_url' => 'https://neweralive.na',
            'image_url' => null,
            'category' => 'sports',
            'town' => 'Windhoek',
            'area' => 'Khomasdal',
            'region' => 'Khomas',
            'tags' => ['sports', 'community', 'youth'],
            'published_at' => now()->subHours(5),
            'fetched_at' => now(),
            'source_type' => 'publication',
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://www.windhoekcc.org.na/notices/school-enrolment-open-day'], [
            'news_source_id' => $windhoekMunicipality->id,
            'title' => 'City schools prepare for community open-day enrolment support',
            'summary' => 'Municipal partners are coordinating open-day guidance for families preparing school applications and local enrolment questions.',
            'source_name' => 'City of Windhoek',
            'source_url' => 'https://www.windhoekcc.org.na',
            'image_url' => null,
            'category' => 'education',
            'town' => 'Windhoek',
            'area' => 'Wanaheda',
            'region' => 'Khomas',
            'tags' => ['education', 'school', 'public notice'],
            'published_at' => now()->subHours(8),
            'fetched_at' => now(),
            'source_type' => 'municipality',
        ]);

        NewsItem::updateOrCreate(['external_url' => 'https://www.namibian.com.na/property-demand-rises-near-city-centre-services'], [
            'news_source_id' => $namibian->id,
            'title' => 'Property demand rises near city-centre services and commuter routes',
            'summary' => 'Local agents report stronger interest in homes closer to transport routes, clinics, and shopping nodes.',
            'source_name' => 'The Namibian',
            'source_url' => 'https://www.namibian.com.na',
            'image_url' => null,
            'category' => 'property',
            'town' => 'Windhoek',
            'area' => 'CBD',
            'region' => 'Khomas',
            'tags' => ['property', 'housing', 'windhoek'],
            'published_at' => now()->subHours(11),
            'fetched_at' => now(),
            'source_type' => 'publication',
        ]);

        $report = CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Pothole on main road'], [
            'category' => 'roads',
            'title' => 'Pothole on main road',
            'description' => 'Large pothole near Five Rand is forcing cars into oncoming traffic.',
            'location' => 'Five Rand, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Five Rand',
            'lat' => -21.9853,
            'lng' => 16.9211,
            'status' => 'in_progress',
            'priority' => 'medium',
            'assigned_to' => $municipalityAdmin->id,
            'resolution_notes' => 'Roads team has logged this for the next patching round.',
        ]);

        CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Water leak near Nau-Aib'], [
            'category' => 'water',
            'title' => 'Water leak near Nau-Aib',
            'description' => 'A burst pipe has been running since dawn and water is flowing down the street.',
            'location' => 'Nau-Aib, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'lat' => -21.9839,
            'lng' => 16.9174,
            'status' => 'open',
            'priority' => 'high',
        ]);

        CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Electricity outage'], [
            'category' => 'electricity',
            'title' => 'Electricity outage',
            'description' => 'Homes in Central Okahandja keep losing power after repeated transformer trips.',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'lat' => -21.9833,
            'lng' => 16.9180,
            'status' => 'open',
            'priority' => 'medium',
        ]);

        CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Waste collection issue'], [
            'category' => 'waste',
            'title' => 'Waste collection issue',
            'description' => 'Refuse bags have piled up outside our block since Tuesday and need pickup.',
            'location' => 'Veddersdal, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Veddersdal',
            'status' => 'open',
            'priority' => 'medium',
        ]);

        CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Streetlight not working in Central Okahandja'], [
            'category' => 'electricity',
            'title' => 'Streetlight not working in Central Okahandja',
            'description' => 'A streetlight near the taxi stop has been out for several nights.',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'status' => 'resolved',
            'priority' => 'low',
            'assigned_to' => $municipalityAdmin->id,
            'resolution_notes' => 'Electrical team replaced the fitting.',
        ]);

        CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Illegal dumping near Industrial Area'], [
            'category' => 'waste',
            'title' => 'Illegal dumping near Industrial Area',
            'description' => 'Construction rubble and refuse are building up near the industrial area.',
            'location' => 'Okahandja Industrial Area',
            'town' => 'Okahandja',
            'area' => 'Okahandja Industrial Area',
            'status' => 'open',
            'priority' => 'high',
        ]);

        CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Traffic safety concern near school area'], [
            'category' => 'safety',
            'title' => 'Traffic safety concern near school area',
            'description' => 'Drivers are speeding during learner pickup time and residents need calming measures.',
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'status' => 'open',
            'priority' => 'high',
        ]);


        JobApplication::updateOrCreate([
            'job_post_id' => $receptionistJob->id,
            'user_id' => $citizen->id,
        ], [
            'message' => 'I have front-desk experience and can start immediately.',
            'status' => 'submitted',
        ]);

        JobApplication::updateOrCreate([
            'job_post_id' => $gardenHelperJob->id,
            'user_id' => $gardenerWorker->id,
        ], [
            'message' => 'I have my own tools for garden cleanups and can start this weekend.',
            'status' => 'submitted',
        ]);

        JobApplication::updateOrCreate([
            'job_post_id' => $houseCleanerJob->id,
            'user_id' => $cleanerWorker->id,
        ], [
            'message' => 'I am available for weekly cleaning and can bring my own supplies if needed.',
            'status' => 'submitted',
        ]);

        JobApplication::updateOrCreate([
            'job_post_id' => $painterJob->id,
            'user_id' => $painterWorker->id,
        ], [
            'message' => 'I can take on the clinic refresh and work around your preferred schedule.',
            'status' => 'submitted',
        ]);

        JobApplication::updateOrCreate([
            'job_post_id' => $tutorJob->id,
            'user_id' => $tutorWorker->id,
        ], [
            'message' => 'I have after-school tutoring experience and can support both revision and homework sessions.',
            'status' => 'submitted',
        ]);

        ModerationFlag::updateOrCreate([
            'user_id' => $citizen->id,
            'flaggable_type' => Listing::class,
            'flaggable_id' => $deskListing->id,
        ], [
            'reason' => 'Duplicate listing',
            'details' => 'Looks similar to another desk post.',
            'status' => 'pending',
        ]);

        Block::updateOrCreate([
            'user_id' => $citizen->id,
            'blocked_user_id' => $mechanicOwner->id,
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Family First Aid Kit'], [
            'business_id' => $pharmacy->id,
            'title' => 'Family First Aid Kit',
            'description' => 'Stocked home first aid kit for everyday emergencies.',
            'price' => 420,
            'sale_price' => 360,
            'category' => 'health',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'stock_status' => 'in_stock',
            'status' => 'published',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Cooking Gas Refill'], [
            'business_id' => $shop->id,
            'title' => 'Cooking Gas Refill',
            'description' => 'Affordable household gas refill ready for pickup.',
            'price' => 280,
            'category' => 'home',
            'town' => 'Windhoek',
            'area' => 'Wanaheda',
            'stock_status' => 'in_stock',
            'status' => 'published',
        ]);

        Product::updateOrCreate(['user_id' => $barberOwner->id, 'title' => 'Lunch Combo Voucher'], [
            'business_id' => $restaurant->id,
            'title' => 'Lunch Combo Voucher',
            'description' => 'Discounted lunch combo for weekday pickup.',
            'price' => 95,
            'sale_price' => 75,
            'category' => 'food',
            'town' => 'Windhoek',
            'area' => 'Kleine Kuppe',
            'stock_status' => 'limited',
            'status' => 'published',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Baby care starter pack'], [
            'business_id' => $pharmacy->id,
            'title' => 'Baby care starter pack',
            'description' => 'Daily baby essentials bundled for new parents.',
            'price' => 310,
            'sale_price' => 285,
            'category' => 'family',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'stock_status' => 'in_stock',
            'status' => 'published',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Fresh bread and milk combo'], [
            'business_id' => $shop->id,
            'title' => 'Fresh bread and milk combo',
            'description' => 'Morning staple combo for quick household shopping.',
            'price' => 58,
            'category' => 'groceries',
            'town' => 'Windhoek',
            'area' => 'Wanaheda',
            'stock_status' => 'in_stock',
            'status' => 'published',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Samsung A15'], [
            'business_id' => $pharmacy->id,
            'title' => 'Samsung A15',
            'description' => 'Unlocked smartphone with solid battery life and a clean screen.',
            'price' => 3200,
            'sale_price' => 2899,
            'category' => 'electronics',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'stock_status' => 'limited',
            'status' => 'published',
            'image_path' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => '3-Seater Lounge Couch'], [
            'business_id' => $shop->id,
            'title' => '3-Seater Lounge Couch',
            'description' => 'Comfortable family couch in charcoal fabric, ideal for home living rooms.',
            'price' => 6800,
            'category' => 'home',
            'town' => 'Windhoek',
            'area' => 'Wanaheda',
            'stock_status' => 'in_stock',
            'status' => 'published',
            'image_path' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        ]);

        Product::updateOrCreate(['user_id' => $barberOwner->id, 'title' => 'Toyota Hilux 2018'], [
            'business_id' => $restaurant->id,
            'title' => 'Toyota Hilux 2018',
            'description' => 'Well-kept pickup with service history and strong local road performance.',
            'price' => 285000,
            'category' => 'vehicles',
            'town' => 'Windhoek',
            'area' => 'Kleine Kuppe',
            'stock_status' => 'in_stock',
            'status' => 'published',
            'image_path' => 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
        ]);

        Product::updateOrCreate(['user_id' => $barberOwner->id, 'title' => 'Tailored Denim Jacket'], [
            'business_id' => $shop->id,
            'title' => 'Tailored Denim Jacket',
            'description' => 'Locally sourced denim jacket with a clean casual fit.',
            'price' => 780,
            'sale_price' => 650,
            'category' => 'clothing',
            'town' => 'Windhoek',
            'area' => 'Katutura',
            'stock_status' => 'in_stock',
            'status' => 'published',
            'image_path' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Local vegetables basket'], [
            'business_id' => $okahandjaMiniMarket->id,
            'title' => 'Local vegetables basket',
            'description' => 'Fresh mixed basket with tomatoes, onions, spinach, and potatoes for household cooking.',
            'price' => 120,
            'category' => 'groceries',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'stock_status' => 'in_stock',
            'status' => 'published',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Phone accessories combo'], [
            'business_id' => $okahandjaMiniMarket->id,
            'title' => 'Phone accessories combo',
            'description' => 'Charger, earphones, and phone cover bundle for quick replacement needs.',
            'price' => 180,
            'sale_price' => 150,
            'category' => 'electronics',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'stock_status' => 'limited',
            'status' => 'published',
        ]);

        Product::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Building materials starter pack'], [
            'business_id' => $industrialMechanic->id,
            'title' => 'Building materials starter pack',
            'description' => 'Small builder pack with cement, nails, and basic repair essentials for home maintenance.',
            'price' => 460,
            'category' => 'building',
            'town' => 'Okahandja',
            'area' => 'Okahandja Industrial Area',
            'stock_status' => 'in_stock',
            'status' => 'published',
        ]);

        DeliveryRequest::updateOrCreate([
            'user_id' => $citizen->id,
            'pickup_location' => 'Khomasdal',
            'dropoff_location' => 'Klein Windhoek',
        ], [
            'pickup_address' => 'Khomasdal taxi rank',
            'dropoff_address' => 'Klein Windhoek clinic',
            'item_description' => 'Documents envelope',
            'parcel_description' => 'Documents envelope',
            'notes' => 'Collect from reception desk before 10:00.',
            'parcel_size' => 'small',
            'estimated_price' => 55,
            'status' => 'requested',
        ]);

        DeliveryRequest::updateOrCreate([
            'user_id' => $doctorOwner->id,
            'pickup_location' => 'Eros',
            'dropoff_location' => 'Katutura',
        ], [
            'pickup_address' => 'Khomas Care Pharmacy',
            'dropoff_address' => 'Katutura community hall',
            'item_description' => 'Medicine parcel',
            'parcel_description' => 'Medicine parcel',
            'notes' => 'Keep upright and call on arrival.',
            'parcel_size' => 'medium',
            'estimated_price' => 85,
            'status' => 'picked_up',
        ]);

        DeliveryRequest::updateOrCreate([
            'user_id' => $citizen->id,
            'pickup_location' => 'Olympia',
            'dropoff_location' => 'Eros',
        ], [
            'pickup_address' => 'Olympia family home',
            'dropoff_address' => 'Khomas Care Pharmacy',
            'item_description' => 'Prescription card and ID copy',
            'parcel_description' => 'Prescription card and ID copy',
            'notes' => 'Delivered to pharmacy front desk.',
            'parcel_size' => 'small',
            'estimated_price' => 45,
            'status' => 'delivered',
        ]);

        DeliveryRequest::updateOrCreate([
            'user_id' => $citizen->id,
            'pickup_location' => 'Windhoek CBD',
            'dropoff_location' => 'Khomasdal',
        ], [
            'pickup_address' => 'Zoo Park taxi side',
            'dropoff_address' => 'Khomasdal community office',
            'item_description' => 'Community documents parcel',
            'parcel_description' => 'Community documents parcel',
            'notes' => 'Call before drop-off.',
            'parcel_size' => 'medium',
            'estimated_price' => 68,
            'status' => 'accepted',
            'driver_id' => $driver->id,
        ]);

        RideRequest::updateOrCreate([
            'user_id' => $citizen->id,
            'pickup_location' => 'Khomasdal',
            'dropoff_location' => 'Windhoek CBD',
        ], [
            'driver_id' => $driver->id,
            'ride_type' => 'Standard',
            'trip_purpose' => 'Daily commute',
            'notes' => 'Pickup near taxi rank entrance.',
            'fare_estimate' => 38,
            'status' => 'requested',
        ]);

        RideRequest::updateOrCreate([
            'user_id' => $doctorOwner->id,
            'pickup_location' => 'Klein Windhoek',
            'dropoff_location' => 'Eros',
        ], [
            'driver_id' => $driver->id,
            'ride_type' => 'Comfort',
            'trip_purpose' => 'Clinic visit',
            'notes' => 'Call when arriving at the pharmacy.',
            'fare_estimate' => 32,
            'status' => 'completed',
        ]);

        RideRequest::updateOrCreate([
            'user_id' => $citizen->id,
            'pickup_location' => 'Katutura',
            'dropoff_location' => 'Hosea Kutako International Airport',
        ], [
            'driver_id' => $driver->id,
            'ride_type' => 'XL',
            'trip_purpose' => 'Airport trip',
            'notes' => 'Three passengers with luggage.',
            'fare_estimate' => 220,
            'status' => 'accepted',
        ]);

        RideRequest::updateOrCreate([
            'user_id' => $citizen->id,
            'pickup_location' => 'Windhoek CBD',
            'dropoff_location' => 'Olympia',
        ], [
            'driver_id' => $driver->id,
            'ride_type' => 'Standard',
            'trip_purpose' => 'Late shift ride',
            'notes' => 'Pickup outside the office entrance.',
            'fare_estimate' => 52,
            'status' => 'in_progress',
        ]);

        RideRequest::updateOrCreate([
            'user_id' => $doctorOwner->id,
            'pickup_location' => 'Eros',
            'dropoff_location' => 'Windhoek CBD',
        ], [
            'driver_id' => $driver->id,
            'ride_type' => 'Comfort',
            'trip_purpose' => 'Business trip',
            'notes' => 'Cancelled after schedule change.',
            'fare_estimate' => 44,
            'status' => 'cancelled',
        ]);

        Accommodation::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Klein Windhoek Garden B&B'], [
            'business_id' => $stayHost->id,
            'type' => 'bnb',
            'title' => 'Klein Windhoek Garden B&B',
            'description' => 'Quiet short stay with breakfast and secure parking.',
            'price' => 980,
            'price_period' => 'night',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'location' => 'Klein Windhoek',
            'town' => 'Windhoek',
            'area' => 'Klein Windhoek',
            'lat' => -22.5681,
            'lng' => 17.0908,
            'image_path' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Breakfast', 'Parking', 'Wi-Fi'], 'rules' => ['No smoking'], 'availability' => 'Available this week'],
        ]);

        Accommodation::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Otjomuise Two-Bedroom Flat'], [
            'type' => 'rental',
            'title' => 'Otjomuise Two-Bedroom Flat',
            'description' => 'Clean two-bedroom flat close to taxis and shops.',
            'price' => 6200,
            'price_period' => 'month',
            'bedrooms' => 2,
            'bathrooms' => 1,
            'location' => 'Otjomuise',
            'town' => 'Windhoek',
            'area' => 'Otjomuise',
            'lat' => -22.5864,
            'lng' => 17.0357,
            'image_path' => 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Parking', 'Water included', 'Taxi route nearby'], 'availability' => 'Available from next month'],
        ]);

        Accommodation::updateOrCreate(['user_id' => $superAdmin->id, 'title' => 'Family House in Eros'], [
            'type' => 'property_sale',
            'title' => 'Family House in Eros',
            'description' => 'Spacious family home with yard and secure boundary wall.',
            'price' => 1850000,
            'price_period' => 'once',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'location' => 'Eros',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'lat' => -22.5512,
            'lng' => 17.0903,
            'image_path' => 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Garage', 'Garden', 'Boundary wall'], 'availability' => 'Viewing by appointment'],
        ]);

        Accommodation::updateOrCreate(['user_id' => $barberOwner->id, 'title' => 'Katutura Host Room'], [
            'type' => 'guest_room',
            'title' => 'Katutura Host Room',
            'description' => 'Affordable overnight room close to taxis and food spots.',
            'price' => 420,
            'price_period' => 'night',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'location' => 'Katutura',
            'town' => 'Windhoek',
            'area' => 'Katutura',
            'lat' => -22.5330,
            'lng' => 17.0598,
            'image_path' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Wi-Fi', 'Taxi access', 'Hot shower'], 'rules' => ['Quiet after 22:00']],
        ]);

        Accommodation::updateOrCreate(['user_id' => $superAdmin->id, 'title' => 'Eros Palm Guesthouse Suite'], [
            'business_id' => $guesthouseHost->id,
            'type' => 'guesthouse',
            'title' => 'Eros Palm Guesthouse Suite',
            'description' => 'Calm guesthouse suite with breakfast, Wi-Fi, and garden seating.',
            'price' => 1250,
            'price_period' => 'night',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'location' => 'Eros',
            'town' => 'Windhoek',
            'area' => 'Eros',
            'lat' => -22.5491,
            'lng' => 17.0924,
            'image_path' => 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Breakfast', 'Wi-Fi', 'Secure parking'], 'rules' => ['No parties'], 'availability' => '2 rooms left this weekend'],
        ]);

        Accommodation::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'CBD Business Short Stay Loft'], [
            'business_id' => $stayHost->id,
            'type' => 'short_stay',
            'title' => 'CBD Business Short Stay Loft',
            'description' => 'Central short-stay loft for work trips with flexible check-in.',
            'price' => 1450,
            'price_period' => 'night',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'location' => 'CBD',
            'town' => 'Windhoek',
            'area' => 'CBD',
            'lat' => -22.5705,
            'lng' => 17.0834,
            'image_path' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Wi-Fi', 'Desk', 'Self check-in'], 'rules' => ['No smoking'], 'availability' => 'Available tomorrow'],
        ]);

        Accommodation::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Room to rent in Nau-Aib'], [
            'type' => 'guest_room',
            'title' => 'Room to rent in Nau-Aib',
            'description' => 'Affordable furnished room with separate entrance and shared kitchen access.',
            'price' => 2800,
            'price_period' => 'month',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'location' => 'Nau-Aib',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'lat' => -21.9869,
            'lng' => 16.9111,
            'image_path' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Water included', 'Wardrobe', 'Taxi access'], 'availability' => 'Available now'],
        ]);

        Accommodation::updateOrCreate(['user_id' => $municipalityAdmin->id, 'title' => 'Flat to rent in Central Okahandja'], [
            'business_id' => $municipalOffice->id,
            'type' => 'rental',
            'title' => 'Flat to rent in Central Okahandja',
            'description' => 'Central one-bedroom flat close to town services, taxis, and shopping stops.',
            'price' => 5200,
            'price_period' => 'month',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'location' => 'Central Okahandja',
            'town' => 'Okahandja',
            'area' => 'Central Okahandja',
            'lat' => -21.9835,
            'lng' => 16.9186,
            'image_path' => 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Parking', 'Water included', 'Walking distance to town'], 'availability' => 'Move in this month'],
        ]);

        Accommodation::updateOrCreate(['user_id' => $superAdmin->id, 'title' => 'Guesthouse in Okahandja Park'], [
            'type' => 'guesthouse',
            'title' => 'Guesthouse in Okahandja Park',
            'description' => 'Quiet guesthouse stay near the park area with breakfast and secure parking.',
            'price' => 950,
            'price_period' => 'night',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'location' => 'Okahandja Park',
            'town' => 'Okahandja',
            'area' => 'Okahandja Park',
            'lat' => -21.9786,
            'lng' => 16.9144,
            'image_path' => 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
            'status' => 'published',
            'metadata' => ['amenities' => ['Breakfast', 'Wi-Fi', 'Secure parking'], 'availability' => '2 rooms available'],
        ]);

        $savedProduct = Product::query()->where('title', 'Samsung A15')->first();
        $savedAccommodation = Accommodation::query()->where('title', 'Klein Windhoek Garden B&B')->first();

        if ($savedProduct) {
            SavedItem::updateOrCreate([
                'user_id' => $citizen->id,
                'saveable_type' => Product::class,
                'saveable_id' => $savedProduct->id,
            ]);
        }

        if ($savedAccommodation) {
            SavedItem::updateOrCreate([
                'user_id' => $citizen->id,
                'saveable_type' => Accommodation::class,
                'saveable_id' => $savedAccommodation->id,
            ]);
        }

        $eventSeedData = [
            [
                'title' => 'Weekend Market in Windhoek CBD',
                'category' => 'market',
                'organizer_type' => Organization::class,
                'organizer_id' => $restaurant->id,
                'created_by' => $barberOwner->id,
                'description' => 'Fresh produce, handmade goods, and local food stalls in the city center.',
                'venue_name' => 'Post Street Mall',
                'location' => 'Windhoek CBD',
                'town' => 'Windhoek',
                'area' => 'CBD',
                'lat' => -22.5697,
                'lng' => 17.0832,
                'starts_at' => now()->next('Saturday')->setTime(9, 0),
                'ends_at' => now()->next('Saturday')->setTime(15, 0),
                'image_url' => 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => false,
                'capacity' => 350,
                'metadata' => ['highlights' => ['Fresh food', 'Family-friendly', 'Local makers']],
                'is_featured' => true,
            ],
            [
                'title' => 'Youth Skills Workshop in Katutura',
                'category' => 'training',
                'organizer_type' => Organization::class,
                'organizer_id' => $school->id,
                'created_by' => $superAdmin->id,
                'description' => 'A practical workshop on CV writing, interviews, and digital job readiness.',
                'venue_name' => 'Katutura Community Hall',
                'location' => 'Katutura',
                'town' => 'Windhoek',
                'area' => 'Katutura',
                'lat' => -22.5335,
                'lng' => 17.0589,
                'starts_at' => now()->next('Wednesday')->setTime(10, 0),
                'ends_at' => now()->next('Wednesday')->setTime(13, 0),
                'image_url' => 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => true,
                'capacity' => 120,
                'metadata' => ['highlights' => ['CV clinic', 'Interview prep', 'Certificates']],
                'is_featured' => true,
            ],
            [
                'title' => 'Community Football Tournament',
                'category' => 'sport',
                'organizer_type' => Organization::class,
                'organizer_id' => $church->id,
                'created_by' => $superAdmin->id,
                'description' => 'Local youth teams compete in a weekend football tournament with food stalls on site.',
                'venue_name' => 'Khomasdal Sports Ground',
                'location' => 'Khomasdal',
                'town' => 'Windhoek',
                'area' => 'Khomasdal',
                'lat' => -22.5485,
                'lng' => 17.0411,
                'starts_at' => now()->next('Sunday')->setTime(8, 30),
                'ends_at' => now()->next('Sunday')->setTime(18, 0),
                'image_url' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => false,
                'capacity' => 600,
                'metadata' => ['highlights' => ['Youth teams', 'Family seating', 'Refreshments']],
            ],
            [
                'title' => 'City Public Meeting',
                'category' => 'municipal',
                'organizer_type' => Organization::class,
                'organizer_id' => $police->id,
                'created_by' => $superAdmin->id,
                'description' => 'Open community session on service delivery priorities and neighborhood safety updates.',
                'venue_name' => 'Municipal Chambers',
                'location' => 'Windhoek CBD',
                'town' => 'Windhoek',
                'area' => 'CBD',
                'lat' => -22.5712,
                'lng' => 17.0821,
                'starts_at' => now()->next('Thursday')->setTime(18, 0),
                'ends_at' => now()->next('Thursday')->setTime(20, 0),
                'image_url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => true,
                'capacity' => 200,
                'metadata' => ['highlights' => ['Public Q&A', 'Town updates']],
            ],
            [
                'title' => 'Health Awareness Day',
                'category' => 'health',
                'organizer_type' => Organization::class,
                'organizer_id' => $clinic->id,
                'created_by' => $doctorOwner->id,
                'description' => 'Free blood pressure checks, wellness talks, and community health screenings.',
                'venue_name' => 'Eembaxu Health Centre',
                'location' => 'Klein Windhoek',
                'town' => 'Windhoek',
                'area' => 'Klein Windhoek',
                'lat' => -22.5674,
                'lng' => 17.0909,
                'starts_at' => now()->next('Friday')->setTime(9, 0),
                'ends_at' => now()->next('Friday')->setTime(14, 0),
                'image_url' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => true,
                'capacity' => 160,
                'metadata' => ['highlights' => ['Screenings', 'Wellness talks']],
            ],
            [
                'title' => 'Church Fundraiser',
                'category' => 'church',
                'organizer_type' => Organization::class,
                'organizer_id' => $church->id,
                'created_by' => $superAdmin->id,
                'description' => 'Music, food, and family activities to raise funds for youth outreach programs.',
                'venue_name' => 'Grace Community Church Grounds',
                'location' => 'Khomasdal',
                'town' => 'Windhoek',
                'area' => 'Khomasdal',
                'lat' => -22.5478,
                'lng' => 17.0459,
                'starts_at' => now()->next('Saturday')->setTime(16, 0),
                'ends_at' => now()->next('Saturday')->setTime(21, 0),
                'image_url' => 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => false,
                'ticketing_enabled' => true,
                'capacity' => 180,
                'metadata' => ['highlights' => ['Live choir', 'Food sale']],
            ],
            [
                'title' => 'Small Business Expo',
                'category' => 'business',
                'organizer_type' => Organization::class,
                'organizer_id' => $shop->id,
                'created_by' => $doctorOwner->id,
                'description' => 'Local businesses showcase products, services, and growth opportunities.',
                'venue_name' => 'Windhoek Trade Hall',
                'location' => 'Southern Industrial',
                'town' => 'Windhoek',
                'area' => 'Southern Industrial',
                'lat' => -22.5793,
                'lng' => 17.0633,
                'starts_at' => now()->addDays(10)->setTime(9, 30),
                'ends_at' => now()->addDays(10)->setTime(17, 0),
                'image_url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => false,
                'ticketing_enabled' => true,
                'capacity' => 220,
                'metadata' => ['highlights' => ['Networking', 'Product demos', 'Business talks']],
            ],
            [
                'title' => 'Live Music Night',
                'category' => 'entertainment',
                'organizer_type' => Organization::class,
                'organizer_id' => $restaurant->id,
                'created_by' => $barberOwner->id,
                'description' => 'An evening of local performers, food specials, and a relaxed city-night atmosphere.',
                'venue_name' => 'Town Square Grill',
                'location' => 'Kleine Kuppe',
                'town' => 'Windhoek',
                'area' => 'Kleine Kuppe',
                'lat' => -22.5989,
                'lng' => 17.0957,
                'starts_at' => now()->next('Friday')->setTime(19, 30),
                'ends_at' => now()->next('Friday')->setTime(23, 0),
                'image_url' => 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => false,
                'ticketing_enabled' => true,
                'capacity' => 140,
                'metadata' => ['highlights' => ['Local artists', 'Dinner specials']],
                'is_featured' => true,
            ],
            [
                'title' => 'School Open Day',
                'category' => 'school',
                'organizer_type' => Organization::class,
                'organizer_id' => $school->id,
                'created_by' => $superAdmin->id,
                'description' => 'Meet teachers, tour classrooms, and explore student activities for the new term.',
                'venue_name' => 'Sunrise Combined School',
                'location' => 'Wanaheda',
                'town' => 'Windhoek',
                'area' => 'Wanaheda',
                'lat' => -22.5284,
                'lng' => 17.0712,
                'starts_at' => now()->addDays(12)->setTime(8, 0),
                'ends_at' => now()->addDays(12)->setTime(12, 30),
                'image_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => true,
                'capacity' => 240,
                'metadata' => ['highlights' => ['Campus tours', 'Parent welcome']],
            ],
            [
                'title' => 'Local Food Festival',
                'category' => 'community',
                'organizer_type' => Organization::class,
                'organizer_id' => $restaurant->id,
                'created_by' => $barberOwner->id,
                'description' => 'Taste local dishes, meet community cooks, and enjoy music in a family-friendly setting.',
                'venue_name' => 'Zoo Park',
                'location' => 'Windhoek CBD',
                'town' => 'Windhoek',
                'area' => 'CBD',
                'lat' => -22.5690,
                'lng' => 17.0820,
                'starts_at' => now()->addDays(14)->setTime(11, 0),
                'ends_at' => now()->addDays(14)->setTime(19, 0),
                'image_url' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => false,
                'ticketing_enabled' => true,
                'capacity' => 400,
                'metadata' => ['highlights' => ['Family day', 'Local dishes', 'Live music']],
            ],
            [
                'title' => 'Okahandja Weekend Market',
                'category' => 'community',
                'organizer_type' => Organization::class,
                'organizer_id' => $municipalOffice->id,
                'created_by' => $municipalityAdmin->id,
                'description' => 'Open-air market for local produce, home goods, and small traders in central Okahandja.',
                'venue_name' => 'Okahandja Open Market Grounds',
                'location' => 'Central Okahandja',
                'town' => 'Okahandja',
                'area' => 'Central Okahandja',
                'lat' => -21.9832,
                'lng' => 16.9187,
                'starts_at' => now()->next('Saturday')->setTime(8, 0),
                'ends_at' => now()->next('Saturday')->setTime(14, 0),
                'image_url' => 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => false,
                'capacity' => 300,
                'metadata' => ['highlights' => ['Fresh produce', 'Local traders', 'Family-friendly']],
            ],
            [
                'title' => 'Community Clean-Up Day',
                'category' => 'community',
                'organizer_type' => Organization::class,
                'organizer_id' => $municipalOffice->id,
                'created_by' => $municipalityAdmin->id,
                'description' => 'Residents and municipal teams join a morning cleanup around Nau-Aib and nearby streets.',
                'venue_name' => 'Nau-Aib Community Point',
                'location' => 'Nau-Aib',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'lat' => -21.9870,
                'lng' => 16.9110,
                'starts_at' => now()->addDays(9)->setTime(8, 30),
                'ends_at' => now()->addDays(9)->setTime(12, 0),
                'image_url' => 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => false,
                'capacity' => 180,
                'metadata' => ['highlights' => ['Clean-up kits', 'Volunteer sign-in', 'Community pride']],
            ],
            [
                'title' => 'Town Council Public Meeting',
                'category' => 'government',
                'organizer_type' => Organization::class,
                'organizer_id' => $municipalOffice->id,
                'created_by' => $municipalityAdmin->id,
                'description' => 'Public briefing on service delivery priorities, road works, and resident questions.',
                'venue_name' => 'Okahandja Town Council Hall',
                'location' => 'Central Okahandja',
                'town' => 'Okahandja',
                'area' => 'Central Okahandja',
                'lat' => -21.9834,
                'lng' => 16.9182,
                'starts_at' => now()->addDays(12)->setTime(17, 30),
                'ends_at' => now()->addDays(12)->setTime(19, 30),
                'image_url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => true,
                'capacity' => 220,
                'metadata' => ['highlights' => ['Service update', 'Resident Q&A', 'Project roadmap']],
            ],
        ];

        $events = collect($eventSeedData)->map(function (array $item): Event {
            return Event::updateOrCreate(
                ['title' => $item['title']],
                $item,
            );
        })->keyBy('title');

        $ticketTypeSeedData = [
            'Youth Skills Workshop in Katutura' => [
                ['name' => 'Free Seat', 'price' => 0, 'quantity_available' => 120, 'description' => 'Reserve your place in advance.'],
            ],
            'City Public Meeting' => [
                ['name' => 'Community Seat', 'price' => 0, 'quantity_available' => 200, 'description' => 'Free seat for residents.'],
            ],
            'Health Awareness Day' => [
                ['name' => 'Screening Pass', 'price' => 0, 'quantity_available' => 160, 'description' => 'Free wellness screening access.'],
            ],
            'Church Fundraiser' => [
                ['name' => 'Supporter Ticket', 'price' => 60, 'quantity_available' => 120, 'description' => 'General fundraiser entry.'],
                ['name' => 'Family Table', 'price' => 220, 'quantity_available' => 15, 'description' => 'Reserved family seating.'],
            ],
            'Small Business Expo' => [
                ['name' => 'Expo Entry', 'price' => 80, 'quantity_available' => 180, 'description' => 'General business expo access.'],
                ['name' => 'Networking Pass', 'price' => 150, 'quantity_available' => 40, 'description' => 'Includes networking session.'],
            ],
            'Live Music Night' => [
                ['name' => 'General Ticket', 'price' => 120, 'quantity_available' => 100, 'description' => 'Standing or casual seating.'],
                ['name' => 'VIP Table Seat', 'price' => 280, 'quantity_available' => 20, 'description' => 'Closer stage seating.'],
            ],
            'School Open Day' => [
                ['name' => 'Visitor Pass', 'price' => 0, 'quantity_available' => 240, 'description' => 'Reserve for attendance planning.'],
            ],
            'Local Food Festival' => [
                ['name' => 'Day Pass', 'price' => 50, 'quantity_available' => 300, 'description' => 'Festival general entry.'],
                ['name' => 'Tasting Pass', 'price' => 120, 'quantity_available' => 80, 'description' => 'Includes tasting coupons.'],
            ],
            'Town Council Public Meeting' => [
                ['name' => 'Resident Seat', 'price' => 0, 'quantity_available' => 220, 'description' => 'Reserve a seat for the public meeting.'],
            ],
        ];

        $ticketTypes = collect();
        foreach ($ticketTypeSeedData as $eventTitle => $types) {
            $event = $events->get($eventTitle);
            foreach ($types as $type) {
                $ticketTypes->push(EventTicketType::updateOrCreate(
                    ['event_id' => $event->id, 'name' => $type['name']],
                    [
                        ...$type,
                        'sales_start_at' => $event->starts_at->copy()->subDays(7),
                        'sales_end_at' => $event->starts_at->copy()->subHour(),
                        'is_active' => true,
                    ],
                ));
            }
        }

        $savedEvent = $events->get('Live Music Night');
        if ($savedEvent) {
            EventSave::updateOrCreate([
                'user_id' => $citizen->id,
                'event_id' => $savedEvent->id,
            ]);

            EventReminder::updateOrCreate([
                'user_id' => $citizen->id,
                'event_id' => $savedEvent->id,
                'channel' => 'in_app',
            ], [
                'remind_at' => $savedEvent->starts_at->copy()->subHours(6),
                'sent_at' => null,
            ]);
        }

        $freeWorkshop = $events->get('Youth Skills Workshop in Katutura');
        $freeWorkshopType = $ticketTypes->firstWhere('name', 'Free Seat');
        if ($freeWorkshop && $freeWorkshopType) {
            EventTicket::updateOrCreate([
                'event_id' => $freeWorkshop->id,
                'user_id' => $citizen->id,
                'ticket_code' => 'WORKSHOP01',
            ], [
                'ticket_type_id' => $freeWorkshopType->id,
                'status' => 'confirmed',
                'price_paid' => 0,
                'holder_name' => $citizen->name,
                'holder_phone' => $citizen->phone,
                'qr_code_payload' => 'lokals-ticket:'.$freeWorkshop->id.':WORKSHOP01',
                'reserved_at' => now()->subDay(),
                'confirmed_at' => now()->subDay(),
            ]);

            $freeWorkshopType->update(['quantity_sold' => 1]);
        }

        $musicNight = $events->get('Live Music Night');
        $musicTicketType = $ticketTypes->firstWhere('name', 'General Ticket');
        if ($musicNight && $musicTicketType) {
            EventTicket::updateOrCreate([
                'event_id' => $musicNight->id,
                'user_id' => $citizen->id,
                'ticket_code' => 'MUSICNIGHT1',
            ], [
                'ticket_type_id' => $musicTicketType->id,
                'status' => 'reserved',
                'price_paid' => null,
                'holder_name' => $citizen->name,
                'holder_phone' => $citizen->phone,
                'qr_code_payload' => 'lokals-ticket:'.$musicNight->id.':MUSICNIGHT1',
                'reserved_at' => now()->subHours(8),
            ]);

            $musicTicketType->update(['quantity_sold' => 1]);
        }

        Follow::updateOrCreate([
            'user_id' => $citizen->id,
            'followable_type' => Organization::class,
            'followable_id' => $clinic->id,
        ]);

        Follow::updateOrCreate([
            'user_id' => $citizen->id,
            'followable_type' => Organization::class,
            'followable_id' => $police->id,
        ]);

        Follow::updateOrCreate([
            'user_id' => $citizen->id,
            'followable_type' => ServiceProvider::class,
            'followable_id' => $barber->id,
        ]);

        Follow::updateOrCreate([
            'user_id' => $citizen->id,
            'followable_type' => ServiceProvider::class,
            'followable_id' => $taxiDispatch->id,
        ]);

        DatabaseNotification::query()->updateOrCreate([
            'id' => '10000000-0000-0000-0000-000000000001',
        ], [
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $citizen->id,
            'data' => [
                'type' => 'booking_update',
                'title' => 'Booking confirmed',
                'body' => 'FreshFade Katutura has confirmed your haircut request for tomorrow morning.',
                'target' => [
                    'type' => 'booking',
                    'id' => 1,
                    'href' => '/my-bookings',
                ],
            ],
            'read_at' => null,
            'created_at' => now()->subMinutes(45),
            'updated_at' => now()->subMinutes(45),
        ]);

        DatabaseNotification::query()->updateOrCreate([
            'id' => '10000000-0000-0000-0000-000000000002',
        ], [
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $citizen->id,
            'data' => [
                'type' => 'alert_from_followed',
                'title' => 'Clinic update from a followed source',
                'body' => 'Eembaxu Health Centre has extended its Saturday walk-in hours.',
                'target' => [
                    'type' => 'alert',
                    'id' => 'clinic-alert-1',
                    'href' => '/alerts',
                ],
            ],
            'read_at' => null,
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);

        DatabaseNotification::query()->updateOrCreate([
            'id' => '10000000-0000-0000-0000-000000000003',
        ], [
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $citizen->id,
            'data' => [
                'type' => 'news_update',
                'title' => 'Local news update',
                'body' => 'A new transport story is trending in your area.',
                'target' => [
                    'type' => 'news',
                    'id' => 1,
                    'href' => '/news',
                    'external_url' => 'https://www.namibian.com.na/taxi-operators-report-late-evening-demand-growth',
                    'source_name' => 'The Namibian',
                    'title' => 'Taxi operators report higher late-evening demand across the city',
                ],
            ],
            'read_at' => null,
            'created_at' => now()->subHours(4),
            'updated_at' => now()->subHours(4),
        ]);

        DatabaseNotification::query()->updateOrCreate([
            'id' => '10000000-0000-0000-0000-000000000004',
        ], [
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $citizen->id,
            'data' => [
                'type' => 'event_reminder',
                'title' => 'Event reminder',
                'body' => 'Live Music Night starts later today. Your reminder is active.',
                'target' => [
                    'type' => 'event',
                    'id' => $musicNight?->id,
                    'href' => '/my-tickets',
                ],
            ],
            'read_at' => now()->subHour(),
            'created_at' => now()->subHours(8),
            'updated_at' => now()->subHour(),
        ]);

        DatabaseNotification::query()->updateOrCreate([
            'id' => '10000000-0000-0000-0000-000000000005',
        ], [
            'type' => 'system',
            'notifiable_type' => User::class,
            'notifiable_id' => $citizen->id,
            'data' => [
                'type' => 'delivery_update',
                'title' => 'Delivery request updated',
                'body' => 'Your parcel request is being reviewed by nearby drivers.',
                'target' => [
                    'type' => 'delivery',
                    'id' => 1,
                    'href' => '/delivery',
                ],
            ],
            'read_at' => null,
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        $free = SubscriptionPlan::updateOrCreate(['code' => 'free'], [
            'name' => 'Free',
            'code' => 'free',
            'description' => 'Basic access for citizens and early marketplace users.',
            'price' => 0,
            'billing_period' => 'monthly',
            'features' => ['basic listings', 'standard bookings'],
            'is_active' => true,
        ]);

        $basicProvider = SubscriptionPlan::updateOrCreate(['code' => 'basic_provider'], [
            'name' => 'Basic Provider',
            'code' => 'basic_provider',
            'description' => 'Starter package for service providers.',
            'price' => 99,
            'billing_period' => 'monthly',
            'features' => ['provider profile', 'bookings', 'basic analytics'],
            'is_active' => true,
        ]);

        $featuredProvider = SubscriptionPlan::updateOrCreate(['code' => 'featured_provider'], [
            'name' => 'Featured Provider',
            'code' => 'featured_provider',
            'description' => 'Boosted discovery and promoted placement.',
            'price' => 249,
            'billing_period' => 'monthly',
            'features' => ['priority placement', 'promoted profile', 'analytics'],
            'is_active' => true,
        ]);

        $businessPro = SubscriptionPlan::updateOrCreate(['code' => 'business_pro'], [
            'name' => 'Business Pro',
            'code' => 'business_pro',
            'description' => 'Expanded tools for larger organizations.',
            'price' => 499,
            'billing_period' => 'monthly',
            'features' => ['multi-location', 'priority support', 'admin seats'],
            'is_active' => true,
        ]);

        UserSubscription::updateOrCreate([
            'user_id' => $citizen->id,
            'subscription_plan_id' => $free->id,
        ], [
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        ProviderPackage::updateOrCreate([
            'service_provider_id' => $doctor->id,
            'subscription_plan_id' => $featuredProvider->id,
        ], [
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        PromotedListing::updateOrCreate([
            'listing_id' => $deskListing->id,
        ], [
            'starts_at' => now(),
            'ends_at' => now()->addWeek(),
            'status' => 'scheduled',
        ]);

        SosAlert::updateOrCreate([
            'user_id' => $citizen->id,
            'message' => 'Need urgent help near Independence Avenue',
        ], [
            'emergency_type' => 'Personal safety',
            'location' => 'Windhoek CBD',
            'town' => 'Windhoek',
            'area' => 'CBD',
            'lat' => -22.5703,
            'lng' => 17.0832,
            'status' => 'sent',
        ]);

        SosAlert::updateOrCreate([
            'user_id' => $doctorOwner->id,
            'message' => 'Medical standby alert for late-night home visit',
        ], [
            'emergency_type' => 'Medical',
            'location' => 'Klein Windhoek',
            'town' => 'Windhoek',
            'area' => 'Klein Windhoek',
            'lat' => -22.5672,
            'lng' => 17.0912,
            'status' => 'resolved',
        ]);

        // TODO: connect monetization checkout flows to PayToday, PayPal, Stripe, Mobile Money, and EFT/bank transfer options.
    }
}
