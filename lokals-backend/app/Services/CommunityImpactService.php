<?php

namespace App\Services;

use App\Models\CommunityImpactAccount;
use App\Models\CommunityImpactBadge;
use App\Models\CommunityImpactRedemption;
use App\Models\CommunityImpactReward;
use App\Models\CommunityImpactTransaction;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CommunityImpactService
{
    public function ensureAccount(User $user): CommunityImpactAccount
    {
        return CommunityImpactAccount::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['current_level' => $this->levelForPoints(0)]
        );
    }

    public function createPendingTransaction(
        User $user,
        int $points,
        string $reason,
        string $category,
        ?string $sourceType = null,
        int|string|null $sourceId = null,
        ?string $publicSummary = null,
        bool $isPublic = false,
        ?string $internalNotes = null,
    ): CommunityImpactTransaction {
        $this->ensureAccount($user);

        $existing = CommunityImpactTransaction::query()
            ->where('user_id', $user->id)
            ->where('category', $category)
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->whereIn('verification_status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return $existing;
        }

        $transaction = CommunityImpactTransaction::query()->create([
            'user_id' => $user->id,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'points' => max(0, $points),
            'type' => 'earned',
            'reason' => $reason,
            'category' => $category,
            'verification_status' => 'pending',
            'internal_notes' => $internalNotes,
            'public_summary' => $publicSummary,
            'is_public' => $isPublic,
        ]);

        $user->notify(new SystemNotification(
            'Community Impact pending',
            "{$points} Community Impact points are awaiting verification.",
            [
                'type' => 'community_impact_pending',
                'target' => [
                    'type' => 'community_impact',
                    'href' => '/community-impact',
                    'title' => 'Community Impact',
                ],
            ]
        ));

        User::query()
            ->whereKeyNot($user->id)
            ->whereHas('roles', fn (Builder $builder) => $builder->whereIn('name', ['town_manager', 'municipality_admin', 'operator', 'super_admin']))
            ->where(function (Builder $builder) use ($user): void {
                $builder->whereNull('default_town')
                    ->orWhere('default_town', $user->default_town);
            })
            ->get()
            ->each(fn (User $reviewer) => $reviewer->notify(new SystemNotification(
                'Community Impact approval pending',
                "{$user->name} has a Community Impact points request awaiting review.",
                [
                    'type' => 'community_impact_review_pending',
                    'target' => [
                        'type' => 'community_impact',
                        'href' => '/dashboard/town-manager/community-impact/pending',
                        'title' => 'Community Impact approvals',
                    ],
                ]
            )));

        return $transaction;
    }

    public function approveTransaction(CommunityImpactTransaction $transaction, User $verifier, ?string $notes = null): CommunityImpactTransaction
    {
        return DB::transaction(function () use ($transaction, $verifier, $notes): CommunityImpactTransaction {
            if ($transaction->verification_status === 'approved') {
                return $transaction->fresh(['user', 'verifier']);
            }

            $account = $this->ensureAccount($transaction->user);
            $account->available_points += $transaction->points;
            $account->lifetime_points += $transaction->points;
            $account->total_points += $transaction->points;
            $account->current_level = $this->levelForPoints($account->lifetime_points);
            $account->last_awarded_at = now();
            $account->save();

            $transaction->update([
                'verification_status' => 'approved',
                'verified_by' => $verifier->id,
                'verified_at' => now(),
                'internal_notes' => $notes ?: $transaction->internal_notes,
            ]);

            $transaction->user->notify(new SystemNotification(
                'Community Impact approved',
                "{$transaction->points} points were added to your Community Impact account.",
                [
                    'type' => 'community_impact_approved',
                    'target' => [
                        'type' => 'community_impact',
                        'href' => '/community-impact',
                        'title' => 'Community Impact',
                    ],
                ]
            ));

            return $transaction->fresh(['user', 'verifier']);
        });
    }

    public function rejectTransaction(CommunityImpactTransaction $transaction, User $verifier, ?string $notes = null): CommunityImpactTransaction
    {
        $transaction->update([
            'verification_status' => 'rejected',
            'verified_by' => $verifier->id,
            'verified_at' => now(),
            'internal_notes' => $notes ?: $transaction->internal_notes,
        ]);

        $transaction->user->notify(new SystemNotification(
            'Community Impact rejected',
            $notes ?: 'A Community Impact points request was rejected after review.',
            [
                'type' => 'community_impact_rejected',
                'target' => [
                    'type' => 'community_impact',
                    'href' => '/community-impact/history',
                    'title' => 'My points history',
                ],
            ]
        ));

        return $transaction->fresh(['user', 'verifier']);
    }

    public function reverseTransaction(CommunityImpactTransaction $transaction, User $verifier, ?string $notes = null): CommunityImpactTransaction
    {
        return DB::transaction(function () use ($transaction, $verifier, $notes): CommunityImpactTransaction {
            if ($transaction->verification_status === 'approved') {
                $account = $this->ensureAccount($transaction->user);
                $account->available_points = max(0, $account->available_points - $transaction->points);
                $account->lifetime_points = max(0, $account->lifetime_points - $transaction->points);
                $account->total_points = max(0, $account->total_points - $transaction->points);
                $account->current_level = $this->levelForPoints($account->lifetime_points);
                $account->save();
            }

            $transaction->update([
                'type' => 'reversed',
                'verification_status' => 'reversed',
                'verified_by' => $verifier->id,
                'verified_at' => now(),
                'internal_notes' => $notes ?: $transaction->internal_notes,
            ]);

            $transaction->user->notify(new SystemNotification(
                'Community Impact reversed',
                $notes ?: 'A previously approved Community Impact award was reversed after review.',
                [
                    'type' => 'community_impact_reversed',
                    'target' => [
                        'type' => 'community_impact',
                        'href' => '/community-impact/history',
                        'title' => 'My points history',
                    ],
                ]
            ));

            return $transaction->fresh(['user', 'verifier']);
        });
    }

    public function requestRedemption(User $user, CommunityImpactReward $reward): CommunityImpactRedemption
    {
        $account = $this->ensureAccount($user);
        abort_if($account->available_points < $reward->points_required, 422, 'Not enough available points for this reward.');
        abort_if(! $reward->is_active, 422, 'This reward is not active.');
        abort_if($reward->quantity_available !== null && $reward->quantity_available < 1, 422, 'This reward is no longer available.');

        return CommunityImpactRedemption::query()->create([
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'points_spent' => $reward->points_required,
            'status' => 'requested',
        ]);
    }

    public function approveRedemption(CommunityImpactRedemption $redemption, User $admin, ?string $notes = null): CommunityImpactRedemption
    {
        return DB::transaction(function () use ($redemption, $admin, $notes): CommunityImpactRedemption {
            if ($redemption->status === 'approved') {
                return $redemption->fresh(['reward', 'user', 'fulfiller']);
            }

            $account = $this->ensureAccount($redemption->user);
            abort_if($account->available_points < $redemption->points_spent, 422, 'This resident no longer has enough available points.');

            $account->available_points -= $redemption->points_spent;
            $account->redeemed_points += $redemption->points_spent;
            $account->save();

            if ($redemption->reward->quantity_available !== null) {
                $redemption->reward->decrement('quantity_available');
            }

            CommunityImpactTransaction::query()->create([
                'user_id' => $redemption->user_id,
                'points' => $redemption->points_spent,
                'type' => 'redeemed',
                'reason' => 'Reward redemption approved',
                'category' => 'reward_redemption',
                'verification_status' => 'approved',
                'verified_by' => $admin->id,
                'verified_at' => now(),
                'internal_notes' => $notes,
                'public_summary' => $redemption->reward->title,
                'is_public' => false,
                'source_type' => 'community_impact_reward',
                'source_id' => $redemption->reward_id,
            ]);

            $redemption->update([
                'status' => 'approved',
                'fulfillment_notes' => $notes ?: $redemption->fulfillment_notes,
            ]);

            $redemption->user->notify(new SystemNotification(
                'Reward redemption approved',
                "Your request for '{$redemption->reward->title}' was approved.",
                [
                    'type' => 'community_impact_redemption_approved',
                    'target' => [
                        'type' => 'community_impact',
                        'href' => '/community-impact/redemptions',
                        'title' => 'My redemptions',
                    ],
                ]
            ));

            return $redemption->fresh(['reward', 'user', 'fulfiller']);
        });
    }

    public function fulfillRedemption(CommunityImpactRedemption $redemption, User $admin, ?string $notes = null): CommunityImpactRedemption
    {
        $redemption->update([
            'status' => 'fulfilled',
            'fulfilled_by' => $admin->id,
            'fulfilled_at' => now(),
            'fulfillment_notes' => $notes ?: $redemption->fulfillment_notes,
        ]);

        $redemption->user->notify(new SystemNotification(
            'Reward fulfilled',
            "Your '{$redemption->reward->title}' reward is now fulfilled.",
            [
                'type' => 'community_impact_redemption_fulfilled',
                'target' => [
                    'type' => 'community_impact',
                    'href' => '/community-impact/redemptions',
                    'title' => 'My redemptions',
                ],
            ]
        ));

        return $redemption->fresh(['reward', 'user', 'fulfiller']);
    }

    public function rejectRedemption(CommunityImpactRedemption $redemption, User $admin, ?string $notes = null): CommunityImpactRedemption
    {
        if ($redemption->status === 'approved') {
            $account = $this->ensureAccount($redemption->user);
            $account->available_points += $redemption->points_spent;
            $account->redeemed_points = max(0, $account->redeemed_points - $redemption->points_spent);
            $account->save();
        }

        $redemption->update([
            'status' => 'rejected',
            'fulfilled_by' => $admin->id,
            'fulfillment_notes' => $notes ?: $redemption->fulfillment_notes,
        ]);

        $redemption->user->notify(new SystemNotification(
            'Reward redemption rejected',
            $notes ?: "Your request for '{$redemption->reward->title}' could not be approved.",
            [
                'type' => 'community_impact_redemption_rejected',
                'target' => [
                    'type' => 'community_impact',
                    'href' => '/community-impact/redemptions',
                    'title' => 'My redemptions',
                ],
            ]
        ));

        return $redemption->fresh(['reward', 'user', 'fulfiller']);
    }

    public function leaderboard(string $period = 'all_time', int $limit = 20): array
    {
        $query = CommunityImpactTransaction::query()
            ->selectRaw('user_id, SUM(points) as period_points')
            ->where('verification_status', 'approved')
            ->where('type', 'earned');

        if ($period === 'weekly') {
            $query->where('verified_at', '>=', now()->subDays(7));
        } elseif ($period === 'monthly') {
            $query->where('verified_at', '>=', now()->subDays(30));
        }

        $rows = $query
            ->groupBy('user_id')
            ->orderByDesc('period_points')
            ->with('user.communityImpactAccount')
            ->get();

        $rank = 0;
        $entries = [];

        foreach ($rows as $row) {
            $user = $row->user;
            $account = $user?->communityImpactAccount;
            if (! $user || ! $account || ! $account->public_leaderboard_opt_in) {
                continue;
            }

            $rank++;
            $entries[] = [
                'rank' => $rank,
                'points' => (int) $row->period_points,
                'level' => $account->current_level,
                'display_name' => $this->publicDisplayName($user, $account),
                'privacy_mode' => $account->privacy_mode,
                'avatar_placeholder' => strtoupper(substr($user->name, 0, 1)),
                'category_totals' => $this->publicCategoryTotals($user, $period),
            ];

            if (count($entries) >= $limit) {
                break;
            }
        }

        return $entries;
    }

    public function currentBadge(?CommunityImpactAccount $account): ?CommunityImpactBadge
    {
        if (! $account) {
            return null;
        }

        $points = (int) ($account->lifetime_points ?? 0);

        return CommunityImpactBadge::query()
            ->where('is_active', true)
            ->whereNotNull('points_threshold')
            ->where('points_threshold', '<=', $points)
            ->orderByDesc('points_threshold')
            ->first();
    }

    public function nextBadge(?CommunityImpactAccount $account): ?CommunityImpactBadge
    {
        $points = $account?->lifetime_points ?? 0;

        return CommunityImpactBadge::query()
            ->where('is_active', true)
            ->whereNotNull('points_threshold')
            ->where('points_threshold', '>', $points)
            ->orderBy('points_threshold')
            ->first();
    }

    public function levelForPoints(int $points): string
    {
        return match (true) {
            $points >= 1000 => 'Community Champion',
            $points >= 500 => 'Impact Builder',
            $points >= 250 => 'Local Helper',
            $points >= 100 => 'Steady Contributor',
            default => 'Neighbor',
        };
    }

    public function publicDisplayName(User $user, CommunityImpactAccount $account): string
    {
        return match ($account->privacy_mode) {
            'display_name' => $account->public_display_name ?: $user->name,
            'initials' => collect(explode(' ', trim($user->name)))->filter()->map(fn (string $part) => strtoupper(substr($part, 0, 1)))->take(2)->implode(''),
            default => 'Private resident',
        };
    }

    public function publicCategoryTotals(User $user, string $period): array
    {
        $query = CommunityImpactTransaction::query()
            ->selectRaw('category, SUM(points) as total_points')
            ->where('user_id', $user->id)
            ->where('verification_status', 'approved')
            ->where('type', 'earned');

        if ($period === 'weekly') {
            $query->where('verified_at', '>=', now()->subDays(7));
        } elseif ($period === 'monthly') {
            $query->where('verified_at', '>=', now()->subDays(30));
        }

        return $query->groupBy('category')->get()->map(fn ($row) => [
            'category' => $row->category,
            'points' => (int) $row->total_points,
        ])->values()->all();
    }
}
