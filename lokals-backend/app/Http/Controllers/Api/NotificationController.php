<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\NotificationPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()
            ->notifications()
            ->latest();

        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        $notifications = $query
            ->paginate((int) $request->integer('per_page', 20))
            ->through(fn (DatabaseNotification $notification) => $this->transformNotification($notification));

        return response()->json([
            ...$notifications->toArray(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        /** @var DatabaseNotification|null $notification */
        $notification = $request->user()->notifications()->whereKey($id)->first();
        abort_unless($notification, 404);

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'id' => $notification->id,
            'notification' => $this->transformNotification($notification->fresh()),
            'unread_count' => $request->user()->fresh()->unreadNotifications()->count(),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'Notifications marked as read',
            'unread_count' => 0,
        ]);
    }

    private function transformNotification(DatabaseNotification $notification): array
    {
        $data = NotificationPayload::enrich($notification->data);

        return [
            'id' => $notification->id,
            'type' => $data['type'] ?? class_basename($notification->type),
            'title' => $data['title'] ?? 'Notification',
            'body' => $data['body'] ?? $data['message'] ?? 'You have a new update.',
            'target_type' => $data['target_type'] ?? $data['target']['type'] ?? null,
            'target_id' => $data['target_id'] ?? $data['target']['id'] ?? null,
            'target' => [
                'id' => $data['target']['id'] ?? null,
                'type' => $data['target']['type'] ?? null,
                'href' => $data['target']['href'] ?? null,
                'external_url' => $data['target']['external_url'] ?? null,
                'source_name' => $data['target']['source_name'] ?? null,
                'title' => $data['target']['title'] ?? null,
            ],
            'read_at' => optional($notification->read_at)?->toIso8601String(),
            'created_at' => optional($notification->created_at)?->toIso8601String(),
            'data' => $data,
        ];
    }
}
