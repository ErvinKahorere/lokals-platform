<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FeedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'alerts' => Alert::query()->where('is_active', true)->latest()->limit((int) $request->integer('alerts_limit', 8))->get(),
            'announcements' => Announcement::query()->latest('published_at')->limit((int) $request->integer('announcements_limit', 8))->get(),
        ]);
    }
}
