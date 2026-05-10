<?php

namespace Tests\Feature;

use App\Models\DeviceToken;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DeviceTokenApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authenticated_user_can_register_device_token(): void
    {
        Sanctum::actingAs(User::where('email', 'resident@lokals.app')->firstOrFail());

        $this->postJson('/api/v1/device-tokens', [
            'platform' => 'android',
            'token' => 'demo-device-token-123',
            'device_name' => 'Galaxy Test',
        ])->assertCreated()
            ->assertJsonPath('data.platform', 'android');

        $this->assertDatabaseHas('device_tokens', [
            'token' => 'demo-device-token-123',
            'platform' => 'android',
        ]);
    }

    public function test_authenticated_user_can_remove_owned_device_token(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $deviceToken = DeviceToken::query()->create([
            'user_id' => $user->id,
            'platform' => 'android',
            'token' => 'demo-device-token-delete',
            'device_name' => 'Galaxy Test',
        ]);

        $this->deleteJson('/api/v1/device-tokens/'.$deviceToken->id)
            ->assertOk();

        $this->assertDatabaseMissing('device_tokens', [
            'id' => $deviceToken->id,
        ]);
    }
}
