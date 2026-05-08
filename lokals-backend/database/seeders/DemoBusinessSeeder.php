<?php

namespace Database\Seeders;

use Database\Seeders\Support\BuildsDemoRecords;
use Illuminate\Database\Seeder;

class DemoBusinessSeeder extends Seeder
{
    use BuildsDemoRecords;

    public function run(): void
    {
        $businesses = [
            [
                'email' => 'market@lokals.app',
                'user' => [
                    'name' => 'Lukas Nghipandulwa',
                    'phone' => '+264810001101',
                    'location' => 'Town Centre, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Town Centre',
                    'current_role' => 'business_owner',
                    'business_name' => 'Okahandja Fresh Market',
                    'lat' => -21.9832,
                    'lng' => 16.9179,
                ],
                'organization' => [
                    'name' => 'Okahandja Fresh Market',
                    'category' => 'retail',
                    'subcategory' => 'grocery_store',
                    'description' => 'Neighbourhood produce, pantry staples, and household basics for daily shopping.',
                    'phone' => '+264610001101',
                    'email' => 'market@lokals.app',
                    'whatsapp' => '+264810001101',
                    'location' => 'Town Centre, Okahandja',
                    'town' => 'Okahandja',
                    'area' => 'Town Centre',
                    'lat' => -21.9832,
                    'lng' => 16.9179,
                    'is_verified' => true,
                    'status' => 'active',
                    'opening_hours' => [['day' => 'Mon-Sat', 'open' => '07:30', 'close' => '19:00']],
                    'services_offered' => ['Fresh produce', 'Bulk maize meal', 'Mobile payments'],
                    'rates' => [['name' => 'Delivery within town', 'price' => 'N$35']],
                ],
            ],
            [
                'email' => 'pharmacy@lokals.app',
                'user' => [
                    'name' => 'Selma Uanivi',
                    'phone' => '+264810001102',
                    'location' => 'Nau-Aib, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Nau-Aib',
                    'current_role' => 'business_owner',
                    'business_name' => 'Nau-Aib Pharmacy',
                    'lat' => -21.9874,
                    'lng' => 16.9111,
                ],
                'organization' => [
                    'name' => 'Nau-Aib Pharmacy',
                    'category' => 'healthcare',
                    'subcategory' => 'pharmacy',
                    'description' => 'Daily essentials, prescriptions, wellness support, and family health products.',
                    'phone' => '+264610001102',
                    'email' => 'pharmacy@lokals.app',
                    'whatsapp' => '+264810001102',
                    'location' => 'Nau-Aib, Okahandja',
                    'town' => 'Okahandja',
                    'area' => 'Nau-Aib',
                    'lat' => -21.9874,
                    'lng' => 16.9111,
                    'is_verified' => true,
                    'status' => 'active',
                    'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '18:00']],
                    'services_offered' => ['Prescription pickup', 'Wellness advice', 'OTC medicine'],
                    'rates' => [['name' => 'Blood pressure check', 'price' => 'N$40']],
                ],
            ],
            [
                'email' => 'hardware@lokals.app',
                'user' => [
                    'name' => 'Martha Kahuika',
                    'phone' => '+264810001103',
                    'location' => 'Five Rand, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Five Rand',
                    'current_role' => 'business_owner',
                    'business_name' => 'Five Rand Hardware',
                    'lat' => -21.9797,
                    'lng' => 16.9231,
                ],
                'organization' => [
                    'name' => 'Five Rand Hardware',
                    'category' => 'retail',
                    'subcategory' => 'hardware_store',
                    'description' => 'Building materials, tools, fittings, and fast-moving repair supplies.',
                    'phone' => '+264610001103',
                    'email' => 'hardware@lokals.app',
                    'whatsapp' => '+264810001103',
                    'location' => 'Five Rand, Okahandja',
                    'town' => 'Okahandja',
                    'area' => 'Five Rand',
                    'lat' => -21.9797,
                    'lng' => 16.9231,
                    'is_verified' => true,
                    'status' => 'active',
                    'opening_hours' => [['day' => 'Mon-Sat', 'open' => '07:45', 'close' => '17:30']],
                    'services_offered' => ['Hardware supplies', 'Paint mixing', 'Pipe fittings'],
                    'rates' => [['name' => '20kg cement', 'price' => 'N$115']],
                ],
            ],
            [
                'email' => 'guesthouse@lokals.app',
                'user' => [
                    'name' => 'Anna Tjiramba',
                    'phone' => '+264810001104',
                    'location' => 'Town Centre, Okahandja',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Town Centre',
                    'current_role' => 'business_owner',
                    'business_name' => 'Garden View Guesthouse',
                    'lat' => -21.9821,
                    'lng' => 16.9168,
                ],
                'organization' => [
                    'name' => 'Garden View Guesthouse',
                    'category' => 'hospitality',
                    'subcategory' => 'guesthouse',
                    'description' => 'Comfortable short stays for families, business visitors, and weekend travellers.',
                    'phone' => '+264610001104',
                    'email' => 'guesthouse@lokals.app',
                    'whatsapp' => '+264810001104',
                    'location' => 'Town Centre, Okahandja',
                    'town' => 'Okahandja',
                    'area' => 'Town Centre',
                    'lat' => -21.9821,
                    'lng' => 16.9168,
                    'is_verified' => true,
                    'status' => 'active',
                    'opening_hours' => [['day' => 'Daily', 'open' => '06:00', 'close' => '22:00']],
                    'services_offered' => ['Rooms', 'Breakfast', 'Airport pickup'],
                    'rates' => [['name' => 'Standard room', 'price' => 'N$780']],
                ],
            ],
            [
                'email' => 'butchery@lokals.app',
                'user' => [
                    'name' => 'Joel Hamutenya',
                    'phone' => '+264810001105',
                    'location' => 'Okahandja Industrial Area',
                    'default_town' => 'Okahandja',
                    'default_area' => 'Industrial Area',
                    'current_role' => 'business_owner',
                    'business_name' => 'Riverbend Butchery',
                    'lat' => -21.9733,
                    'lng' => 16.9289,
                ],
                'organization' => [
                    'name' => 'Riverbend Butchery',
                    'category' => 'food',
                    'subcategory' => 'butchery',
                    'description' => 'Local meat cuts, braai packs, and bulk orders for homes and events.',
                    'phone' => '+264610001105',
                    'email' => 'butchery@lokals.app',
                    'whatsapp' => '+264810001105',
                    'location' => 'Okahandja Industrial Area',
                    'town' => 'Okahandja',
                    'area' => 'Industrial Area',
                    'lat' => -21.9733,
                    'lng' => 16.9289,
                    'is_verified' => true,
                    'status' => 'active',
                    'opening_hours' => [['day' => 'Mon-Sat', 'open' => '08:00', 'close' => '18:00']],
                    'services_offered' => ['Braai packs', 'Bulk orders', 'Freezer packs'],
                    'rates' => [['name' => 'Family braai pack', 'price' => 'N$290']],
                ],
            ],
        ];

        foreach ($businesses as $business) {
            $owner = $this->upsertUser(
                $business['email'],
                $business['user'],
                ['business_owner', 'seller'],
                [
                    'bio' => "{$business['organization']['name']} owner on the LOKALS Okahandja demo.",
                ],
                [
                    'interests' => ['Sales', 'Customer updates', 'Business growth'],
                ],
            );

            $this->upsertOrganization(
                $business['organization']['name'],
                [
                    'owner_user_id' => $owner->id,
                    ...$business['organization'],
                ],
            );
        }
    }
}
