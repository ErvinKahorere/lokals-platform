<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AiAssistRequestResource;
use App\Models\AiAssistRequest;
use App\Services\AiAssist\AiAssistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAssistController extends Controller
{
    public function __construct(
        private readonly AiAssistService $aiAssistService,
    ) {
    }

    public function marketplace(Request $request): JsonResponse
    {
        return $this->respond('marketplace', $request);
    }

    public function issueReport(Request $request): JsonResponse
    {
        return $this->respond('issue-report', $request);
    }

    public function communityProject(Request $request): JsonResponse
    {
        return $this->respond('community-project', $request);
    }

    public function business(Request $request): JsonResponse
    {
        return $this->respond('business', $request);
    }

    public function show(Request $request, AiAssistRequest $aiAssistRequest): AiAssistRequestResource
    {
        abort_if($aiAssistRequest->user_id && $request->user()?->id !== $aiAssistRequest->user_id && ! $request->user()?->hasTownManagerAccess(), 403);

        return AiAssistRequestResource::make($aiAssistRequest->load('suggestions'));
    }

    private function respond(string $module, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'price' => ['nullable'],
            'media' => ['nullable', 'file', 'max:12288'],
        ]);

        $assistRequest = $this->aiAssistService->create(
            $module,
            $request->user(),
            $validated,
            $request->file('media')
        );

        return response()->json(['data' => AiAssistRequestResource::make($assistRequest)], 201);
    }
}
