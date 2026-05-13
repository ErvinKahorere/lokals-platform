<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MessagingInfrastructureApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authenticated_user_can_create_and_reply_to_conversation(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $manager = User::query()->where('email', 'manager@lokals.app')->firstOrFail();

        Sanctum::actingAs($resident);

        $conversationResponse = $this->postJson('/api/v1/conversations', [
            'participant_ids' => [$manager->id],
            'context' => 'marketplace',
            'subject' => 'Water drum inquiry',
            'message' => 'Is the water drum still available?',
        ])->assertCreated();

        $conversationId = $conversationResponse->json('data.id');

        $this->getJson('/api/v1/conversations')
            ->assertOk()
            ->assertJsonFragment(['subject' => 'Water drum inquiry']);

        $messageResponse = $this->postJson("/api/v1/conversations/{$conversationId}/messages", [
            'body' => 'Can I collect it tomorrow morning?',
        ])->assertCreated();

        $messageId = $messageResponse->json('data.id');

        $this->postJson("/api/v1/messages/{$messageId}/read")
            ->assertOk()
            ->assertJsonPath('data.message_id', $messageId);
    }
}
