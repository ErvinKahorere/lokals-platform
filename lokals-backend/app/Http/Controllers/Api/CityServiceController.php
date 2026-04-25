<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\City\StoreCityReportRequest;
use App\Models\Announcement;
use App\Models\CityReport;
use App\Models\Follow;
use App\Models\Organization;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CityServiceController extends Controller
{
    public function announcements(Request $request): JsonResponse
    {
        return response()->json(Announcement::query()->latest('published_at')->paginate((int) $request->integer('per_page', 12)));
    }

    public function reportIssue(StoreCityReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        unset($validated['photo']);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('report-photos', 'public');
            $validated['photo_url'] = Storage::disk('public')->url($path);
        }

        $report = $request->user()->cityReports()->create($validated);

        return response()->json($report, 201);
    }

    public function myReports(Request $request): JsonResponse
    {
        return response()->json($request->user()->cityReports()->latest()->paginate((int) $request->integer('per_page', 12)));
    }

    public function reports(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['municipality_admin', 'operator', 'super_admin']), 403);

        $query = CityReport::query()->with('user')->latest();

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%');
            });
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate((int) $request->integer('per_page', 12)));
    }

    public function updateReportStatus(Request $request, CityReport $report): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,in_review,resolved,rejected'],
        ]);

        $report->update($validated);
        $report->user?->notify(new SystemNotification(
            'Report status update',
            "Your report '{$report->title}' is now {$report->status}.",
            ['type' => 'report_status', 'report_id' => $report->id, 'status' => $report->status]
        ));

        return response()->json($report);
    }

    public function createAnnouncement(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['municipality_admin', 'operator', 'super_admin']), 403);

        $validated = $request->validate([
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'published_at' => now(),
            'status' => 'published',
        ]);

        if ($announcement->organization_id) {
            $followerIds = Follow::query()
                ->where('followable_type', Organization::class)
                ->where('followable_id', $announcement->organization_id)
                ->pluck('user_id');

            \App\Models\User::query()->whereIn('id', $followerIds)->get()->each(
                fn ($user) => $user->notify(new SystemNotification(
                    'Alert from followed organization',
                    $announcement->title,
                    ['type' => 'followed_organization_alert', 'announcement_id' => $announcement->id]
                ))
            );
        }

        return response()->json($announcement, 201);
    }
}
