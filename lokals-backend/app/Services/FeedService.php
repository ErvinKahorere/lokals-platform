<?php

namespace App\Services;

use App\Models\FeedInteraction;
use App\Models\FeedPost;
use App\Models\User;
use App\Models\UserFeedPreference;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class FeedService
{
    public function publicFeed(Request $request, ?User $viewer = null): LengthAwarePaginator
    {
        $query = FeedPost::query()
            ->with(['source', 'category'])
            ->where('status', 'approved');

        if ($category = $request->string('category')->value()) {
            $query->whereHas('category', fn (Builder $builder) => $builder->where('slug', $category));
        }

        if ($town = $request->string('town')->value()) {
            $query->where(function (Builder $builder) use ($town): void {
                $builder->whereNull('town')->orWhere('town', $town);
            });
        } elseif ($viewer?->default_town) {
            $query->where(function (Builder $builder) use ($viewer): void {
                $builder->whereNull('town')->orWhere('town', $viewer->default_town);
            });
        }

        if ($viewer) {
            $this->applyUserPreferences($query, $viewer);
        }

        $items = $query->get()->sortByDesc(function (FeedPost $post) use ($viewer): string {
            $score = $post->priority * 100;
            if ($post->is_featured) {
                $score += 500;
            }
            if ($viewer?->default_town && $post->town && strcasecmp($viewer->default_town, $post->town) === 0) {
                $score += 120;
            }
            if ($viewer?->default_area && $post->area && strcasecmp($viewer->default_area, $post->area) === 0) {
                $score += 60;
            }
            $publishedAt = optional($post->published_at ?? $post->created_at)->timestamp ?? 0;

            return sprintf('%08d-%010d', $score, $publishedAt);
        })->values();

        return app(QueryService::class)->paginateCollection(
            $items,
            (int) $request->integer('per_page', 15)
        );
    }

    public function recordInteraction(User $user, FeedPost $post, string $type, array $details = []): FeedInteraction
    {
        return FeedInteraction::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'feed_post_id' => $post->id,
                'type' => $type,
            ],
            ['details' => $details]
        );
    }

    public function hidePost(User $user, FeedPost $post): FeedInteraction
    {
        return $this->recordInteraction($user, $post, 'hidden');
    }

    public function savePost(User $user, FeedPost $post): FeedInteraction
    {
        return $this->recordInteraction($user, $post, 'saved');
    }

    public function reportPost(User $user, FeedPost $post, ?string $reason = null): FeedInteraction
    {
        return $this->recordInteraction($user, $post, 'reported', ['reason' => $reason]);
    }

    public function ensurePreference(User $user): UserFeedPreference
    {
        return UserFeedPreference::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'interests' => [],
                'hidden_category_ids' => [],
                'muted_source_ids' => [],
                'preferred_town' => $user->default_town,
                'preferred_area' => $user->default_area,
                'prioritize_followed_organizations' => true,
            ]
        );
    }

    private function applyUserPreferences(Builder $query, User $viewer): void
    {
        $preference = $this->ensurePreference($viewer);
        if (! empty($preference->hidden_category_ids)) {
            $query->whereNotIn('category_id', $preference->hidden_category_ids);
        }
        if (! empty($preference->muted_source_ids)) {
            $query->whereNotIn('feed_source_id', $preference->muted_source_ids);
        }
        if (! empty($preference->interests)) {
            $query->where(function (Builder $builder) use ($preference): void {
                foreach ($preference->interests as $interest) {
                    $builder->orWhereJsonContains('metadata->tags', $interest)
                        ->orWhereHas('category', fn (Builder $categoryQuery) => $categoryQuery->where('slug', $interest));
                }
            });
        }
    }
}
