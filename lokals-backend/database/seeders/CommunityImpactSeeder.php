<?php

namespace Database\Seeders;

use App\Models\CommunityImpactBadge;
use App\Models\CommunityImpactReward;
use Illuminate\Database\Seeder;

class CommunityImpactSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['title' => 'Neighbor', 'description' => 'A positive start in local contribution.', 'icon' => 'sparkles', 'category' => 'general', 'points_threshold' => 0],
            ['title' => 'Steady Contributor', 'description' => 'Keeps showing up for the community.', 'icon' => 'heart', 'category' => 'general', 'points_threshold' => 100],
            ['title' => 'Local Helper', 'description' => 'Verified help across local issues and projects.', 'icon' => 'hands-helping', 'category' => 'general', 'points_threshold' => 250],
            ['title' => 'Impact Builder', 'description' => 'Makes a visible difference over time.', 'icon' => 'badge-check', 'category' => 'general', 'points_threshold' => 500],
            ['title' => 'Community Champion', 'description' => 'Outstanding positive contribution to Okahandja.', 'icon' => 'award', 'category' => 'general', 'points_threshold' => 1000],
        ] as $badge) {
            CommunityImpactBadge::query()->updateOrCreate(
                ['title' => $badge['title']],
                [...$badge, 'is_active' => true]
            );
        }

        foreach ([
            ['title' => 'N\$20 airtime voucher', 'description' => 'A small thank-you for verified community impact.', 'reward_type' => 'airtime', 'points_required' => 100, 'quantity_available' => 50, 'sponsor_name' => 'LOKALS Pilot', 'terms' => 'Subject to availability.'],
            ['title' => 'Local shop voucher', 'description' => 'Redeem a voucher at a participating Okahandja business.', 'reward_type' => 'voucher', 'points_required' => 250, 'quantity_available' => 25, 'sponsor_name' => 'Okahandja Partners', 'terms' => 'Available while sponsor stock lasts.'],
            ['title' => 'Sponsored goodie pack', 'description' => 'A small sponsored reward pack for consistent contribution.', 'reward_type' => 'goods', 'points_required' => 500, 'quantity_available' => 10, 'sponsor_name' => 'Community Sponsors', 'terms' => 'Fulfillment may take up to 14 days.'],
            ['title' => 'Recognition certificate', 'description' => 'Formal recognition for sustained positive local contribution.', 'reward_type' => 'recognition', 'points_required' => 1000, 'quantity_available' => null, 'sponsor_name' => 'Okahandja Municipality', 'terms' => 'Issued after approval and identity confirmation.'],
        ] as $reward) {
            CommunityImpactReward::query()->updateOrCreate(
                ['title' => $reward['title']],
                [...$reward, 'is_active' => true]
            );
        }
    }
}
