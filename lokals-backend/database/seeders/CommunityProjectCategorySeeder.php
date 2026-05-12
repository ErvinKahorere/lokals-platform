<?php

namespace Database\Seeders;

use App\Models\CommunityProjectCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CommunityProjectCategorySeeder extends Seeder
{
    private const CATEGORIES = [
        ['name' => 'Charity Drive', 'icon' => 'volunteer_activism'],
        ['name' => 'Food Donation', 'icon' => 'lunch_dining'],
        ['name' => 'Clothing Donation', 'icon' => 'checkroom'],
        ['name' => 'School Support', 'icon' => 'school'],
        ['name' => 'Medical Support', 'icon' => 'medical_services'],
        ['name' => 'Youth & Sports', 'icon' => 'sports_soccer'],
        ['name' => 'Elderly Support', 'icon' => 'escalator_warning'],
        ['name' => 'Disability Support', 'icon' => 'accessible'],
        ['name' => 'Community Cleanup', 'icon' => 'delete_sweep'],
        ['name' => 'Environmental Project', 'icon' => 'eco'],
        ['name' => 'Animal Welfare', 'icon' => 'pets'],
        ['name' => 'Infrastructure Support', 'icon' => 'construction'],
        ['name' => 'Skills & Training', 'icon' => 'workspace_premium'],
        ['name' => 'Volunteer Work', 'icon' => 'groups'],
        ['name' => 'Fundraising', 'icon' => 'payments'],
        ['name' => 'Other', 'icon' => 'category'],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $index => $category) {
            CommunityProjectCategory::query()->updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'slug' => Str::slug($category['name']),
                    'icon' => $category['icon'],
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }
}
