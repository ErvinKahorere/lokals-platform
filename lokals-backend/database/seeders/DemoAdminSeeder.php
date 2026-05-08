<?php

namespace Database\Seeders;

use Database\Seeders\Support\BuildsDemoRecords;
use Illuminate\Database\Seeder;

class DemoAdminSeeder extends Seeder
{
    use BuildsDemoRecords;

    public function run(): void
    {
        $this->upsertUser(
            'admin@lokals.app',
            [
                'name' => 'LOKALS Platform Admin',
                'phone' => '+264810001000',
                'location' => 'Central Okahandja',
                'default_town' => 'Okahandja',
                'default_area' => 'Town Centre',
                'current_role' => 'super_admin',
                'whatsapp' => '+264810001000',
                'lat' => -21.9837,
                'lng' => 16.9184,
            ],
            ['super_admin'],
            [
                'bio' => 'Production-safe demo super admin for LOKALS QA and MVP walkthroughs.',
            ],
            [
                'interests' => ['Platform oversight', 'Moderation', 'Business operations'],
            ],
        );
    }
}
