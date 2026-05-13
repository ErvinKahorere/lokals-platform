<?php

namespace Database\Seeders;

use App\Models\SearchSuggestion;
use App\Models\VerificationBadge;
use Illuminate\Database\Seeder;

class RealtimeInfrastructureSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['key' => 'verified_town', 'title' => 'Verified Town Account', 'description' => 'Official municipality or town account.', 'scope' => 'organization', 'icon' => 'account_balance', 'tone' => 'brand'],
            ['key' => 'verified_business', 'title' => 'Verified Business', 'description' => 'Trusted local business profile.', 'scope' => 'organization', 'icon' => 'storefront', 'tone' => 'success'],
            ['key' => 'verified_service_provider', 'title' => 'Verified Service Provider', 'description' => 'Trusted provider with verified details.', 'scope' => 'service_provider', 'icon' => 'verified', 'tone' => 'success'],
            ['key' => 'community_contributor', 'title' => 'Community Contributor', 'description' => 'Positive civic contribution recognised privately and responsibly.', 'scope' => 'user', 'icon' => 'volunteer_activism', 'tone' => 'brand'],
            ['key' => 'trusted_seller', 'title' => 'Trusted Seller', 'description' => 'Marketplace seller with healthy response and fulfillment history.', 'scope' => 'listing', 'icon' => 'workspace_premium', 'tone' => 'success'],
            ['key' => 'fast_responder', 'title' => 'Fast Responder', 'description' => 'Responds quickly to requests and enquiries.', 'scope' => 'service_provider', 'icon' => 'bolt', 'tone' => 'info'],
        ] as $badge) {
            VerificationBadge::query()->updateOrCreate(['key' => $badge['key']], $badge);
        }

        foreach ([
            ['query' => 'Taxi near me', 'category' => 'transport', 'town' => 'Okahandja', 'area' => 'Nau-Aib', 'hits' => 18, 'popularity' => 32, 'is_trending' => true],
            ['query' => 'Water outage', 'category' => 'alerts', 'town' => 'Okahandja', 'hits' => 25, 'popularity' => 40, 'is_trending' => true],
            ['query' => 'Jobs nearby', 'category' => 'jobs', 'town' => 'Okahandja', 'hits' => 14, 'popularity' => 24, 'is_trending' => false],
            ['query' => 'Verified services', 'category' => 'services', 'town' => 'Okahandja', 'hits' => 12, 'popularity' => 20, 'is_trending' => false],
        ] as $suggestion) {
            SearchSuggestion::query()->updateOrCreate(
                ['query' => $suggestion['query']],
                $suggestion + ['last_used_at' => now()],
            );
        }
    }
}
