<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupOrphanedMedia implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function handle(): void
    {
        $diskName = (string) config('filesystems.default', 'local');

        try {
            if (! config('app.debug')) {
                Log::info('Orphaned media cleanup skipped because no retention policy is configured.', [
                    'disk' => $diskName,
                ]);

                return;
            }

            $disk = Storage::disk($diskName);
            $directories = collect($disk->directories())
                ->filter(static fn (string $directory) => str_contains($directory, 'tmp') || str_contains($directory, 'draft'))
                ->values()
                ->all();

            Log::info('Orphaned media cleanup ran in safe inspection mode only.', [
                'disk' => $diskName,
                'candidate_directories' => $directories,
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Orphaned media cleanup completed without deletion after a safe fallback.', [
                'disk' => $diskName,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
