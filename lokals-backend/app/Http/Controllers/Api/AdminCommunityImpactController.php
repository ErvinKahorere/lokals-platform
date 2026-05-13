<?php

namespace App\Http\Controllers\Api;

use App\Events\RewardApproved;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityImpactAccountResource;
use App\Http\Resources\CommunityImpactRedemptionResource;
use App\Http\Resources\CommunityImpactRewardResource;
use App\Http\Resources\CommunityImpactTransactionResource;
use App\Models\CommunityImpactRedemption;
use App\Models\CommunityImpactReward;
use App\Models\CommunityImpactTransaction;
use App\Models\User;
use App\Services\CommunityImpactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminCommunityImpactController extends Controller
{
    public function __construct(private readonly CommunityImpactService $service)
    {
    }

    public function pending(Request $request): AnonymousResourceCollection
    {
        return CommunityImpactTransactionResource::collection(
            CommunityImpactTransaction::query()
                ->with(['user', 'verifier'])
                ->where('verification_status', 'pending')
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function award(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'points' => ['required', 'integer', 'min:1', 'max:5000'],
            'reason' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'source_type' => ['nullable', 'string', 'max:100'],
            'source_id' => ['nullable', 'integer'],
            'public_summary' => ['nullable', 'string', 'max:255'],
            'is_public' => ['sometimes', 'boolean'],
            'internal_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = User::query()->whereKey($validated['user_id'])->firstOrFail();
        $transaction = $this->service->createPendingTransaction(
            $user,
            $validated['points'],
            $validated['reason'],
            $validated['category'],
            $validated['source_type'] ?? null,
            $validated['source_id'] ?? null,
            $validated['public_summary'] ?? null,
            (bool) ($validated['is_public'] ?? false),
            $validated['internal_notes'] ?? null,
        );

        return response()->json([
            'message' => 'Community Impact award created and awaiting approval.',
            'data' => CommunityImpactTransactionResource::make($transaction->load(['user', 'verifier'])),
        ], 201);
    }

    public function approveTransaction(Request $request, int $id): JsonResponse
    {
        $transaction = CommunityImpactTransaction::query()->whereKey($id)->firstOrFail();
        $validated = $request->validate(['internal_notes' => ['nullable', 'string', 'max:2000']]);
        $approved = $this->service->approveTransaction($transaction, $request->user(), $validated['internal_notes'] ?? null);
        broadcast(new RewardApproved($approved));

        return response()->json([
            'message' => 'Community Impact transaction approved.',
            'data' => CommunityImpactTransactionResource::make($approved),
        ]);
    }

    public function rejectTransaction(Request $request, int $id): JsonResponse
    {
        $transaction = CommunityImpactTransaction::query()->whereKey($id)->firstOrFail();
        $validated = $request->validate(['internal_notes' => ['nullable', 'string', 'max:2000']]);

        return response()->json([
            'message' => 'Community Impact transaction rejected.',
            'data' => CommunityImpactTransactionResource::make(
                $this->service->rejectTransaction($transaction, $request->user(), $validated['internal_notes'] ?? null)
            ),
        ]);
    }

    public function reverseTransaction(Request $request, int $id): JsonResponse
    {
        $transaction = CommunityImpactTransaction::query()->whereKey($id)->firstOrFail();
        $validated = $request->validate(['internal_notes' => ['nullable', 'string', 'max:2000']]);

        return response()->json([
            'message' => 'Community Impact transaction reversed.',
            'data' => CommunityImpactTransactionResource::make(
                $this->service->reverseTransaction($transaction, $request->user(), $validated['internal_notes'] ?? null)
            ),
        ]);
    }

    public function userProfile(int $userId): JsonResponse
    {
        $user = User::query()->with([
            'communityImpactAccount',
            'communityImpactTransactions.verifier',
            'communityImpactRedemptions.reward',
        ])->whereKey($userId)->firstOrFail();

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone],
            'account' => CommunityImpactAccountResource::make($this->service->ensureAccount($user)),
            'transactions' => CommunityImpactTransactionResource::collection($user->communityImpactTransactions->sortByDesc('created_at')->values()),
            'redemptions' => CommunityImpactRedemptionResource::collection($user->communityImpactRedemptions->sortByDesc('created_at')->values()),
        ]);
    }

    public function redemptions(Request $request): AnonymousResourceCollection
    {
        return CommunityImpactRedemptionResource::collection(
            CommunityImpactRedemption::query()
                ->with(['reward', 'user', 'fulfiller'])
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function approveRedemption(Request $request, int $id): JsonResponse
    {
        $redemption = CommunityImpactRedemption::query()->with(['reward', 'user'])->whereKey($id)->firstOrFail();
        $validated = $request->validate(['fulfillment_notes' => ['nullable', 'string', 'max:2000']]);

        return response()->json([
            'message' => 'Reward redemption approved.',
            'data' => CommunityImpactRedemptionResource::make(
                $this->service->approveRedemption($redemption, $request->user(), $validated['fulfillment_notes'] ?? null)
            ),
        ]);
    }

    public function fulfillRedemption(Request $request, int $id): JsonResponse
    {
        $redemption = CommunityImpactRedemption::query()->with(['reward', 'user'])->whereKey($id)->firstOrFail();
        $validated = $request->validate(['fulfillment_notes' => ['nullable', 'string', 'max:2000']]);

        return response()->json([
            'message' => 'Reward redemption fulfilled.',
            'data' => CommunityImpactRedemptionResource::make(
                $this->service->fulfillRedemption($redemption, $request->user(), $validated['fulfillment_notes'] ?? null)
            ),
        ]);
    }

    public function rejectRedemption(Request $request, int $id): JsonResponse
    {
        $redemption = CommunityImpactRedemption::query()->with(['reward', 'user'])->whereKey($id)->firstOrFail();
        $validated = $request->validate(['fulfillment_notes' => ['nullable', 'string', 'max:2000']]);

        return response()->json([
            'message' => 'Reward redemption rejected.',
            'data' => CommunityImpactRedemptionResource::make(
                $this->service->rejectRedemption($redemption, $request->user(), $validated['fulfillment_notes'] ?? null)
            ),
        ]);
    }

    public function createReward(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'reward_type' => ['required', 'in:airtime,voucher,money,goods,service,recognition,other'],
            'points_required' => ['required', 'integer', 'min:1'],
            'quantity_available' => ['nullable', 'integer', 'min:0'],
            'sponsor_name' => ['nullable', 'string', 'max:255'],
            'sponsor_logo' => ['nullable', 'string', 'max:255'],
            'terms' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $reward = CommunityImpactReward::query()->create($validated);

        return response()->json([
            'message' => 'Community Impact reward created.',
            'data' => CommunityImpactRewardResource::make($reward),
        ], 201);
    }

    public function updateReward(Request $request, int $id): JsonResponse
    {
        $reward = CommunityImpactReward::query()->whereKey($id)->firstOrFail();
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'reward_type' => ['sometimes', 'in:airtime,voucher,money,goods,service,recognition,other'],
            'points_required' => ['sometimes', 'integer', 'min:1'],
            'quantity_available' => ['nullable', 'integer', 'min:0'],
            'sponsor_name' => ['nullable', 'string', 'max:255'],
            'sponsor_logo' => ['nullable', 'string', 'max:255'],
            'terms' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $reward->update($validated);

        return response()->json([
            'message' => 'Community Impact reward updated.',
            'data' => CommunityImpactRewardResource::make($reward->fresh()),
        ]);
    }
}
