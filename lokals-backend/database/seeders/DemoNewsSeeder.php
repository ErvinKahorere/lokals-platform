<?php

namespace Database\Seeders;

use App\Models\NewsItem;
use App\Models\NewsSource;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoNewsSeeder extends Seeder
{
    public function run(): void
    {
        $source = NewsSource::query()->updateOrCreate(
            ['name' => 'Okahandja Town Council Updates'],
            [
                'website_url' => 'https://lokals-platform.onrender.com',
                'feed_url' => 'https://lokals-platform.onrender.com/api/v1/news',
                'source_type' => 'municipality',
                'town' => 'Okahandja',
                'region' => 'Otjozondjupa',
                'is_active' => true,
                'last_fetched_at' => now(),
            ],
        );

        $posts = [
            [
                'title' => 'Water valve maintenance scheduled for Nau-Aib',
                'summary' => 'Residents in Nau-Aib should expect a short maintenance window while the municipal team replaces a damaged valve.',
                'category' => 'infrastructure',
                'area' => 'Nau-Aib',
                'tags' => ['water', 'maintenance', 'public notice'],
            ],
            [
                'title' => 'Weekend market stalls open for local traders',
                'summary' => 'The council has opened additional low-cost stalls for fresh produce sellers and home-based traders this month.',
                'category' => 'business',
                'area' => 'Town Centre',
                'tags' => ['market', 'traders', 'local business'],
            ],
            [
                'title' => 'Taxi rank lighting upgrade enters final phase',
                'summary' => 'Evening works around the taxi rank continue this week to improve visibility and commuter safety.',
                'category' => 'transport',
                'area' => 'Town Centre',
                'tags' => ['transport', 'lighting', 'safety'],
            ],
            [
                'title' => 'Youth study support registration opens next Monday',
                'summary' => 'Parents and learners can register for the new after-school support programme at the community desk.',
                'category' => 'community',
                'area' => 'Nau-Aib',
                'tags' => ['education', 'youth', 'registration'],
            ],
            [
                'title' => 'Emergency contact refresher shared ahead of winter season',
                'summary' => 'The town manager office has republished emergency numbers for clinic, police, and fire response services.',
                'category' => 'safety',
                'area' => 'Town Centre',
                'tags' => ['emergency', 'contacts', 'winter readiness'],
            ],
        ];

        foreach ($posts as $index => $post) {
            $externalUrl = sprintf(
                '%s#%s',
                $source->website_url,
                Str::slug($post['title']),
            );

            NewsItem::query()->updateOrCreate(
                ['title' => $post['title']],
                [
                    'news_source_id' => $source->id,
                    'title' => $post['title'],
                    'summary' => $post['summary'],
                    'source_name' => $source->name,
                    'source_url' => $source->website_url,
                    'external_url' => $externalUrl,
                    'image_url' => null,
                    'category' => $post['category'],
                    'town' => 'Okahandja',
                    'area' => $post['area'],
                    'region' => 'Otjozondjupa',
                    'tags' => $post['tags'],
                    'is_featured' => $index < 2,
                    'is_hidden' => false,
                    'published_at' => now()->subDays(5 - $index),
                    'fetched_at' => now()->subDays(5 - $index),
                    'source_type' => 'municipality',
                ],
            );
        }
    }
}
