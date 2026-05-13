<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class OptimizeUploadedMedia implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $disk,
        public readonly string $path,
        public readonly ?string $mimeType = null,
    ) {
    }

    public function handle(): void
    {
        Log::info('Media optimization placeholder executed.', [
            'disk' => $this->disk,
            'path' => $this->path,
            'mime_type' => $this->mimeType,
        ]);
    }
}
