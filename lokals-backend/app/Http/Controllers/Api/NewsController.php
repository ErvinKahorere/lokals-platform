<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsItem;
use App\Models\Organization;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Support\PilotLocation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $this->applyFilters($request, NewsItem::query()->where('is_hidden', false))
            ->latest('published_at')
            ->latest()
            ->paginate((int) $request->integer('per_page', 12))
            ->through(fn (NewsItem $item) => $this->serializeItem($item));

        return response()->json($items);
    }

    public function show(NewsItem $newsItem): JsonResponse
    {
        abort_if($newsItem->is_hidden, 404);

        $related = NewsItem::query()
            ->where('id', '!=', $newsItem->id)
            ->where('is_hidden', false)
            ->where(function (Builder $query) use ($newsItem): void {
                $query->where('category', $newsItem->category);
                if ($newsItem->town) {
                    $query->orWhere('town', $newsItem->town);
                }
                foreach ($newsItem->tags ?? [] as $tag) {
                    $query->orWhereJsonContains('tags', $tag);
                }
            })
            ->latest('published_at')
            ->limit(6)
            ->get()
            ->map(fn (NewsItem $item) => $this->serializeItem($item));

        return response()->json([
            'data' => $this->serializeItem($newsItem),
            'related' => $related,
        ]);
    }

    public function trending(Request $request): JsonResponse
    {
        $items = $this->applyFilters($request, NewsItem::query()->where('is_hidden', false))
            ->orderByDesc('is_featured')
            ->latest('published_at')
            ->paginate((int) $request->integer('per_page', 10))
            ->through(fn (NewsItem $item) => $this->serializeItem($item));

        return response()->json($items);
    }

    public function local(Request $request): JsonResponse
    {
        [$town, $area, $region] = $this->resolveLocationContext($request->user(), $request);

        $items = $this->applyFilters($request, NewsItem::query()->where('is_hidden', false))
            ->when($town || $area || $region, function (Builder $query) use ($town, $area, $region): void {
                $query->where(function (Builder $locationQuery) use ($town, $area, $region): void {
                    if ($town) {
                        $locationQuery->where('town', $town);
                    }
                    if ($area) {
                        $locationQuery->orWhere('area', $area);
                    }
                    if ($region) {
                        $locationQuery->orWhere('region', $region);
                    }
                });
            })
            ->latest('published_at')
            ->paginate((int) $request->integer('per_page', 12))
            ->through(fn (NewsItem $item) => $this->serializeItem($item));

        return response()->json($items);
    }

    public function feed(Request $request): JsonResponse
    {
        $items = $this->applyFilters($request, NewsItem::query()->where('is_hidden', false))
            ->latest('published_at')
            ->limit(120)
            ->get();

        $user = $request->user();
        $scored = $this->scoreItems($items, $user, $request)
            ->take((int) $request->integer('per_page', 16))
            ->values();

        return response()->json([
            'data' => $scored->map(function (array $item): array {
                return [
                    ...$this->serializeItem($item['news_item']),
                    'feed_reason' => $item['reason'],
                    'feed_score' => $item['score'],
                ];
            }),
        ]);
    }

    private function applyFilters(Request $request, Builder $query): Builder
    {
        return $query
            ->when($request->filled('search'), fn (Builder $builder) => $builder->where(function (Builder $searchQuery) use ($request): void {
                $term = $request->string('search')->value();
                $searchQuery
                    ->where('title', 'like', '%'.$term.'%')
                    ->orWhere('summary', 'like', '%'.$term.'%')
                    ->orWhere('source_name', 'like', '%'.$term.'%');
            }))
            ->when($request->filled('category'), fn (Builder $builder) => $builder->where('category', $request->string('category')->value()))
            ->when(PilotLocation::requestTown($request), fn (Builder $builder, $town) => $builder->where('town', $town))
            ->when(PilotLocation::requestArea($request), fn (Builder $builder, $area) => $builder->where('area', $area))
            ->when($request->filled('region'), fn (Builder $builder) => $builder->where('region', $request->string('region')->value()))
            ->when($request->filled('tag'), fn (Builder $builder) => $builder->whereJsonContains('tags', Str::lower($request->string('tag')->value())));
    }

    private function serializeItem(NewsItem $item): array
    {
        return [
            ...$item->toArray(),
            'source_entity' => $this->resolveSourceEntity($item),
            'source_domain' => parse_url($item->external_url ?: $item->source_url, PHP_URL_HOST),
            'compliance_notice' => 'Content is provided by external sources. LOKALS does not own this content.',
        ];
    }

    private function resolveSourceEntity(NewsItem $item): ?array
    {
        $organization = Organization::query()
            ->where(function (Builder $query) use ($item): void {
                $query->where('name', $item->source_name);
                $host = parse_url($item->source_url, PHP_URL_HOST);
                if ($host) {
                    $query->orWhere('email', 'like', '%'.$host.'%');
                }
            })
            ->first();

        if ($organization) {
            return [
                'type' => 'organization',
                'id' => $organization->id,
                'name' => $organization->name,
                'is_verified' => $organization->is_verified,
            ];
        }

        $provider = ServiceProvider::query()
            ->where('name', $item->source_name)
            ->first();

        if ($provider) {
            return [
                'type' => 'service_provider',
                'id' => $provider->id,
                'name' => $provider->name,
                'is_verified' => $provider->is_verified,
            ];
        }

        return null;
    }

    /**
     * @param Collection<int, NewsItem> $items
     * @return Collection<int, array{news_item: NewsItem, score: int, reason: string}>
     */
    private function scoreItems(Collection $items, ?User $user, Request $request): Collection
    {
        [$town, $area, $region] = $this->resolveLocationContext($user, $request);
        $followedNames = $this->resolveFollowedNames($user);
        $interests = collect($user?->preference?->interests ?? [])
            ->map(fn (string $interest) => Str::lower($interest))
            ->values();
        $roles = collect($user?->getRoleNames()?->all() ?? [])
            ->map(fn (string $role) => str_replace('_', ' ', Str::lower($role)));

        return $items
            ->map(function (NewsItem $item) use ($town, $area, $region, $followedNames, $interests, $roles): array {
                $score = $item->is_featured ? 30 : 0;
                $reason = 'latest news';
                $haystack = Str::lower($item->title.' '.$item->summary.' '.implode(' ', $item->tags ?? []));

                if ($town && $item->town === $town) {
                    $score += 60;
                    $reason = 'near your town';
                }

                if ($area && $item->area === $area) {
                    $score += 55;
                    $reason = 'near your area';
                }

                if ($region && $item->region === $region) {
                    $score += 40;
                    $reason = $reason === 'latest news' ? 'in your region' : $reason;
                }

                foreach ($followedNames as $name) {
                    if (str_contains($haystack, $name)) {
                        $score += 35;
                        $reason = 'from followed places';
                        break;
                    }
                }

                foreach ($interests as $interest) {
                    if (str_contains($haystack, $interest) || str_contains(Str::lower($item->category), $interest)) {
                        $score += 20;
                        $reason = $reason === 'latest news' ? 'matches your interests' : $reason;
                        break;
                    }
                }

                foreach ($roles as $role) {
                    if (str_contains($haystack, $role)) {
                        $score += 10;
                        break;
                    }
                }

                return [
                    'news_item' => $item,
                    'score' => $score,
                    'reason' => $reason,
                ];
            })
            ->sortByDesc(fn (array $item) => sprintf('%08d-%s', $item['score'], optional($item['news_item']->published_at)->timestamp ?? 0));
    }

    /**
     * @return array{0: string|null, 1: string|null, 2: string|null}
     */
    private function resolveLocationContext(?User $user, Request $request): array
    {
        $town = PilotLocation::requestTown($request) ?: $user?->default_town ?: $user?->preference?->default_town;
        $area = PilotLocation::requestArea($request) ?: PilotLocation::normalizeArea($user?->default_area ?: $user?->preference?->default_area);
        $region = $request->string('region')->value();

        if (! $region && $town === 'Okahandja') {
            $region = 'Otjozondjupa';
        }

        return [$town ?: null, $area ?: null, $region ?: null];
    }

    /**
     * @return Collection<int, string>
     */
    private function resolveFollowedNames(?User $user): Collection
    {
        if (! $user) {
            return collect();
        }

        return $user->follows()
            ->with('followable')
            ->get()
            ->map(function ($follow): ?string {
                $followable = $follow->followable;
                if ($followable instanceof Organization || $followable instanceof ServiceProvider) {
                    return Str::lower($followable->name);
                }

                return null;
            })
            ->filter()
            ->values();
    }
}
