<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityImpactAccountResource;
use App\Http\Resources\CommunityImpactRedemptionResource;
use App\Http\Resources\CommunityImpactRewardResource;
use App\Http\Resources\CommunityImpactTransactionResource;
use App\Models\CommunityImpactRedemption;
use App\Models\CommunityImpactReward;
use App\Services\CommunityImpactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommunityImpactController extends Controller
{
    public function __construct(private readonly CommunityImpactService $service)
    {
    }

    public function me(Request $request): JsonResponse
    {
        $account = $this->service->ensureAccount($request->user());
        $recentApproved = $request->user()->communityImpactTransactions()
            ->where('verification_status', 'approved')
            ->latest()
            ->limit(5)
            ->get();
        $pending = $request->user()->communityImpactTransactions()
            ->where('verification_status', 'pending')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'account' => CommunityImpactAccountResource::make($account),
            'recent_approved' => CommunityImpactTransactionResource::collection($recentApproved),
            'pending_transactions' => CommunityImpactTransactionResource::collection($pending),
        ]);
    }

    public function myTransactions(Request $request): AnonymousResourceCollection
    {
        return CommunityImpactTransactionResource::collection(
            $request->user()->communityImpactTransactions()
                ->with('verifier')
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function rewards(): AnonymousResourceCollection
    {
        return CommunityImpactRewardResource::collection(
            CommunityImpactReward::query()
                ->where('is_active', true)
                ->orderBy('points_required')
                ->paginate(20)
        );
    }

    public function redeem(Request $request, int $id): JsonResponse
    {
        $reward = CommunityImpactReward::query()->whereKey($id)->firstOrFail();
        $redemption = $this->service->requestRedemption($request->user(), $reward);

        return response()->json([
            'message' => 'Reward redemption requested. Approval is required before points are spent.',
            'data' => CommunityImpactRedemptionResource::make($redemption->load(['reward', 'user'])),
        ], 201);
    }

    public function myRedemptions(Request $request): AnonymousResourceCollection
    {
        return CommunityImpactRedemptionResource::collection(
            $request->user()->communityImpactRedemptions()
                ->with(['reward', 'fulfiller'])
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function updatePrivacy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'public_leaderboard_opt_in' => ['required', 'boolean'],
            'public_display_name' => ['nullable', 'string', 'max:255'],
            'privacy_mode' => ['required', 'in:private,initials,display_name'],
        ]);

        $account = $this->service->ensureAccount($request->user());
        $account->update($validated);

        return response()->json([
            'message' => 'Community Impact privacy settings updated.',
            'account' => CommunityImpactAccountResource::make($account->fresh()),
        ]);
    }

    public function leaderboard(Request $request): JsonResponse
    {
        $period = $request->string('period')->value() ?: 'all_time';

        return response()->json([
            'period' => $period,
            'data' => $this->service->leaderboard($period),
        ]);
    }
}
