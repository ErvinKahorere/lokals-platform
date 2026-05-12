<?php

namespace Database\Seeders;

use App\Models\CommunityProject;
use App\Models\CommunityProjectCategory;
use App\Models\CommunityProjectUpdate;
use App\Models\Follow;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoCommunityProjectSeeder extends Seeder
{
    public function run(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->first();
        $manager = User::query()->where('email', 'manager@lokals.app')->first();
        $organization = Organization::query()->where('name', 'Okahandja Town Council')->first();

        if (! $resident || ! $manager) {
            return;
        }

        $cleanupCategory = CommunityProjectCategory::query()->where('slug', 'community-cleanup')->first();
        $schoolCategory = CommunityProjectCategory::query()->where('slug', 'school-support')->first();

        if (! $cleanupCategory || ! $schoolCategory) {
            return;
        }

        $cleanup = CommunityProject::query()->updateOrCreate(
            ['slug' => 'nau-aib-cleanup-drive'],
            [
                'user_id' => $resident->id,
                'organization_id' => $organization?->id,
                'category_id' => $cleanupCategory->id,
                'title' => 'Nau-Aib Cleanup Drive',
                'reference_code' => 'CP-OKA-1001',
                'summary' => 'Residents and local businesses are joining for a weekend cleanup around the main bus stop and market lanes.',
                'description' => 'We need gloves, refuse bags, reflective bibs, and volunteers for a community cleanup around Nau-Aib. The goal is to improve pedestrian safety and reduce illegal dumping hotspots before the next school week begins.',
                'support_needed' => ['Volunteers', 'Materials', 'Community cleanup support'],
                'target_items' => [
                    ['label' => 'Refuse bags', 'quantity' => 80],
                    ['label' => 'Protective gloves', 'quantity' => 60],
                ],
                'target_volunteers' => 35,
                'current_volunteers' => 12,
                'location_text' => 'Nau-Aib market lanes and bus stop',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'contact_name' => 'Meriam Kambatuku',
                'contact_phone' => '+264810001050',
                'contact_whatsapp' => '+264810001050',
                'contact_email' => 'resident@lokals.app',
                'status' => 'active',
                'verification_status' => 'approved',
                'verification_notes' => 'Reviewed and approved for public visibility.',
                'is_verified' => true,
                'is_featured' => true,
                'starts_at' => now()->addDays(2)->setTime(8, 0),
                'ends_at' => now()->addDays(2)->setTime(13, 0),
                'approved_at' => now()->subDay(),
                'approved_by' => $manager->id,
            ],
        );

        CommunityProjectUpdate::query()->updateOrCreate(
            ['community_project_id' => $cleanup->id, 'title' => 'Gloves and bags already pledged'],
            [
                'community_project_id' => $cleanup->id,
                'user_id' => $manager->id,
                'title' => 'Gloves and bags already pledged',
                'body' => 'Three local shops have already committed the first batch of refuse bags and gloves. We still need more volunteers for the Saturday morning shift.',
                'status_after_update' => 'active',
                'progress_percent' => 36,
                'approved_by_town_manager' => true,
            ],
        );

        $school = CommunityProject::query()->updateOrCreate(
            ['slug' => 'winter-school-shoe-drive'],
            [
                'user_id' => $resident->id,
                'category_id' => $schoolCategory->id,
                'title' => 'Winter School Shoe Drive',
                'reference_code' => 'CP-OKA-1002',
                'summary' => 'Collecting school shoes and warm jerseys for learners from vulnerable households before the next cold spell.',
                'description' => 'This community drive is collecting good-condition school shoes, jerseys, and stationery support for learners around Okahandja. Small sponsorships are also welcome for emergency purchases where sizes are missing.',
                'support_needed' => ['School support', 'Clothing support', 'Sponsorship'],
                'target_amount' => 8500,
                'current_amount' => 2200,
                'target_items' => [
                    ['label' => 'Pairs of school shoes', 'quantity' => 45],
                    ['label' => 'Warm jerseys', 'quantity' => 45],
                ],
                'current_items' => [
                    ['label' => 'Pairs of school shoes', 'quantity' => 11],
                    ['label' => 'Warm jerseys', 'quantity' => 8],
                ],
                'location_text' => 'Pickup coordination via Nau-Aib and Town Centre volunteers',
                'town' => 'Okahandja',
                'area' => 'Town Centre',
                'contact_name' => 'Meriam Kambatuku',
                'contact_phone' => '+264810001050',
                'contact_whatsapp' => '+264810001050',
                'contact_email' => 'resident@lokals.app',
                'status' => 'needs_support',
                'verification_status' => 'approved',
                'verification_notes' => 'Approved pending weekly progress updates.',
                'is_verified' => true,
                'is_featured' => false,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addWeeks(2),
                'approved_at' => now()->subDays(2),
                'approved_by' => $manager->id,
            ],
        );

        Follow::query()->firstOrCreate([
            'user_id' => $manager->id,
            'followable_type' => CommunityProject::class,
            'followable_id' => $cleanup->id,
        ]);

        Follow::query()->firstOrCreate([
            'user_id' => $resident->id,
            'followable_type' => CommunityProject::class,
            'followable_id' => $school->id,
        ]);
    }
}
