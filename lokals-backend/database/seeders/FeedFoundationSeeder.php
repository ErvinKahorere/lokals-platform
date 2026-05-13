<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Announcement;
use App\Models\CommunityProject;
use App\Models\Event;
use App\Models\FeedCategory;
use App\Models\FeedPost;
use App\Models\FeedSource;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\NewsItem;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class FeedFoundationSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Town Announcements', 'slug' => 'announcements', 'icon' => 'campaign', 'priority' => 90],
            ['name' => 'Emergency Notices', 'slug' => 'emergency', 'icon' => 'warning', 'priority' => 100],
            ['name' => 'Events', 'slug' => 'events', 'icon' => 'event', 'priority' => 70],
            ['name' => 'Marketplace', 'slug' => 'marketplace', 'icon' => 'storefront', 'priority' => 45],
            ['name' => 'Jobs', 'slug' => 'jobs', 'icon' => 'work', 'priority' => 55],
            ['name' => 'Community Projects', 'slug' => 'community-projects', 'icon' => 'volunteer_activism', 'priority' => 65],
            ['name' => 'News', 'slug' => 'news', 'icon' => 'newspaper', 'priority' => 50],
            ['name' => 'Service Alerts', 'slug' => 'service-alerts', 'icon' => 'notifications_active', 'priority' => 85],
        ])->mapWithKeys(function (array $category) {
            $model = FeedCategory::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'is_active' => true]
            );

            return [$category['slug'] => $model];
        });

        $sources = collect([
            ['name' => 'Okahandja Town Council', 'source_type' => 'organization', 'source_key' => 'okahandja-town-council'],
            ['name' => 'LOKALS Community Feed', 'source_type' => 'platform', 'source_key' => 'lokals-community-feed'],
            ['name' => 'LOKALS Marketplace Highlights', 'source_type' => 'platform', 'source_key' => 'lokals-marketplace'],
        ])->mapWithKeys(function (array $source) {
            $organization = Organization::query()->where('name', $source['name'])->first();
            $model = FeedSource::query()->updateOrCreate(
                ['source_key' => $source['source_key']],
                [
                    ...$source,
                    'organization_id' => $organization?->id,
                    'is_active' => true,
                ]
            );

            return [$source['source_key'] => $model];
        });

        foreach (Announcement::query()->latest('published_at')->limit(8)->get() as $announcement) {
            FeedPost::query()->updateOrCreate(
                ['source_type' => Announcement::class, 'source_id' => $announcement->id],
                [
                    'feed_source_id' => $sources['okahandja-town-council']->id,
                    'category_id' => $categories['announcements']->id,
                    'title' => $announcement->title,
                    'summary' => $announcement->body,
                    'body' => $announcement->body,
                    'town' => 'Okahandja',
                    'status' => 'approved',
                    'priority' => 90,
                    'published_at' => $announcement->published_at ?? $announcement->updated_at,
                    'approved_at' => now(),
                    'metadata' => ['tags' => ['announcement', 'council']],
                ]
            );
        }

        foreach (Alert::query()->latest()->limit(8)->get() as $alert) {
            FeedPost::query()->updateOrCreate(
                ['source_type' => Alert::class, 'source_id' => $alert->id],
                [
                    'feed_source_id' => $sources['okahandja-town-council']->id,
                    'category_id' => $categories[$alert->priority === 'high' ? 'emergency' : 'service-alerts']->id,
                    'title' => $alert->title,
                    'summary' => $alert->body,
                    'body' => $alert->body,
                    'town' => $alert->town,
                    'area' => $alert->area,
                    'status' => 'approved',
                    'priority' => $alert->priority === 'high' ? 100 : 80,
                    'is_featured' => $alert->priority === 'high',
                    'published_at' => $alert->starts_at ?? $alert->created_at,
                    'approved_at' => now(),
                    'metadata' => ['tags' => ['alert', $alert->type]],
                ]
            );
        }

        foreach (NewsItem::query()->latest('published_at')->limit(8)->get() as $newsItem) {
            FeedPost::query()->updateOrCreate(
                ['source_type' => NewsItem::class, 'source_id' => $newsItem->id],
                [
                    'feed_source_id' => $sources['okahandja-town-council']->id,
                    'category_id' => $categories['news']->id,
                    'title' => $newsItem->title,
                    'summary' => $newsItem->summary,
                    'body' => $newsItem->summary,
                    'media_url' => $newsItem->image_url,
                    'external_url' => $newsItem->external_url,
                    'town' => $newsItem->town,
                    'area' => $newsItem->area,
                    'status' => 'approved',
                    'priority' => $newsItem->is_featured ? 70 : 45,
                    'is_featured' => (bool) $newsItem->is_featured,
                    'published_at' => $newsItem->published_at,
                    'approved_at' => now(),
                    'metadata' => ['tags' => $newsItem->tags ?? []],
                ]
            );
        }

        foreach (Event::query()->where('status', 'published')->orderBy('starts_at')->limit(8)->get() as $event) {
            FeedPost::query()->updateOrCreate(
                ['source_type' => Event::class, 'source_id' => $event->id],
                [
                    'feed_source_id' => $sources['lokals-community-feed']->id,
                    'category_id' => $categories['events']->id,
                    'title' => $event->title,
                    'summary' => $event->description,
                    'body' => $event->description,
                    'media_url' => $event->image_url,
                    'town' => $event->town,
                    'area' => $event->area,
                    'status' => 'approved',
                    'priority' => $event->is_featured ? 70 : 55,
                    'is_featured' => (bool) $event->is_featured,
                    'published_at' => $event->starts_at,
                    'approved_at' => now(),
                    'metadata' => ['tags' => [$event->category, 'event']],
                ]
            );
        }

        foreach (Listing::query()->latest()->limit(8)->get() as $listing) {
            FeedPost::query()->updateOrCreate(
                ['source_type' => Listing::class, 'source_id' => $listing->id],
                [
                    'feed_source_id' => $sources['lokals-marketplace']->id,
                    'category_id' => $categories['marketplace']->id,
                    'title' => $listing->title,
                    'summary' => $listing->description,
                    'body' => $listing->description,
                    'media_url' => $listing->metadata['image_url'] ?? null,
                    'town' => $listing->town,
                    'area' => $listing->area,
                    'status' => 'approved',
                    'priority' => 40,
                    'published_at' => $listing->created_at,
                    'approved_at' => now(),
                    'metadata' => ['tags' => [$listing->type, 'listing']],
                ]
            );
        }

        foreach (JobPost::query()->latest()->limit(8)->get() as $jobPost) {
            FeedPost::query()->updateOrCreate(
                ['source_type' => JobPost::class, 'source_id' => $jobPost->id],
                [
                    'feed_source_id' => $sources['lokals-community-feed']->id,
                    'category_id' => $categories['jobs']->id,
                    'title' => $jobPost->title,
                    'summary' => $jobPost->description,
                    'body' => $jobPost->description,
                    'town' => $jobPost->town,
                    'area' => $jobPost->area,
                    'status' => 'approved',
                    'priority' => 52,
                    'published_at' => $jobPost->created_at,
                    'approved_at' => now(),
                    'metadata' => ['tags' => ['job', $jobPost->job_type ?? 'work']],
                ]
            );
        }

        foreach (CommunityProject::query()->where('verification_status', 'approved')->latest()->limit(8)->get() as $project) {
            FeedPost::query()->updateOrCreate(
                ['source_type' => CommunityProject::class, 'source_id' => $project->id],
                [
                    'feed_source_id' => $sources['lokals-community-feed']->id,
                    'category_id' => $categories['community-projects']->id,
                    'title' => $project->title,
                    'summary' => $project->summary,
                    'body' => $project->description,
                    'town' => $project->town,
                    'area' => $project->area,
                    'status' => 'approved',
                    'priority' => $project->is_featured ? 68 : 58,
                    'is_featured' => (bool) $project->is_featured,
                    'published_at' => $project->approved_at ?? $project->created_at,
                    'approved_at' => $project->approved_at ?? now(),
                    'metadata' => ['tags' => ['community', 'project']],
                ]
            );
        }
    }
}
