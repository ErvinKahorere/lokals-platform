<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PostDraft;
use App\Services\AutoFillDraftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostDraftController extends Controller
{
    public function __construct(private readonly AutoFillDraftService $autoFillDraftService)
    {
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', 'string', 'max:60'],
            'location' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:6144'],
        ]);

        $imageUrl = null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('draft-previews', 'public');
            $imageUrl = Storage::disk('public')->url($path);
        }

        $draftData = $this->autoFillDraftService->suggest([
            ...$validated,
            'filename' => $request->file('image')?->getClientOriginalName(),
        ]);

        $draft = PostDraft::create([
            'user_id' => $request->user()?->id,
            'type' => $validated['type'] ?? 'marketplace',
            'image_url' => $imageUrl,
            ...$draftData,
        ]);

        return response()->json(['data' => $draft], 201);
    }
}
