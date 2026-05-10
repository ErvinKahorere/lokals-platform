<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoEventSeeder extends Seeder
{
    public function run(): void
    {
        $manager = User::query()->where('email', 'manager@lokals.app')->first();
        $marketOwner = User::query()->where('email', 'market@lokals.app')->first();
        $guesthouseOwner = User::query()->where('email', 'guesthouse@lokals.app')->first();

        $council = Organization::query()->where('name', 'Okahandja Town Council')->first();
        $market = Organization::query()->where('name', 'Okahandja Fresh Market')->first();
        $guesthouse = Organization::query()->where('name', 'Garden View Guesthouse')->first();
        $hardware = Organization::query()->where('name', 'Five Rand Hardware')->first();
        $butchery = Organization::query()->where('name', 'Riverbend Butchery')->first();

        $events = [
            [
                'title' => 'Okahandja Weekend Market Day',
                'description' => 'Browse fresh produce, handmade goods, and neighbour-run stalls at the town centre.',
                'category' => 'community',
                'venue_name' => 'Town Centre Market Grounds',
                'location' => 'Town Centre, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Town Centre',
                'lat' => -21.9832,
                'lng' => 16.9181,
                'starts_at' => now()->next('Saturday')->setTime(8, 0),
                'ends_at' => now()->next('Saturday')->setTime(14, 0),
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => false,
                'capacity' => 300,
                'metadata' => ['highlights' => ['Produce stalls', 'Family shopping', 'Local vendors']],
                'organizer_type' => Organization::class,
                'organizer_id' => $market?->id,
                'created_by' => $marketOwner?->id,
            ],
            [
                'title' => 'Town Hall Service Delivery Briefing',
                'description' => 'Public meeting on water maintenance, road works, refuse collection, and resident questions for the next municipal cycle.',
                'category' => 'municipal',
                'venue_name' => 'Okahandja Town Council Hall',
                'location' => 'Town Centre, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Town Centre',
                'lat' => -21.9834,
                'lng' => 16.9182,
                'starts_at' => now()->addDays(6)->setTime(17, 30),
                'ends_at' => now()->addDays(6)->setTime(19, 0),
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => true,
                'capacity' => 220,
                'metadata' => ['highlights' => ['Resident Q&A', 'Road updates', 'Water maintenance plan']],
                'organizer_type' => Organization::class,
                'organizer_id' => $council?->id,
                'created_by' => $manager?->id,
            ],
            [
                'title' => 'Small Business Networking Breakfast',
                'description' => 'Morning networking for entrepreneurs, side-hustlers, and local service brands.',
                'category' => 'business',
                'venue_name' => 'Garden View Guesthouse Courtyard',
                'location' => 'Town Centre, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Town Centre',
                'lat' => -21.9821,
                'lng' => 16.9168,
                'starts_at' => now()->addDays(9)->setTime(7, 30),
                'ends_at' => now()->addDays(9)->setTime(10, 30),
                'status' => 'published',
                'is_free' => false,
                'ticketing_enabled' => true,
                'capacity' => 80,
                'metadata' => ['highlights' => ['Vendor intros', 'Growth tips', 'Coffee and pastries']],
                'organizer_type' => Organization::class,
                'organizer_id' => $guesthouse?->id,
                'created_by' => $guesthouseOwner?->id,
            ],
            [
                'title' => 'Five Rand DIY Repair Clinic',
                'description' => 'Hands-on home repair basics covering taps, fittings, and small household fixes.',
                'category' => 'skills',
                'venue_name' => 'Five Rand Hardware Yard',
                'location' => 'Five Rand, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Five Rand',
                'lat' => -21.9797,
                'lng' => 16.9231,
                'starts_at' => now()->addDays(11)->setTime(10, 0),
                'ends_at' => now()->addDays(11)->setTime(13, 0),
                'status' => 'published',
                'is_free' => true,
                'ticketing_enabled' => true,
                'capacity' => 60,
                'metadata' => ['highlights' => ['Tool demo', 'Pipe basics', 'Safety checks']],
                'organizer_type' => Organization::class,
                'organizer_id' => $hardware?->id,
                'created_by' => $manager?->id,
            ],
            [
                'title' => 'Heritage Braai and Music Evening',
                'description' => 'A social evening with local food, live music, and a relaxed family atmosphere.',
                'category' => 'community',
                'venue_name' => 'Riverbend Courtyard',
                'location' => 'Industrial Area, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Industrial Area',
                'lat' => -21.9733,
                'lng' => 16.9289,
                'starts_at' => now()->addDays(14)->setTime(18, 0),
                'ends_at' => now()->addDays(14)->setTime(22, 0),
                'status' => 'published',
                'is_free' => false,
                'ticketing_enabled' => true,
                'capacity' => 140,
                'metadata' => ['highlights' => ['Local music', 'Braai plates', 'Family seating']],
                'organizer_type' => Organization::class,
                'organizer_id' => $butchery?->id,
                'created_by' => $marketOwner?->id,
            ],
        ];

        foreach ($events as $event) {
            Event::query()->updateOrCreate(
                ['title' => $event['title']],
                [
                    ...$event,
                    'image_url' => null,
                    'is_featured' => in_array($event['title'], [
                        'Okahandja Weekend Market Day',
                        'Town Hall Service Delivery Briefing',
                    ], true),
                ],
            );
        }
    }
}
