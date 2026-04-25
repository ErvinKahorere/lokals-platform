<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Moderation\StoreModerationFlagRequest;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\ModerationFlag;
use App\Models\Organization;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    private const TYPES = [
        'listing' => Listing::class,
        'provider' => ServiceProvider::class,
        'job' => JobPost::class,
        'organization' => Organization::class,
    ];

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['operator', 'municipality_admin', 'super_admin']), 403);

        $query = ModerationFlag::query()->latest()->with('user');

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate((int) $request->integer('per_page', 12)));
    }

    public function store(StoreModerationFlagRequest $request): JsonResponse
    {
        $class = self::TYPES[$request->string('type')->value()] ?? null;
        abort_unless($class, 422, 'Unsupported moderation type');

        $model = $class::findOrFail($request->integer('id'));

        $flag = ModerationFlag::create([
            'user_id' => $request->user()->id,
            'flaggable_type' => $class,
            'flaggable_id' => $model->getKey(),
            'reason' => $request->string('reason')->value(),
            'details' => $request->string('details')->value() ?: null,
            'status' => 'pending',
        ]);

        return response()->json($flag, 201);
    }

    public function update(Request $request, ModerationFlag $moderationFlag): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['operator', 'municipality_admin', 'super_admin']), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,reviewed,resolved,rejected'],
        ]);

        $moderationFlag->update($validated);

        return response()->json($moderationFlag);
    }
}
