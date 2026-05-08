<?php

namespace Tests\Feature;

use App\Models\Product;
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
        $this->getJson('/api/v1/search?q=okahandja')
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
        Sanctum::actingAs(User::where('email', 'resident@lokals.app')->firstOrFail());

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
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $product = Product::query()->firstOrFail();

        $this->postJson('/api/v1/saved-items', [
            'type' => 'product',
            'id' => $product->id,
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
            'id' => $product->id,
        ])->assertOk();
    }
}
