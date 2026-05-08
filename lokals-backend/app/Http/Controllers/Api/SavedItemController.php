<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Event;
use App\Models\EventSave;
use App\Models\Follow;
use App\Models\Listing;
use App\Models\NewsItem;
use App\Models\Organization;
use App\Models\Product;
use App\Models\SavedItem;
use App\Models\ServiceProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $savedItems = SavedItem::query()
            ->where('user_id', $user->id)
            ->with('saveable')
            ->latest()
            ->get();

        $eventItems = Event::query()
            ->whereIn('id', EventSave::query()->where('user_id', $user->id)->pluck('event_id'))
            ->get();

        $follows = Follow::query()
            ->where('user_id', $user->id)
            ->with('followable')
            ->latest()
            ->get();

        $groups = [
            'products' => [],
            'accommodations' => [],
            'events' => [],
            'providers' => [],
            'directory' => [],
            'news' => [],
            'listings' => [],
        ];

        foreach ($savedItems as $savedItem) {
            $entry = $this->transformSavedModel($savedItem->saveable);
            if ($entry === null) {
                continue;
            }

            $groups[$entry['group']][] = $entry;
        }

        foreach ($eventItems as $event) {
            $groups['events'][] = $this->transformSavedModel($event);
        }

        foreach ($follows as $follow) {
            $entry = $this->transformSavedModel($follow->followable);
            if ($entry === null) {
                continue;
            }

            if ($entry['group'] === 'providers' || $entry['group'] === 'directory') {
                $groups[$entry['group']][] = $entry;
            }
        }

        foreach ($groups as $key => $items) {
            $groups[$key] = collect($items)
                ->unique(fn (array $item) => $item['kind'].'-'.$item['id'])
                ->values()
                ->all();
        }

        $allItems = collect($groups)
            ->flatten(1)
            ->sortByDesc('saved_at')
            ->values()
            ->all();

        return response()->json([
            'counts' => collect($groups)->map(fn (array $items) => count($items))->all(),
            'items' => $allItems,
            ...$groups,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string'],
            'id' => ['required', 'integer'],
        ]);

        $model = $this->resolveSaveable($validated['type'], (int) $validated['id']);

        SavedItem::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'saveable_type' => $model::class,
            'saveable_id' => $model->getKey(),
        ]);

        return response()->json([
            'message' => 'Saved',
        ], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string'],
            'id' => ['required', 'integer'],
        ]);

        $model = $this->resolveSaveable($validated['type'], (int) $validated['id']);

        SavedItem::query()
            ->where('user_id', $request->user()->id)
            ->where('saveable_type', $model::class)
            ->where('saveable_id', $model->getKey())
            ->delete();

        return response()->json([
            'message' => 'Removed from saved',
        ]);
    }

    private function resolveSaveable(string $type, int $id): Model
    {
        $map = [
            'product' => Product::class,
            'accommodation' => Accommodation::class,
            'listing' => Listing::class,
            'event' => Event::class,
            'provider' => ServiceProvider::class,
            'directory' => Organization::class,
            'news' => NewsItem::class,
        ];

        $class = $map[$type] ?? null;
        abort_unless($class !== null, 422, 'Unsupported saved item type.');

        return $class::query()->findOrFail($id);
    }

    private function transformSavedModel(?Model $model): ?array
    {
        if ($model === null) {
            return null;
        }

        return match (true) {
            $model instanceof Product => [
                'kind' => 'product',
                'group' => 'products',
                'id' => $model->id,
                'title' => $model->title,
                'subtitle' => $model->business?->name ?? $model->user?->name ?? 'Local seller',
                'town' => $model->town,
                'area' => $model->area,
                'image_url' => $model->image_path,
                'route' => '/store/'.$model->id,
                'saved_at' => optional($model->updated_at)->toIso8601String(),
            ],
            $model instanceof Accommodation => [
                'kind' => 'accommodation',
                'group' => 'accommodations',
                'id' => $model->id,
                'title' => $model->title,
                'subtitle' => $model->type,
                'town' => $model->town,
                'area' => $model->area,
                'image_url' => $model->image_path,
                'route' => '/accommodation/'.$model->id,
                'saved_at' => optional($model->updated_at)->toIso8601String(),
            ],
            $model instanceof Event => [
                'kind' => 'event',
                'group' => 'events',
                'id' => $model->id,
                'title' => $model->title,
                'subtitle' => $model->category,
                'town' => $model->town,
                'area' => $model->area,
                'image_url' => $model->image_url,
                'route' => '/events/'.$model->id,
                'saved_at' => optional($model->updated_at)->toIso8601String(),
            ],
            $model instanceof ServiceProvider => [
                'kind' => 'provider',
                'group' => 'providers',
                'id' => $model->id,
                'title' => $model->name,
                'subtitle' => $model->category,
                'town' => $model->town,
                'area' => $model->area,
                'image_url' => $model->avatar_url,
                'route' => '/services/'.$model->id,
                'saved_at' => optional($model->updated_at)->toIso8601String(),
            ],
            $model instanceof Organization => [
                'kind' => 'directory',
                'group' => 'directory',
                'id' => $model->id,
                'title' => $model->name,
                'subtitle' => $model->category,
                'town' => $model->town,
                'area' => $model->area,
                'image_url' => $model->logo_url,
                'route' => '/directory/'.$model->id,
                'saved_at' => optional($model->updated_at)->toIso8601String(),
            ],
            $model instanceof NewsItem => [
                'kind' => 'news',
                'group' => 'news',
                'id' => $model->id,
                'title' => $model->title,
                'subtitle' => $model->source_name,
                'town' => $model->town,
                'area' => $model->area,
                'image_url' => $model->image_url,
                'route' => '/news/'.$model->id,
                'saved_at' => optional($model->updated_at)->toIso8601String(),
            ],
            $model instanceof Listing => [
                'kind' => 'listing',
                'group' => 'listings',
                'id' => $model->id,
                'title' => $model->title,
                'subtitle' => $model->type,
                'town' => null,
                'area' => null,
                'image_url' => $model->image_path,
                'route' => '/marketplace/'.$model->id,
                'saved_at' => optional($model->updated_at)->toIso8601String(),
            ],
            default => null,
        };
    }
}
