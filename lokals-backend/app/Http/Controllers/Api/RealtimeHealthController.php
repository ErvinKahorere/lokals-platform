<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Queue;

class RealtimeHealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $broadcastConnection = (string) config('broadcasting.default');
        $queueConnection = (string) config('queue.default');

        return response()->json([
            'data' => [
                'broadcast_driver' => $broadcastConnection,
                'queue_driver' => $queueConnection,
                'reverb' => [
                    'configured' => filled(config('broadcasting.connections.reverb.key'))
                        && filled(config('broadcasting.connections.reverb.app_id')),
                    'host_present' => filled(config('broadcasting.connections.reverb.options.host')),
                    'port_present' => filled(config('broadcasting.connections.reverb.options.port')),
                    'scheme_present' => filled(config('broadcasting.connections.reverb.options.scheme')),
                ],
                'pusher' => [
                    'configured' => filled(config('broadcasting.connections.pusher.key'))
                        && filled(config('broadcasting.connections.pusher.app_id')),
                    'host_present' => filled(config('broadcasting.connections.pusher.options.host')),
                    'port_present' => filled(config('broadcasting.connections.pusher.options.port')),
                    'scheme_present' => filled(config('broadcasting.connections.pusher.options.scheme')),
                ],
                'queue' => [
                    'size_available' => $this->queueSize() !== null,
                    'size' => $this->queueSize(),
                ],
                'channels' => [
                    'user' => 'users.{userId}',
                    'town_managers' => 'towns.{townId}.managers',
                    'platform_admins' => 'platform.admins',
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
}
