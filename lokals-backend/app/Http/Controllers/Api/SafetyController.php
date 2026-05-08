<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Moderation\StoreModerationFlagRequest;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\Organization;
use App\Models\SafetyReport;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SafetyController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_type' => ['nullable', 'string', 'max:120'],
            'subject_id' => ['nullable', 'integer'],
            'reason' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
        ]);

        return response()->json($request->user()->safetyReports()->create($validated), 201);
    }

    public function flags(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['operator', 'municipality_admin', 'town_manager', 'super_admin']), 403);

        return response()->json(
            \App\Models\ModerationFlag::query()->latest()->paginate((int) $request->integer('per_page', 12))
        );
    }

    public function suspend(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['operator', 'municipality_admin', 'town_manager', 'super_admin']), 403);

        $validated = $request->validate([
            'type' => ['required', 'in:listing,provider'],
            'id' => ['required', 'integer'],
            'status' => ['required', 'in:published,suspended,active'],
        ]);

        $model = match ($validated['type']) {
            'listing' => Listing::findOrFail($validated['id']),
            'provider' => ServiceProvider::findOrFail($validated['id']),
        };

        $model->update(['status' => $validated['status']]);

        return response()->json($model);
    }
}
