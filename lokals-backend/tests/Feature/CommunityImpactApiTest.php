<?php

namespace Tests\Feature;

use App\Models\CityReport;
use App\Models\CommunityImpactReward;
use App\Models\CommunityImpactTransaction;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityImpactApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_can_view_private_community_impact_dashboard_and_leaderboard_is_opt_in_only(): void
    {
        $resident = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($resident);

        $this->getJson('/api/v1/community-impact/me')
            ->assertOk()
            ->assertJsonStructure([
                'account' => ['available_points', 'lifetime_points', 'public_leaderboard_opt_in', 'privacy_mode'],
                'recent_approved',
                'pending_transactions',
            ]);

        $this->patchJson('/api/v1/community-impact/privacy-settings', [
            'public_leaderboard_opt_in' => true,
            'public_display_name' => 'Ervin K',
            'privacy_mode' => 'display_name',
        ])->assertOk()->assertJsonPath('account.public_leaderboard_opt_in', true);

        CommunityImpactTransaction::query()->create([
            'user_id' => $resident->id,
            'points' => 15,
            'type' => 'earned',
            'reason' => 'Verified issue report',
            'category' => 'issue_report_resolved',
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);
        $resident->communityImpactAccount()->update([
            'available_points' => 15,
            'lifetime_points' => 15,
            'total_points' => 15,
            'current_level' => 'Neighbor',
            'public_leaderboard_opt_in' => true,
            'privacy_mode' => 'display_name',
            'public_display_name' => 'Ervin K',
        ]);

        $this->getJson('/api/v1/community-impact/leaderboard')
            ->assertOk()
            ->assertJsonFragment(['display_name' => 'Ervin K']);
    }

    public function test_resolved_report_creates_pending_points_and_manager_can_approve_then_reward_can_be_redeemed(): void
    {
        $resident = User::where('email', 'resident@lokals.app')->firstOrFail();
        $manager = User::where('email', 'manager@lokals.app')->firstOrFail();
        $report = CityReport::where('user_id', $resident->id)->firstOrFail();

        Sanctum::actingAs($manager);

        $this->patchJson("/api/v1/reports/{$report->id}/status", [
            'status' => 'resolved',
            'resolution_notes' => 'Resolved for Community Impact test.',
        ])->assertOk();

        $transaction = CommunityImpactTransaction::query()
            ->where('user_id', $resident->id)
            ->where('source_type', 'city_report')
            ->where('source_id', $report->id)
            ->firstOrFail();

        $this->assertSame('pending', $transaction->verification_status);

        $this->patchJson("/api/v1/admin/community-impact/transactions/{$transaction->id}/approve", [
            'internal_notes' => 'Verified by town manager.',
        ])->assertOk()->assertJsonPath('data.verification_status', 'approved');

        $reward = CommunityImpactReward::query()->firstOrFail();
        $transaction->user->communityImpactAccount()->update([
            'available_points' => $reward->points_required,
            'lifetime_points' => $reward->points_required,
            'total_points' => $reward->points_required,
            'current_level' => 'Steady Contributor',
        ]);

        Sanctum::actingAs($resident);
        $this->postJson("/api/v1/community-impact/rewards/{$reward->id}/redeem")
            ->assertCreated()
            ->assertJsonPath('data.status', 'requested');
    }
}
