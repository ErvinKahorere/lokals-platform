<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;

class QueueHealthController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole([
            'super_admin',
            'operator',
            'town_manager',
            'municipality_admin',
        ]), 403);

        return response()->json([
            'data' => [
                'queue_driver' => (string) config('queue.default'),
                'broadcast_driver' => (string) config('broadcasting.default'),
                'redis' => [
                    'configured' => filled(config('database.redis.default.host')),
                    'host_present' => filled(config('database.redis.default.host')),
                    'port_present' => filled(config('database.redis.default.port')),
                ],
                'jobs' => [
                    'table_present' => Schema::hasTable('jobs'),
                    'pending_count' => $this->queueSize(),
                ],
                'failed_jobs' => [
                    'table_present' => Schema::hasTable('failed_jobs'),
                    'count' => $this->failedJobsCount(),
                ],
                'workers' => [
                    'recommended_command' => 'php artisan queue:work --sleep=3 --tries=3 --timeout=120 --max-jobs=500',
                ],
                'timestamp' => now()->toAtomString(),
            ],
        ]);
    }

    private function queueSize(): ?int
    {
        try {
            $size = Queue::size();

            return is_numeric($size) ? (int) $size : null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function failedJobsCount(): ?int
    {
        try {
            if (! Schema::hasTable('failed_jobs')) {
                return null;
            }

            return (int) DB::table('failed_jobs')->count();
        } catch (\Throwable) {
            return null;
        }
    }
}
