<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CleanupOrphanedMedia implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Log::info('Orphaned media cleanup placeholder executed.');
    }
}
