<?php

namespace Tests\Feature;

use App\Models\Accommodation;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccommodationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_accommodation_list_and_details_load(): void
    {
        $listing = Accommodation::query()->where('status', 'published')->firstOrFail();

        $this->getJson('/api/v1/accommodations?town=Windhoek&verified=1')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'title',
                    'type',
                    'price',
                    'owner',
                ]],
            ]);

        $this->getJson("/api/v1/accommodations/{$listing->id}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'type',
                    'price_period',
                    'metadata',
                    'owner',
                ],
            ]);
    }

    public function test_accommodation_filters_apply(): void
    {
        $this->getJson('/api/v1/accommodations?type=property_sale&bedrooms=3&town=Windhoek')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Family House in Eros');
    }

    public function test_authenticated_user_can_create_accommodation(): void
    {
        $user = User::where('email', 'citizen@lokals.test')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/accommodations', [
            'type' => 'rental',
            'title' => 'Khomasdal Studio Flat',
            'description' => 'Compact local rental close to taxis.',
            'price' => 4300,
            'price_period' => 'month',
            'town' => 'Windhoek',
            'area' => 'Khomasdal',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'metadata' => [
                'contact_phone' => '+264810000002',
                'amenities' => ['Wi-Fi'],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Khomasdal Studio Flat');
    }

    public function test_required_fields_are_validated_for_accommodation_creation(): void
    {
        $user = User::where('email', 'citizen@lokals.test')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/accommodations', [
            'type' => 'rental',
            'title' => '',
            'price' => '',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'price', 'price_period', 'town', 'area']);
    }
}
