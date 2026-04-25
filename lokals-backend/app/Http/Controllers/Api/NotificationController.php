<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate((int) $request->integer('per_page', 20))
            ->through(fn (DatabaseNotification $notification) => [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? class_basename($notification->type),
                'title' => $notification->data['title'] ?? 'Notification',
                'body' => $notification->data['body'] ?? $notification->data['message'] ?? 'You have a new update.',
                'target' => [
                    'id' => $notification->data['target']['id'] ?? null,
                    'type' => $notification->data['target']['type'] ?? null,
                    'href' => $notification->data['target']['href'] ?? null,
                ],
                'read_at' => optional($notification->read_at)?->toIso8601String(),
                'created_at' => optional($notification->created_at)?->toIso8601String(),
                'data' => $notification->data,
            ]);

        return response()->json($notifications);
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
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Notifications marked as read']);
    }
}
