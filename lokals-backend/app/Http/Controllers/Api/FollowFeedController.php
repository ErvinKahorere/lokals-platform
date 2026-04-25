<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowFeedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizationIds = $request->user()
            ->follows()
            ->where('followable_type', Organization::class)
            ->pluck('followable_id');

        $announcements = Announcement::query()
            ->whereIn('organization_id', $organizationIds)
            ->latest('published_at')
            ->paginate((int) $request->integer('per_page', 12));

        return response()->json($announcements);
    }
}
