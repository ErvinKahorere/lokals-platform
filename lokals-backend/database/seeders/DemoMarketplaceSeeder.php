<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoMarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $market = Organization::query()->where('name', 'Okahandja Fresh Market')->first();
        $pharmacy = Organization::query()->where('name', 'Nau-Aib Pharmacy')->first();
        $hardware = Organization::query()->where('name', 'Five Rand Hardware')->first();
        $guesthouse = Organization::query()->where('name', 'Garden View Guesthouse')->first();
        $butchery = Organization::query()->where('name', 'Riverbend Butchery')->first();

        $owners = [
            'market' => User::query()->where('email', 'market@lokals.app')->first(),
            'pharmacy' => User::query()->where('email', 'pharmacy@lokals.app')->first(),
            'hardware' => User::query()->where('email', 'hardware@lokals.app')->first(),
            'guesthouse' => User::query()->where('email', 'guesthouse@lokals.app')->first(),
            'butchery' => User::query()->where('email', 'butchery@lokals.app')->first(),
            'tailor' => User::query()->where('email', 'tailor@lokals.app')->first(),
            'photographer' => User::query()->where('email', 'photographer@lokals.app')->first(),
            'taxi' => User::query()->where('email', 'taxi@lokals.app')->first(),
            'courier' => User::query()->where('email', 'courier@lokals.app')->first(),
        ];

        $listings = [
            [
                'title' => 'Bulk maize meal 10kg special',
                'user_id' => $owners['market']?->id,
                'organization_id' => $market?->id,
                'type' => 'product',
                'description' => 'Town-centre pickup for quality maize meal at a weekly promo price.',
                'price' => 125,
                'phone' => '+264610001101',
                'location' => 'Town Centre, Okahandja',
                'lat' => -21.9832,
                'lng' => 16.9179,
                'metadata' => ['condition' => 'new', 'category' => 'groceries'],
            ],
            [
                'title' => 'Vitamin family pack',
                'user_id' => $owners['pharmacy']?->id,
                'organization_id' => $pharmacy?->id,
                'type' => 'product',
                'description' => 'Household wellness pack with vitamins, immune support, and basic first-aid items.',
                'price' => 210,
                'phone' => '+264610001102',
                'location' => 'Nau-Aib, Okahandja',
                'lat' => -21.9874,
                'lng' => 16.9111,
                'metadata' => ['condition' => 'new', 'category' => 'health'],
            ],
            [
                'title' => 'Cement blocks for home repairs',
                'user_id' => $owners['hardware']?->id,
                'organization_id' => $hardware?->id,
                'type' => 'product',
                'description' => 'Strong cement blocks sold individually or in bulk for quick repair jobs.',
                'price' => 18,
                'phone' => '+264610001103',
                'location' => 'Five Rand, Okahandja',
                'lat' => -21.9797,
                'lng' => 16.9231,
                'metadata' => ['condition' => 'new', 'category' => 'building'],
            ],
            [
                'title' => 'Weekend guesthouse room offer',
                'user_id' => $owners['guesthouse']?->id,
                'organization_id' => $guesthouse?->id,
                'type' => 'service',
                'description' => 'One-night weekend stay with breakfast included for two guests.',
                'price' => 850,
                'phone' => '+264610001104',
                'location' => 'Town Centre, Okahandja',
                'lat' => -21.9821,
                'lng' => 16.9168,
                'metadata' => ['category' => 'hospitality', 'duration' => '1 night'],
            ],
            [
                'title' => 'Family braai meat combo',
                'user_id' => $owners['butchery']?->id,
                'organization_id' => $butchery?->id,
                'type' => 'product',
                'description' => 'Mixed braai pack with beef, wors, and marinated cuts for a weekend gathering.',
                'price' => 290,
                'phone' => '+264610001105',
                'location' => 'Industrial Area, Okahandja',
                'lat' => -21.9733,
                'lng' => 16.9289,
                'metadata' => ['condition' => 'fresh', 'category' => 'food'],
            ],
            [
                'title' => 'School uniform alteration slot',
                'user_id' => $owners['tailor']?->id,
                'organization_id' => $market?->id,
                'type' => 'service',
                'description' => 'Same-week resizing and hem adjustments for school uniforms.',
                'price' => 120,
                'phone' => '+264810002204',
                'location' => 'Town Centre, Okahandja',
                'lat' => -21.9828,
                'lng' => 16.9180,
                'metadata' => ['category' => 'tailoring', 'turnaround' => '3 days'],
            ],
            [
                'title' => 'Portrait shoot voucher',
                'user_id' => $owners['photographer']?->id,
                'organization_id' => $guesthouse?->id,
                'type' => 'service',
                'description' => 'Giftable portrait-session voucher for graduations, birthdays, or family photos.',
                'price' => 280,
                'phone' => '+264810002208',
                'location' => 'Town Centre, Okahandja',
                'lat' => -21.9831,
                'lng' => 16.9173,
                'metadata' => ['category' => 'photography', 'duration' => '30 minutes'],
            ],
            [
                'title' => 'Airport transfer booking',
                'user_id' => $owners['taxi']?->id,
                'organization_id' => $market?->id,
                'type' => 'service',
                'description' => 'Reserve a transfer between Okahandja and Hosea Kutako via local taxi operator.',
                'price' => 650,
                'phone' => '+264810002209',
                'location' => 'Taxi Rank, Okahandja',
                'lat' => -21.9835,
                'lng' => 16.9196,
                'metadata' => ['category' => 'transport', 'capacity' => 3],
            ],
            [
                'title' => 'Same-day parcel runner',
                'user_id' => $owners['courier']?->id,
                'organization_id' => $pharmacy?->id,
                'type' => 'service',
                'description' => 'Fast in-town parcel runs for medicines, groceries, and documents.',
                'price' => 65,
                'phone' => '+264810002210',
                'location' => 'Town Centre, Okahandja',
                'lat' => -21.9829,
                'lng' => 16.9188,
                'metadata' => ['category' => 'delivery', 'coverage' => 'Okahandja'],
            ],
            [
                'title' => 'Fresh spinach crate special',
                'user_id' => $owners['market']?->id,
                'organization_id' => $market?->id,
                'type' => 'product',
                'description' => 'Farm-fresh spinach bundles packed for households, tuck shops, and local kitchens.',
                'price' => 90,
                'phone' => '+264610001101',
                'location' => 'Town Centre, Okahandja',
                'lat' => -21.9832,
                'lng' => 16.9179,
                'metadata' => ['condition' => 'fresh', 'category' => 'produce'],
            ],
        ];

        foreach ($listings as $listing) {
            Listing::query()->updateOrCreate(
                ['title' => $listing['title']],
                [
                    ...$listing,
                    'currency' => 'NAD',
                    'status' => 'published',
                ],
            );
        }
    }
}
