<?php

namespace Tests\Feature;

use App\Models\FeedCategory;
use App\Models\FeedPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedFoundationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_feed_only_returns_approved_posts(): void
    {
        $category = FeedCategory::query()->create([
            'name' => 'Announcements',
            'slug' => 'announcements',
            'is_active' => true,
            'priority' => 90,
        ]);

        FeedPost::query()->create([
            'title' => 'Approved post',
            'category_id' => $category->id,
            'status' => 'approved',
            'published_at' => now(),
        ]);

        FeedPost::query()->create([
            'title' => 'Pending post',
            'category_id' => $category->id,
            'status' => 'pending',
        ]);

        $this->getJson('/api/v1/feed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Approved post');
    }

    public function test_authenticated_user_can_save_hide_and_report_posts(): void
    {
        $user = User::factory()->create();
        $category = FeedCategory::query()->create([
            'name' => 'Announcements',
            'slug' => 'announcements',
            'is_active' => true,
            'priority' => 90,
        ]);

        $post = FeedPost::query()->create([
            'title' => 'Approved post',
            'category_id' => $category->id,
            'status' => 'approved',
            'published_at' => now(),
        ]);

        $this->actingAs($user)
            ->postJson("/api/v1/feed/{$post->id}/save")
            ->assertCreated();

        $this->actingAs($user)
            ->postJson("/api/v1/feed/{$post->id}/hide")
            ->assertOk();

        $this->actingAs($user)
            ->postJson("/api/v1/feed/{$post->id}/report", ['reason' => 'Needs review'])
            ->assertCreated();
    }
}
