<?php

namespace Tests\Feature;

use App\Models\NewsItem;
use App\Models\NewsSource;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_news_index_returns_filtered_items(): void
    {
        $source = NewsSource::query()->create([
            'name' => 'The Namibian',
            'website_url' => 'https://www.namibian.com.na',
            'source_type' => 'publication',
            'is_active' => true,
        ]);

        NewsItem::query()->create([
            'news_source_id' => $source->id,
            'title' => 'Okahandja clinic adds weekend support',
            'summary' => 'Weekend support is expanding.',
            'source_name' => 'The Namibian',
            'source_url' => 'https://www.namibian.com.na',
            'external_url' => 'https://www.namibian.com.na/story-1',
            'category' => 'health',
            'town' => 'Okahandja',
            'region' => 'Otjozondjupa',
            'tags' => ['health', 'okahandja'],
            'source_type' => 'publication',
            'published_at' => now(),
            'fetched_at' => now(),
        ]);

        NewsItem::query()->create([
            'news_source_id' => $source->id,
            'title' => 'Walvis Bay logistics update',
            'summary' => 'Port and trucking update.',
            'source_name' => 'The Namibian',
            'source_url' => 'https://www.namibian.com.na',
            'external_url' => 'https://www.namibian.com.na/story-2',
            'category' => 'business',
            'town' => 'Swakopmund',
            'region' => 'Erongo',
            'tags' => ['business'],
            'source_type' => 'publication',
            'published_at' => now()->subHour(),
            'fetched_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/news?town=Okahandja&category=health');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Okahandja clinic adds weekend support')
            ->assertJsonCount(1, 'data');
    }

    public function test_personalized_news_feed_prioritizes_user_location(): void
    {
        $source = NewsSource::query()->create([
            'name' => 'New Era',
            'website_url' => 'https://neweralive.na',
            'source_type' => 'publication',
            'is_active' => true,
        ]);

        $okahandja = NewsItem::query()->create([
            'news_source_id' => $source->id,
            'title' => 'Okahandja transport rush expected tonight',
            'summary' => 'Taxi and commute demand are rising tonight.',
            'source_name' => 'New Era',
            'source_url' => 'https://neweralive.na',
            'external_url' => 'https://neweralive.na/story-1',
            'category' => 'transport',
            'town' => 'Okahandja',
            'region' => 'Otjozondjupa',
            'tags' => ['transport', 'commute'],
            'source_type' => 'publication',
            'published_at' => now()->subHour(),
            'fetched_at' => now(),
        ]);

        NewsItem::query()->create([
            'news_source_id' => $source->id,
            'title' => 'Coastal sports roundup',
            'summary' => 'Regional sports highlights.',
            'source_name' => 'New Era',
            'source_url' => 'https://neweralive.na',
            'external_url' => 'https://neweralive.na/story-2',
            'category' => 'sports',
            'town' => 'Swakopmund',
            'region' => 'Erongo',
            'tags' => ['sports'],
            'source_type' => 'publication',
            'published_at' => now(),
            'fetched_at' => now(),
        ]);

        $user = User::factory()->create([
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
        ]);

        UserPreference::query()->create([
            'user_id' => $user->id,
            'default_town' => 'Okahandja',
            'default_area' => 'Nau-Aib',
            'interests' => ['transport'],
            'preferred_roles' => ['citizen'],
            'notification_preferences' => [],
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/news/feed');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.id', $okahandja->id)
            ->assertJsonPath('data.0.feed_reason', 'near your town');
    }

    public function test_news_detail_returns_summary_related_items_and_compliance_fields(): void
    {
        $source = NewsSource::query()->create([
            'name' => 'City of Windhoek',
            'website_url' => 'https://www.windhoekcc.org.na',
            'source_type' => 'municipality',
            'town' => 'Windhoek',
            'region' => 'Khomas',
            'is_active' => true,
        ]);

        $featured = NewsItem::query()->create([
            'news_source_id' => $source->id,
            'title' => 'Water maintenance update for central Windhoek',
            'summary' => 'The city has revised service windows for water maintenance.',
            'source_name' => 'City of Windhoek',
            'source_url' => 'https://www.windhoekcc.org.na',
            'external_url' => 'https://www.windhoekcc.org.na/notices/water-maintenance-update',
            'category' => 'public_notice',
            'town' => 'Windhoek',
            'area' => 'CBD',
            'region' => 'Khomas',
            'tags' => ['water', 'public notice'],
            'source_type' => 'municipality',
            'published_at' => now(),
            'fetched_at' => now(),
            'is_featured' => true,
        ]);

        NewsItem::query()->create([
            'news_source_id' => $source->id,
            'title' => 'School support open day announced',
            'summary' => 'Families are invited to the upcoming enrolment support open day.',
            'source_name' => 'City of Windhoek',
            'source_url' => 'https://www.windhoekcc.org.na',
            'external_url' => 'https://www.windhoekcc.org.na/notices/school-open-day',
            'category' => 'education',
            'town' => 'Windhoek',
            'area' => 'Wanaheda',
            'region' => 'Khomas',
            'tags' => ['education'],
            'source_type' => 'municipality',
            'published_at' => now()->subHour(),
            'fetched_at' => now(),
        ]);

        $this->getJson("/api/v1/news/{$featured->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $featured->id)
            ->assertJsonPath('data.summary', 'The city has revised service windows for water maintenance.')
            ->assertJsonPath('data.source_domain', 'www.windhoekcc.org.na')
            ->assertJsonPath('data.compliance_notice', 'Content is provided by external sources. LOKALS does not own this content.')
            ->assertJsonCount(1, 'related');
    }
}
