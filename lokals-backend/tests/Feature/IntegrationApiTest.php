<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_search_returns_grouped_results(): void
    {
        $this->getJson('/api/v1/search?q=windhoek')
            ->assertOk()
            ->assertJsonStructure([
                'services',
                'providers',
                'directory',
                'products',
                'jobs',
                'events',
                'news',
                'accommodations',
            ]);
    }

    public function test_activity_returns_unified_items(): void
    {
        Sanctum::actingAs(User::where('email', 'citizen@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/activity')
            ->assertOk()
            ->assertJsonStructure([
                'summary',
                'data' => [
                    '*' => ['type', 'title', 'body', 'route'],
                ],
            ]);
    }

    public function test_saved_items_can_be_listed_created_and_removed(): void
    {
        $user = User::where('email', 'citizen@lokals.test')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/saved-items', [
            'type' => 'product',
            'id' => 1,
        ])->assertCreated();

        $this->getJson('/api/v1/saved-items')
            ->assertOk()
            ->assertJsonStructure([
                'counts',
                'items',
                'products',
                'events',
                'providers',
                'directory',
            ]);

        $this->deleteJson('/api/v1/saved-items', [
            'type' => 'product',
            'id' => 1,
        ])->assertOk();
    }
}
