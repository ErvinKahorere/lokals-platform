<?php

namespace Database\Seeders;

use App\Models\Organization;
use Database\Seeders\Support\BuildsDemoRecords;
use Illuminate\Database\Seeder;

class DemoServiceProviderSeeder extends Seeder
{
    use BuildsDemoRecords;

    public function run(): void
    {
        $availability = [
            ['day_of_week' => 1, 'start_time' => '08:00', 'end_time' => '17:00'],
            ['day_of_week' => 2, 'start_time' => '08:00', 'end_time' => '17:00'],
            ['day_of_week' => 3, 'start_time' => '08:00', 'end_time' => '17:00'],
            ['day_of_week' => 4, 'start_time' => '08:00', 'end_time' => '17:00'],
            ['day_of_week' => 5, 'start_time' => '08:00', 'end_time' => '17:00'],
            ['day_of_week' => 6, 'start_time' => '09:00', 'end_time' => '13:00'],
        ];

        $market = Organization::query()->where('name', 'Okahandja Fresh Market')->first();
        $pharmacy = Organization::query()->where('name', 'Nau-Aib Pharmacy')->first();
        $hardware = Organization::query()->where('name', 'Five Rand Hardware')->first();
        $guesthouse = Organization::query()->where('name', 'Garden View Guesthouse')->first();
        $butchery = Organization::query()->where('name', 'Riverbend Butchery')->first();

        $providers = [
            [
                'email' => 'plumber@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Simon Kavezeri',
                    'phone' => '+264810002201',
                    'whatsapp' => '+264810002201',
                    'profession' => 'Plumber',
                    'location' => 'Five Rand, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Five Rand',
                    'current_role' => 'service_provider',
                    'lat' => -21.9804,
                    'lng' => 16.9223,
                ],
                'provider' => [
                    'name' => 'Simon Plumbing Callouts',
                    'category' => 'plumber',
                    'description' => 'Fast repairs for leaks, fittings, and blocked drains in Okahandja.',
                    'location' => 'Five Rand, Okahandja',
                    'lat' => -21.9804,
                    'lng' => 16.9223,
                    'organization_id' => $hardware?->id,
                ],
                'services' => [
                    ['name' => 'Leak repair visit', 'description' => 'Leak repair and seal replacement.', 'price' => 280, 'duration_minutes' => 90],
                ],
            ],
            [
                'email' => 'electrician@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Violet Nambahu',
                    'phone' => '+264810002202',
                    'whatsapp' => '+264810002202',
                    'profession' => 'Electrician',
                    'location' => 'Town Centre, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Town Centre',
                    'current_role' => 'service_provider',
                    'lat' => -21.9839,
                    'lng' => 16.9191,
                ],
                'provider' => [
                    'name' => 'BrightWire Electrical',
                    'category' => 'electrician',
                    'description' => 'Switches, rewiring, fittings, and urgent power checks for homes and shops.',
                    'location' => 'Town Centre, Okahandja',
                    'lat' => -21.9839,
                    'lng' => 16.9191,
                    'organization_id' => $hardware?->id,
                ],
                'services' => [
                    ['name' => 'Electrical inspection', 'description' => 'Safety check and small-fix inspection.', 'price' => 350, 'duration_minutes' => 75],
                ],
            ],
            [
                'email' => 'barber@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Paulus Hikuam',
                    'phone' => '+264810002203',
                    'whatsapp' => '+264810002203',
                    'profession' => 'Barber',
                    'location' => 'Nau-Aib, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Nau-Aib',
                    'current_role' => 'service_provider',
                    'lat' => -21.9878,
                    'lng' => 16.9117,
                ],
                'provider' => [
                    'name' => 'Nau-Aib Style Barber',
                    'category' => 'barber',
                    'description' => 'Fresh cuts, beard shaping, and weekend grooming slots.',
                    'location' => 'Nau-Aib, Okahandja',
                    'lat' => -21.9878,
                    'lng' => 16.9117,
                ],
                'services' => [
                    ['name' => 'Classic haircut', 'description' => 'Adult haircut and edge-up.', 'price' => 70, 'duration_minutes' => 45],
                ],
            ],
            [
                'email' => 'tailor@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Lydia Tjivikua',
                    'phone' => '+264810002204',
                    'whatsapp' => '+264810002204',
                    'profession' => 'Tailor',
                    'location' => 'Town Centre, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Town Centre',
                    'current_role' => 'service_provider',
                    'lat' => -21.9828,
                    'lng' => 16.9180,
                ],
                'provider' => [
                    'name' => 'Threadline Tailoring',
                    'category' => 'tailor',
                    'description' => 'Uniform alterations, dress repairs, and same-week hemming.',
                    'location' => 'Town Centre, Okahandja',
                    'lat' => -21.9828,
                    'lng' => 16.9180,
                    'organization_id' => $market?->id,
                ],
                'services' => [
                    ['name' => 'Uniform alteration', 'description' => 'School and workwear tailoring.', 'price' => 120, 'duration_minutes' => 60],
                ],
            ],
            [
                'email' => 'cleaner@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Maria Tjinene',
                    'phone' => '+264810002205',
                    'whatsapp' => '+264810002205',
                    'profession' => 'Cleaner',
                    'location' => 'Nau-Aib, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Nau-Aib',
                    'current_role' => 'service_provider',
                    'lat' => -21.9868,
                    'lng' => 16.9126,
                ],
                'provider' => [
                    'name' => 'Sparkle Home Cleaning',
                    'category' => 'cleaning',
                    'description' => 'Household deep cleans, move-out cleaning, and office touch-ups.',
                    'location' => 'Nau-Aib, Okahandja',
                    'lat' => -21.9868,
                    'lng' => 16.9126,
                ],
                'services' => [
                    ['name' => 'Two-room clean', 'description' => 'General house clean for small homes.', 'price' => 260, 'duration_minutes' => 120],
                ],
            ],
            [
                'email' => 'mechanic@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Thomas Hamalwa',
                    'phone' => '+264810002206',
                    'whatsapp' => '+264810002206',
                    'profession' => 'Mechanic',
                    'location' => 'Industrial Area, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Industrial Area',
                    'current_role' => 'service_provider',
                    'lat' => -21.9738,
                    'lng' => 16.9284,
                ],
                'provider' => [
                    'name' => 'Thomas Mobile Mechanics',
                    'category' => 'mechanic',
                    'description' => 'Mobile diagnostics, battery replacement, and minor roadside help.',
                    'location' => 'Industrial Area, Okahandja',
                    'lat' => -21.9738,
                    'lng' => 16.9284,
                    'organization_id' => $butchery?->id,
                ],
                'services' => [
                    ['name' => 'Mobile diagnostic', 'description' => 'On-site engine and battery checks.', 'price' => 320, 'duration_minutes' => 60],
                ],
            ],
            [
                'email' => 'tutor@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Tomasine Kaarondo',
                    'phone' => '+264810002207',
                    'whatsapp' => '+264810002207',
                    'profession' => 'Tutor',
                    'location' => 'Nau-Aib, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Nau-Aib',
                    'current_role' => 'service_provider',
                    'lat' => -21.9881,
                    'lng' => 16.9109,
                ],
                'provider' => [
                    'name' => 'Okahandja Maths Tutor',
                    'category' => 'education',
                    'description' => 'Mathematics support for junior secondary and high school learners.',
                    'location' => 'Nau-Aib, Okahandja',
                    'lat' => -21.9881,
                    'lng' => 16.9109,
                ],
                'services' => [
                    ['name' => 'One-hour maths lesson', 'description' => 'Individual tutoring session.', 'price' => 150, 'duration_minutes' => 60],
                ],
            ],
            [
                'email' => 'photographer@lokals.app',
                'roles' => ['service_provider'],
                'user' => [
                    'name' => 'Johan Goagoseb',
                    'phone' => '+264810002208',
                    'whatsapp' => '+264810002208',
                    'profession' => 'Photographer',
                    'location' => 'Town Centre, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Town Centre',
                    'current_role' => 'service_provider',
                    'lat' => -21.9831,
                    'lng' => 16.9173,
                ],
                'provider' => [
                    'name' => 'Okahandja Lens Studio',
                    'category' => 'photography',
                    'description' => 'Portrait, graduation, and event coverage for local families and vendors.',
                    'location' => 'Town Centre, Okahandja',
                    'lat' => -21.9831,
                    'lng' => 16.9173,
                    'organization_id' => $guesthouse?->id,
                ],
                'services' => [
                    ['name' => 'Portrait mini-session', 'description' => '30-minute portrait session.', 'price' => 280, 'duration_minutes' => 30],
                ],
            ],
            [
                'email' => 'taxi@lokals.app',
                'roles' => ['service_provider', 'driver'],
                'user' => [
                    'name' => 'Nestor Kambonde',
                    'phone' => '+264810002209',
                    'whatsapp' => '+264810002209',
                    'profession' => 'Taxi driver',
                    'location' => 'Taxi Rank, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Town Centre',
                    'current_role' => 'driver',
                    'lat' => -21.9835,
                    'lng' => 16.9196,
                ],
                'provider' => [
                    'name' => 'QuickRide Okahandja',
                    'category' => 'transport',
                    'description' => 'Town rides, school runs, and late-afternoon pickups around Okahandja.',
                    'location' => 'Taxi Rank, Okahandja',
                    'lat' => -21.9835,
                    'lng' => 16.9196,
                    'organization_id' => $market?->id,
                ],
                'services' => [
                    ['name' => 'In-town taxi trip', 'description' => 'Standard local taxi trip within Okahandja.', 'price' => 45, 'duration_minutes' => 25],
                ],
            ],
            [
                'email' => 'courier@lokals.app',
                'roles' => ['service_provider', 'driver'],
                'user' => [
                    'name' => 'Paulette Tjombonde',
                    'phone' => '+264810002210',
                    'whatsapp' => '+264810002210',
                    'profession' => 'Courier rider',
                    'location' => 'Town Centre, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Town Centre',
                    'current_role' => 'driver',
                    'lat' => -21.9829,
                    'lng' => 16.9188,
                ],
                'provider' => [
                    'name' => 'TownSwift Courier',
                    'category' => 'delivery',
                    'description' => 'Same-day parcel, medicine, and document delivery around Okahandja.',
                    'location' => 'Town Centre, Okahandja',
                    'lat' => -21.9829,
                    'lng' => 16.9188,
                    'organization_id' => $pharmacy?->id,
                ],
                'services' => [
                    ['name' => 'Same-day parcel drop', 'description' => 'Fast local parcel delivery.', 'price' => 65, 'duration_minutes' => 45],
                ],
            ],
        ];

        foreach ($providers as $provider) {
            $user = $this->upsertUser(
                $provider['email'],
                $provider['user'],
                $provider['roles'],
                [
                    'bio' => "{$provider['provider']['name']} is part of the Okahandja demo service network.",
                ],
                [
                    'interests' => ['Bookings', 'Service leads', 'Local visibility'],
                ],
            );

            $this->upsertServiceProvider(
                $user,
                [
                    'phone' => $user->phone,
                    'whatsapp' => $user->whatsapp,
                    'avatar_url' => null,
                    'is_verified' => true,
                    'status' => 'active',
                    'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '17:00']],
                    ...$provider['provider'],
                ],
                $provider['services'],
                $availability,
            );
        }
    }
}
