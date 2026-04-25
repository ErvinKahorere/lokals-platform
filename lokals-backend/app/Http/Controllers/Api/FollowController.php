<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Follow;
use App\Models\Organization;
use App\Models\ServiceProvider;
use App\Services\InteractionGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function __construct(private readonly InteractionGuardService $interactionGuardService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->follows()->latest()->paginate((int) $request->integer('per_page', 12))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string'],
            'id' => ['required', 'integer'],
        ]);

        $map = [
            'organization' => Organization::class,
            'service_provider' => ServiceProvider::class,
        ];

        abort_unless(isset($map[$validated['type']]), 422, 'Unsupported follow type');

        $target = $map[$validated['type']]::findOrFail($validated['id']);
        if (method_exists($target, 'user')) {
            $this->interactionGuardService->ensureUsersCanInteract($request->user(), $target->user);
        }

        $follow = Follow::firstOrCreate([
            'user_id' => $request->user()->id,
            'followable_type' => $map[$validated['type']],
            'followable_id' => $validated['id'],
        ]);

        return response()->json($follow, 201);
    }

    public function destroy(Request $request, Follow $follow): JsonResponse
    {
        abort_unless($follow->user_id === $request->user()->id, 403);
        $follow->delete();

        return response()->json(['message' => 'Unfollowed']);
    }
}
