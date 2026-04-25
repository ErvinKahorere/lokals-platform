<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Announcement;
use App\Models\Accommodation;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\Organization;
use App\Models\Product;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $term = $request->string('q')->trim()->value();

        if ($term === '') {
            return response()->json([
                'services' => [],
                'jobs' => [],
                'listings' => [],
                'directory' => [],
                'alerts' => [],
                'products' => [],
                'accommodations' => [],
            ]);
        }

        $like = '%'.$term.'%';

        return response()->json([
            'services' => ServiceProvider::query()->where('name', 'like', $like)->orWhere('category', 'like', $like)->limit(5)->get(['id', 'name', 'category', 'location']),
            'jobs' => JobPost::query()->where('title', 'like', $like)->orWhere('description', 'like', $like)->limit(5)->get(['id', 'title', 'location', 'status']),
            'listings' => Listing::query()->where('title', 'like', $like)->orWhere('description', 'like', $like)->limit(5)->get(['id', 'title', 'location', 'status']),
            'directory' => Organization::query()->where('name', 'like', $like)->orWhere('category', 'like', $like)->limit(5)->get(['id', 'name', 'category', 'location']),
            'products' => Product::query()->where('title', 'like', $like)->orWhere('description', 'like', $like)->limit(5)->get(['id', 'title', 'town', 'area', 'status']),
            'accommodations' => Accommodation::query()->where('title', 'like', $like)->orWhere('description', 'like', $like)->limit(5)->get(['id', 'title', 'town', 'area', 'status']),
            'alerts' => collect()
                ->merge(Alert::query()->where('title', 'like', $like)->limit(3)->get(['id', 'title', 'location', 'priority']))
                ->merge(Announcement::query()->where('title', 'like', $like)->limit(2)->get(['id', 'title', 'location'])),
        ]);
    }
}
