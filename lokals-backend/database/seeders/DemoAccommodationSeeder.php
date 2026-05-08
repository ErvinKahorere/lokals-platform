<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoAccommodationSeeder extends Seeder
{
    public function run(): void
    {
        $guesthouseOwner = User::query()->where('email', 'guesthouse@lokals.app')->first();
        $hardwareOwner = User::query()->where('email', 'hardware@lokals.app')->first();

        $guesthouse = Organization::query()->where('name', 'Garden View Guesthouse')->first();
        $hardware = Organization::query()->where('name', 'Five Rand Hardware')->first();

        $accommodations = [
            [
                'title' => 'Nau-Aib Family House',
                'user_id' => $hardwareOwner?->id,
                'business_id' => $hardware?->id,
                'type' => 'property_sale',
                'description' => 'A three-bedroom family home close to schools, taxis, and everyday shopping.',
                'price' => 1185000,
                'price_period' => 'once_off',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'location' => 'Nau-Aib Extension 2',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'lat' => -21.9872,
                'lng' => 16.9114,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001103',
                    'amenities' => ['Boundary wall', 'Parking', 'Water tank'],
                ],
            ],
            [
                'title' => 'Garden View Weekend Room',
                'user_id' => $guesthouseOwner?->id,
                'business_id' => $guesthouse?->id,
                'type' => 'guesthouse',
                'description' => 'A guesthouse room for visitors who need a central stay near town services.',
                'price' => 780,
                'price_period' => 'night',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'location' => 'Town Centre, Okahandja',
                'town' => 'Okahandja',
                'area' => 'Town Centre',
                'lat' => -21.9821,
                'lng' => 16.9168,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001104',
                    'amenities' => ['Breakfast', 'Wi-Fi', 'Secure parking'],
                ],
            ],
        ];

        foreach ($accommodations as $accommodation) {
            Accommodation::query()->updateOrCreate(
                ['title' => $accommodation['title']],
                $accommodation,
            );
        }
    }
}
