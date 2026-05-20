<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Announcement;
use App\Models\Accommodation;
use App\Models\Event;
use App\Models\HireItem;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\NewsItem;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Support\PilotLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $term = $request->string('q')->trim()->value();
        $type = $request->string('type')->trim()->value();
        $town = PilotLocation::requestTown($request) ?? '';
        $area = PilotLocation::requestArea($request) ?? '';

        if ($term === '') {
            return response()->json([
                'services' => [],
                'providers' => [],
                'jobs' => [],
                'listings' => [],
                'directory' => [],
                'alerts' => [],
                'products' => [],
                'hire_items' => [],
                'accommodations' => [],
                'events' => [],
                'news' => [],
            ]);
        }

        $like = '%'.$term.'%';
        $matchesType = static fn (string $group) => $type === '' || $type === $group;
        $applyPlace = static function ($query) use ($town, $area) {
            if ($town !== '' && $query->getModel()->getTable() !== 'news_items') {
                $query->where('town', $town);
            }

            if ($area !== '' && in_array($query->getModel()->getTable(), ['products', 'hire_items', 'accommodations', 'organizations', 'events', 'service_providers', 'news_items'], true)) {
                $query->where('area', $area);
            }

            if ($town !== '' && $query->getModel()->getTable() === 'news_items') {
                $query->where('town', $town);
            }

            return $query;
        };

        return response()->json([
            'services' => $matchesType('services')
                ? $applyPlace(Service::query()
                    ->where(fn ($query) => $query->where('name', 'like', $like)->orWhere('description', 'like', $like)))
                    ->limit(5)
                    ->get(['id', 'name', 'description', 'service_provider_id', 'organization_id', 'price', 'price_type'])
                : [],
            'providers' => $matchesType('providers')
                ? $applyPlace(ServiceProvider::query()
                    ->where(fn ($query) => $query->where('name', 'like', $like)->orWhere('category', 'like', $like)->orWhere('description', 'like', $like)))
                    ->limit(5)
                    ->get(['id', 'name', 'category', 'location', 'town', 'area', 'status'])
                : [],
            'jobs' => $matchesType('jobs')
                ? JobPost::query()->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('description', 'like', $like))->limit(5)->get(['id', 'title', 'location', 'status'])
                : [],
            'listings' => $matchesType('listings')
                ? Listing::query()->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('description', 'like', $like))->limit(5)->get(['id', 'title', 'location', 'status'])
                : [],
            'directory' => $matchesType('directory')
                ? $applyPlace(Organization::query()->where(fn ($query) => $query->where('name', 'like', $like)->orWhere('category', 'like', $like)->orWhere('description', 'like', $like)))->limit(5)->get(['id', 'name', 'category', 'location', 'town', 'area', 'status'])
                : [],
            'products' => $matchesType('products')
                ? $applyPlace(Product::query()->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('description', 'like', $like)))->limit(5)->get(['id', 'title', 'town', 'area', 'status', 'price', 'sale_price'])
                : [],
            'hire_items' => $matchesType('hire_items')
                ? $applyPlace(HireItem::query()
                    ->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('description', 'like', $like)->orWhere('category', 'like', $like)))
                    ->where('status', HireItem::STATUS_ACTIVE)
                    ->limit(5)
                    ->get(['id', 'title', 'category', 'town', 'area', 'status', 'verification_status', 'price_per_hour', 'price_per_day', 'deposit_amount'])
                : [],
            'accommodations' => $matchesType('accommodations')
                ? $applyPlace(Accommodation::query()->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('description', 'like', $like)))->limit(5)->get(['id', 'title', 'town', 'area', 'status', 'price', 'price_period'])
                : [],
            'events' => $matchesType('events')
                ? $applyPlace(Event::query()->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('description', 'like', $like)))->limit(5)->get(['id', 'title', 'category', 'town', 'area', 'starts_at', 'status'])
                : [],
            'news' => $matchesType('news')
                ? $applyPlace(NewsItem::query()->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('summary', 'like', $like)))->limit(5)->get(['id', 'title', 'summary', 'source_name', 'town', 'area', 'published_at'])
                : [],
            'alerts' => $matchesType('alerts')
                ? collect()
                    ->merge(Alert::query()->where('title', 'like', $like)->limit(3)->get(['id', 'title', 'location', 'priority']))
                    ->merge(Announcement::query()->where('title', 'like', $like)->limit(2)->get(['id', 'title', 'location']))
                : [],
        ]);
    }
}
