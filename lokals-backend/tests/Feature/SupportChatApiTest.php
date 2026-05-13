<?php

namespace Tests\Feature;

use App\Models\SupportIntent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupportChatApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_creates_conversation_and_bot_reply(): void
    {
        $user = User::factory()->create();
        SupportIntent::query()->create([
            'key' => 'report_issue',
            'name' => 'Report issue',
            'training_phrases' => ['report issue', 'water leak'],
            'response_template' => 'Open Report Issue to submit the problem.',
            'suggested_route' => '/report-issue',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->postJson('/api/v1/support/chat', ['message' => 'I want to report issue about a water leak'])
            ->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'messages',
                ],
            ])
            ->assertJsonCount(2, 'data.messages');
    }
}
