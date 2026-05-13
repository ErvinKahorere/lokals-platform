<?php

namespace App\Services\AiAssist;

use App\Models\AiAssistRequest;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AiAssistService
{
    public function __construct(
        private readonly MockAiAssistProvider $mockProvider,
    ) {
    }

    public function create(string $module, ?User $user, array $payload, ?UploadedFile $media = null): AiAssistRequest
    {
        $provider = $this->resolveProvider();
        $storedMediaUrl = null;
        $filename = $media?->getClientOriginalName();

        if ($media) {
            $path = $media->store('ai-assist-media', config('ai_assist.storage_disk', 'public'));
            $storedMediaUrl = Storage::disk(config('ai_assist.storage_disk', 'public'))->url($path);
        }

        $suggestion = $provider->suggest($module, [
            ...$payload,
            'filename' => $filename,
            'media_url' => $storedMediaUrl,
        ]);

        $request = AiAssistRequest::query()->create([
            'user_id' => $user?->id,
            'module' => $module,
            'provider_key' => $provider->key(),
            'status' => 'completed',
            'original_media_url' => $storedMediaUrl,
            'original_filename' => $filename,
            'payload' => $payload,
            'safety_status' => $suggestion['safety_status'] ?? 'clear',
            'confidence_score' => $suggestion['confidence_score'] ?? null,
            'needs_user_review' => (bool) ($suggestion['needs_user_review'] ?? true),
        ]);

        $request->suggestions()->create([
            'suggestion_type' => 'form_fill',
            'content' => $suggestion,
            'is_primary' => true,
        ]);

        return $request->load('suggestions');
    }

    private function resolveProvider(): AiAssistProvider
    {
        return match (config('ai_assist.default_provider', 'mock')) {
            default => $this->mockProvider,
        };
    }
}
