<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_protected_routes_return_standard_unauthenticated_json(): void
    {
        $this->getJson('/api/v1/me')
            ->assertUnauthorized()
            ->assertExactJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_missing_resource_returns_standard_not_found_json(): void
    {
        Sanctum::actingAs(User::where('email', 'citizen@lokals.test')->firstOrFail());

        $this->getJson('/api/v1/store/products/999999')
            ->assertNotFound()
            ->assertExactJson([
                'message' => 'Resource not found.',
            ]);
    }

    public function test_validation_errors_return_consistent_shape(): void
    {
        Sanctum::actingAs(User::where('email', 'citizen@lokals.test')->firstOrFail());

        $this->postJson('/api/v1/store/products', [])
            ->assertUnprocessable()
            ->assertJsonStructure([
                'message',
                'errors',
            ])
            ->assertJsonPath('message', 'The given data was invalid.');
    }
}
