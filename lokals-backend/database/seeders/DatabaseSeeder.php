<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Announcement;
use App\Models\AvailabilitySlot;
use App\Models\Block;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\DeliveryRequest;
use App\Models\Follow;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\ModerationFlag;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Profile;
use App\Models\ProviderPackage;
use App\Models\PromotedListing;
use App\Models\SavedAddress;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\SubscriptionPlan;
use App\Models\Accommodation;
use App\Models\User;
use App\Models\UserPreference;
use App\Models\UserSubscription;
use App\Models\WorkerProfile;
use Illuminate\Database\Seeder;
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
            'location' => 'Windhoek',
            'default_town' => 'Windhoek',
            'default_area' => 'Khomasdal',
            'current_role' => 'citizen',
            'lat' => -22.57,
            'lng' => 17.08,
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
            'name' => 'City Operator',
            'phone' => '+264810000006',
            'email' => 'municipality@lokals.test',
            'password' => Hash::make('password'),
            'location' => 'Windhoek CBD',
            'default_town' => 'Windhoek',
            'default_area' => 'CBD',
            'current_role' => 'municipality_admin',
            'lat' => -22.5703,
            'lng' => 17.0832,
        ]);
        $municipalityAdmin->assignRole('municipality_admin');

        foreach ([$superAdmin, $citizen, $barberOwner, $doctorOwner, $mechanicOwner, $municipalityAdmin] as $user) {
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

        $police = Organization::updateOrCreate(['name' => 'Windhoek Central Police Station'], [
            'name' => 'Windhoek Central Police Station',
            'category' => 'public_safety',
            'subcategory' => 'police_station',
            'description' => 'Main public safety and reporting center for central Windhoek.',
            'phone' => '+26461111111',
            'location' => 'CBD',
            'town' => 'Windhoek',
            'area' => 'CBD',
            'lat' => -22.5688,
            'lng' => 17.0836,
            'is_verified' => true,
            'is_public_service' => true,
            'emergency_contact' => true,
            'opening_hours' => [['day' => 'Daily', 'open' => '00:00', 'close' => '23:59']],
            'services_offered' => ['Emergency response', 'Public notices', 'Reporting desk'],
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

        foreach ([$barber, $doctor, $mechanic] as $provider) {
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

        Listing::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Second-hand study desk'], [
            'type' => 'marketplace',
            'title' => 'Second-hand study desk',
            'description' => 'Solid wood desk, good condition.',
            'price' => 800,
            'phone' => $citizen->phone,
            'location' => 'Windhoek West',
            'status' => 'published',
        ]);

        Listing::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Same-day medicine delivery'], [
            'organization_id' => $clinic->id,
            'type' => 'delivery',
            'title' => 'Same-day medicine delivery',
            'description' => 'Medicine pickup and drop-off within Windhoek.',
            'price' => 75,
            'phone' => $doctorOwner->phone,
            'location' => 'Windhoek',
            'status' => 'published',
        ]);

        JobPost::updateOrCreate(['user_id' => $superAdmin->id, 'title' => 'Part-time receptionist'], [
            'organization_id' => $clinic->id,
            'title' => 'Part-time receptionist',
            'description' => 'Front desk support for weekday afternoons.',
            'employment_type' => 'part_time',
            'compensation' => 4500,
            'location' => 'Windhoek',
            'status' => 'open',
            'skills' => ['customer service', 'computer literacy'],
        ]);

        JobPost::updateOrCreate(['user_id' => $mechanicOwner->id, 'title' => 'Weekend driver assistant'], [
            'organization_id' => $garage->id,
            'title' => 'Weekend driver assistant',
            'description' => 'Flexible side hustle assisting with parts delivery.',
            'employment_type' => 'gig',
            'compensation' => 900,
            'location' => 'Windhoek',
            'status' => 'open',
            'skills' => ['driving', 'customer care'],
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

        Alert::updateOrCreate(['title' => 'Water interruption'], [
            'title' => 'Water interruption',
            'body' => 'Scheduled maintenance affecting parts of Windhoek tomorrow morning.',
            'type' => 'utility',
            'audience' => 'all',
            'location' => 'Windhoek',
            'priority' => 'high',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
            'is_active' => true,
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

        $report = CityReport::updateOrCreate(['user_id' => $citizen->id, 'title' => 'Pothole near school crossing'], [
            'category' => 'roads',
            'title' => 'Pothole near school crossing',
            'description' => 'Large pothole causing traffic hazard.',
            'location' => 'Khomasdal',
            'lat' => -22.5451,
            'lng' => 17.0483,
            'status' => 'in_review',
            'priority' => 'high',
        ]);

        JobApplication::updateOrCreate([
            'job_post_id' => 1,
            'user_id' => $citizen->id,
        ], [
            'message' => 'I have front-desk experience and can start immediately.',
            'status' => 'submitted',
        ]);

        ModerationFlag::updateOrCreate([
            'user_id' => $citizen->id,
            'flaggable_type' => Listing::class,
            'flaggable_id' => 1,
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

        DeliveryRequest::updateOrCreate([
            'user_id' => $citizen->id,
            'pickup_location' => 'Khomasdal',
            'dropoff_location' => 'Klein Windhoek',
        ], [
            'pickup_address' => 'Khomasdal taxi rank',
            'dropoff_address' => 'Klein Windhoek clinic',
            'item_description' => 'Documents envelope',
            'parcel_description' => 'Documents envelope',
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
            'parcel_size' => 'medium',
            'estimated_price' => 85,
            'status' => 'in_transit',
        ]);

        Accommodation::updateOrCreate(['user_id' => $doctorOwner->id, 'title' => 'Klein Windhoek Garden B&B'], [
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
            'status' => 'published',
            'metadata' => ['amenities' => ['Breakfast', 'Parking', 'Wi-Fi'], 'rules' => ['No smoking']],
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
            'status' => 'published',
            'metadata' => ['amenities' => ['Parking', 'Water included']],
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
            'status' => 'published',
            'metadata' => ['amenities' => ['Garage', 'Garden']],
        ]);

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
            'listing_id' => 1,
        ], [
            'starts_at' => now(),
            'ends_at' => now()->addWeek(),
            'status' => 'scheduled',
        ]);

        // TODO: connect monetization checkout flows to PayToday, PayPal, Stripe, Mobile Money, and EFT/bank transfer options.
    }
}
