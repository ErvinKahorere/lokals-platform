<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiAssistApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_request_marketplace_ai_assist(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/ai/assist/marketplace', [
                'title' => 'Second-hand chair',
                'description' => 'Wooden chair in good condition',
                'location' => 'Nau-Aib, Okahandja',
            ])
            ->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'module',
                    'provider_key',
                    'confidence_score',
                    'needs_user_review',
                    'suggestions',
                ],
            ])
            ->assertJsonPath('data.module', 'marketplace');
    }
}
