<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Worker\StoreWorkerProfileRequest;
use App\Http\Resources\WorkerProfileResource;
use App\Models\WorkerProfile;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WorkerController extends Controller
{
    public function __construct(private readonly LocationService $locationService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = WorkerProfile::query()->with('user')->latest();

        if ($request->boolean('available_only', true)) {
            $query->where('is_available', true);
        }

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('headline', 'like', '%'.$search.'%')
                    ->orWhereJsonContains('skills', $search);
            });
        }

        if ($location = $request->string('location')->value()) {
            $query->where('location', 'like', '%'.$location.'%');
        }

        $items = $query->get()->filter(function (WorkerProfile $worker) use ($request): bool {
            if (! $request->filled('lat') || ! $request->filled('lng') || ! $request->filled('radius_km')) {
                return true;
            }

            $distance = $this->locationService->distanceKm(
                (float) $request->input('lat'),
                (float) $request->input('lng'),
                $worker->lat,
                $worker->lng,
            );

            $worker->distance_km = $distance;

            return $distance !== null && $distance <= (float) $request->input('radius_km');
        })->values();

        return WorkerProfileResource::collection(
            app(\App\Services\QueryService::class)->paginateCollection($items, (int) $request->integer('per_page', 12))
        );
    }

    public function show(WorkerProfile $worker): WorkerProfileResource
    {
        return WorkerProfileResource::make($worker->load('user'));
    }

    public function store(StoreWorkerProfileRequest $request): WorkerProfileResource
    {
        $workerProfile = $request->user()->workerProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->validated()
        );

        return WorkerProfileResource::make($workerProfile->load('user'));
    }
}
