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
        $resident = User::query()->where('email', 'resident@lokals.app')->first();

        $guesthouse = Organization::query()->where('name', 'Garden View Guesthouse')->first();
        $hardware = Organization::query()->where('name', 'Five Rand Hardware')->first();

        $accommodations = [
            [
                'title' => 'Nau-Aib Room Rental',
                'user_id' => $resident?->id,
                'type' => 'guest_room',
                'description' => 'An affordable furnished room close to taxis, schools, and daily shopping.',
                'price' => 2400,
                'price_period' => 'month',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'location' => 'Nau-Aib Extension 2',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'lat' => -21.9872,
                'lng' => 16.9114,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001050',
                    'contact_whatsapp' => '+264810001050',
                    'amenities' => ['Shared kitchen', 'Water included', 'Secure gate'],
                    'rules' => ['No smoking indoors'],
                    'availability' => 'Available from next week.',
                ],
            ],
            [
                'title' => 'Central Okahandja Flat Rental',
                'user_id' => $resident?->id,
                'type' => 'rental',
                'description' => 'A compact flat with quick access to town services, taxis, and shopping.',
                'price' => 5200,
                'price_period' => 'month',
                'bedrooms' => 2,
                'bathrooms' => 1,
                'location' => 'Central Okahandja',
                'town' => 'Okahandja',
                'area' => 'Central Okahandja',
                'lat' => -21.9838,
                'lng' => 16.9176,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001051',
                    'contact_whatsapp' => '+264810001051',
                    'amenities' => ['Private bathroom', 'Parking', 'Prepaid electricity'],
                    'availability' => 'Ready for immediate move-in.',
                ],
            ],
            [
                'title' => 'Gross Barmen Road Short Stay',
                'user_id' => $guesthouseOwner?->id,
                'business_id' => $guesthouse?->id,
                'type' => 'short_stay',
                'description' => 'A short-stay option with breakfast and easy access to the Gross Barmen Road corridor.',
                'price' => 690,
                'price_period' => 'night',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'location' => 'Gross Barmen Road Area',
                'town' => 'Okahandja',
                'area' => 'Gross Barmen Road Area',
                'lat' => -21.9759,
                'lng' => 16.9041,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001104',
                    'contact_whatsapp' => '+264810001104',
                    'amenities' => ['Breakfast', 'Wi-Fi', 'Secure parking'],
                    'rules' => ['Quiet after 22:00'],
                    'availability' => 'Open for weekend and weekday stays.',
                ],
            ],
            [
                'title' => 'Garden View Guesthouse Room',
                'user_id' => $guesthouseOwner?->id,
                'business_id' => $guesthouse?->id,
                'type' => 'guesthouse',
                'description' => 'A guesthouse room for visitors who need a calm stay near local services.',
                'price' => 780,
                'price_period' => 'night',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'location' => 'Okahandja Park',
                'town' => 'Okahandja',
                'area' => 'Okahandja Park',
                'lat' => -21.9821,
                'lng' => 16.9168,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001104',
                    'contact_whatsapp' => '+264810001104',
                    'amenities' => ['Breakfast', 'Wi-Fi', 'Secure parking'],
                    'availability' => 'Rooms available this week.',
                ],
            ],
            [
                'title' => 'Osona Family House for Sale',
                'user_id' => $hardwareOwner?->id,
                'business_id' => $hardware?->id,
                'type' => 'property_sale',
                'description' => 'A modern family home with yard space and direct access to the Osona growth corridor.',
                'price' => 1185000,
                'price_period' => 'once',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'location' => 'Osona',
                'town' => 'Okahandja',
                'area' => 'Osona',
                'lat' => -21.9312,
                'lng' => 16.9342,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001103',
                    'contact_whatsapp' => '+264810001103',
                    'amenities' => ['Boundary wall', 'Parking', 'Water tank'],
                    'availability' => 'Viewings available by appointment.',
                ],
            ],
            [
                'title' => 'Nau-Aib Family Rental House',
                'user_id' => $hardwareOwner?->id,
                'business_id' => $hardware?->id,
                'type' => 'rental',
                'description' => 'A larger family rental with yard space and room for long-term local living.',
                'price' => 7600,
                'price_period' => 'month',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'location' => 'Nau-Aib Extension 5',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'lat' => -21.9864,
                'lng' => 16.9127,
                'status' => 'published',
                'metadata' => [
                    'contact_phone' => '+264810001103',
                    'contact_whatsapp' => '+264810001103',
                    'amenities' => ['Yard', 'Parking', 'Water tank'],
                    'rules' => ['Long-term tenants preferred'],
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
