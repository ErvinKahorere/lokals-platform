<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Announcement;
use App\Models\JobPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertFeedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = collect();

        $alerts = Alert::query()
            ->where('is_active', true)
            ->latest()
            ->limit((int) $request->integer('limit', 8))
            ->get()
            ->map(fn (Alert $alert) => [
                'id' => 'alert-'.$alert->id,
                'source_type' => 'alert',
                'title' => $alert->title,
                'body' => $alert->body,
                'location' => $alert->location,
                'severity' => $alert->priority,
                'timestamp' => optional($alert->created_at)->toIso8601String(),
            ]);

        $announcements = Announcement::query()
            ->latest('published_at')
            ->limit((int) $request->integer('limit', 8))
            ->get()
            ->map(fn (Announcement $announcement) => [
                'id' => 'announcement-'.$announcement->id,
                'source_type' => 'announcement',
                'title' => $announcement->title,
                'body' => $announcement->body,
                'location' => $announcement->location,
                'severity' => 'info',
                'timestamp' => optional($announcement->published_at ?? $announcement->created_at)->toIso8601String(),
                'organization_id' => $announcement->organization_id,
            ]);

        $jobs = JobPost::query()
            ->where('status', 'open')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (JobPost $job) => [
                'id' => 'job-'.$job->id,
                'source_type' => 'job',
                'title' => $job->title,
                'body' => $job->description,
                'location' => $job->location,
                'severity' => 'low',
                'timestamp' => optional($job->created_at)->toIso8601String(),
            ]);

        $items = $items
            ->merge($alerts)
            ->merge($announcements)
            ->merge($jobs)
            ->sortByDesc('timestamp')
            ->values();

        return response()->json([
            'data' => $items->take((int) $request->integer('per_page', 16)),
        ]);
    }
}
