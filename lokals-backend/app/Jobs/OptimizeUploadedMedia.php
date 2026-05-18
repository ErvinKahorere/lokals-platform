<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OptimizeUploadedMedia implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(
        public readonly string $disk,
        public readonly string $path,
        public readonly ?string $mimeType = null,
    ) {
    }

    public function handle(): void
    {
        try {
            $storage = Storage::disk($this->disk);

            if (! $storage->exists($this->path)) {
                Log::warning('Media optimization skipped because the file no longer exists.', [
                    'disk' => $this->disk,
                    'path' => $this->path,
                    'mime_type' => $this->mimeType,
                ]);

                return;
            }

            Log::info('Media optimization skipped because no optimizer pipeline is configured.', [
                'disk' => $this->disk,
                'path' => $this->path,
                'mime_type' => $this->mimeType,
                'size_bytes' => $storage->size($this->path),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Media optimization job completed without processing after a safe fallback.', [
                'disk' => $this->disk,
                'path' => $this->path,
                'mime_type' => $this->mimeType,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
