<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Job\ApplyJobRequest;
use App\Http\Requests\Job\StoreJobRequest;
use App\Http\Resources\JobResource;
use App\Models\JobPost;
use App\Notifications\SystemNotification as SystemNotificationRecord;
use App\Services\InteractionGuardService;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class JobController extends Controller
{
    public function __construct(
        private readonly LocationService $locationService,
        private readonly InteractionGuardService $interactionGuardService,
    ) {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = JobPost::query()->latest()->with(['organization', 'user'])->withCount('applications');

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        if ($employmentType = $request->string('employment_type')->value()) {
            $query->where('employment_type', $employmentType);
        }

        if ($location = $request->string('location')->value()) {
            $query->where('location', 'like', '%'.$location.'%');
        }

        $items = $query->get()->filter(function (JobPost $job) use ($request): bool {
            if (! $request->filled('lat') || ! $request->filled('lng') || ! $request->filled('radius_km')) {
                return true;
            }

            $org = $job->organization;
            $distance = $this->locationService->distanceKm(
                (float) $request->input('lat'),
                (float) $request->input('lng'),
                $org?->lat,
                $org?->lng,
            );

            $job->distance_km = $distance;

            return $distance !== null && $distance <= (float) $request->input('radius_km');
        })->values();

        return JobResource::collection(
            app(\App\Services\QueryService::class)->paginateCollection($items, (int) $request->integer('per_page', 12))
        );
    }

    public function show(JobPost $job): JobResource
    {
        return JobResource::make($job->load(['organization', 'user'])->loadCount('applications'));
    }

    public function store(StoreJobRequest $request): JobResource
    {
        $validated = $request->validated();
        $job = $request->user()->jobPosts()->create($validated);

        return JobResource::make($job->load(['organization', 'user']));
    }

    public function apply(ApplyJobRequest $request, JobPost $job): JsonResponse
    {
        $this->interactionGuardService->ensureUsersCanInteract($request->user(), $job->user);

        $application = $job->applications()->firstOrCreate(
            ['user_id' => $request->user()->id],
            ['message' => $request->string('message')->value() ?: null]
        );

        $job->user?->notify(new SystemNotificationRecord(
            'New job application',
            "{$request->user()->name} applied to {$job->title}.",
            ['type' => 'job_application', 'job_id' => $job->id, 'application_id' => $application->id]
        ));

        return response()->json($application, 201);
    }

    public function mine(Request $request): AnonymousResourceCollection
    {
        return JobResource::collection(
            $request->user()->jobPosts()->latest()->withCount('applications')->paginate((int) $request->integer('per_page', 12))
        );
    }
}
