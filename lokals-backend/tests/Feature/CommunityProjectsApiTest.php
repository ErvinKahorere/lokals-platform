<?php

namespace Tests\Feature;

use App\Models\CommunityProject;
use App\Models\CommunityProjectCategory;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityProjectsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_submitted_project_stays_private_until_town_manager_approves_it(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $townManager = User::query()->where('email', 'manager@lokals.app')->firstOrFail();
        $category = CommunityProjectCategory::query()->where('slug', 'community-cleanup')->firstOrFail();

        Sanctum::actingAs($resident);

        $create = $this->postJson('/api/v1/community-projects', [
            'category_id' => $category->id,
            'title' => 'Resident cleanup support drive',
            'summary' => 'A local cleanup around the market and bus stop.',
            'description' => 'We need bags, gloves, and volunteer support for a Saturday cleanup drive.',
            'support_needed' => ['Volunteers', 'Materials'],
            'location_text' => 'Nau-Aib bus stop',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'contact_name' => 'Meriam Kambatuku',
            'contact_phone' => '+264810001050',
            'contact_email' => 'resident@lokals.app',
            'status' => 'submitted',
            'submit_for_review' => true,
        ])->assertCreated()
            ->assertJsonPath('data.verification_status', 'pending');

        $projectId = $create->json('data.id');
        $slug = $create->json('data.slug');

        $this->getJson('/api/v1/community-projects?town=Okahandja')
            ->assertOk()
            ->assertJsonMissing(['slug' => $slug]);

        Sanctum::actingAs($townManager);

        $this->patchJson("/api/v1/admin/community-projects/{$projectId}/approve", [
            'verification_notes' => 'Approved for public support.',
            'status' => 'active',
        ])->assertOk()
            ->assertJsonPath('data.verification_status', 'approved')
            ->assertJsonPath('data.is_verified', true);

        $this->getJson('/api/v1/community-projects?town=Okahandja')
            ->assertOk()
            ->assertJsonFragment(['slug' => $slug]);

        $this->getJson("/api/v1/community-projects/{$slug}")
            ->assertOk()
            ->assertJsonPath('data.slug', $slug);
    }

    public function test_authenticated_user_can_pledge_support_to_approved_project(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $project = CommunityProject::query()->where('verification_status', 'approved')->firstOrFail();

        Sanctum::actingAs($resident);

        $this->postJson("/api/v1/community-projects/{$project->id}/pledges", [
            'pledge_type' => 'volunteer',
            'pledge_description' => 'I can help for the full Saturday morning shift.',
            'contact_phone' => '+264810001050',
            'contact_email' => 'resident@lokals.app',
        ])->assertCreated()
            ->assertJsonPath('data.pledge_type', 'volunteer');

        $this->assertDatabaseHas('community_project_pledges', [
            'community_project_id' => $project->id,
            'user_id' => $resident->id,
            'pledge_type' => 'volunteer',
        ]);
    }
}
