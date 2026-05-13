<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users.{userId}', function ($user, int $userId) {
    return $user->id === $userId;
});

Broadcast::channel('conversations.{conversationId}', function ($user, int $conversationId) {
    return Conversation::query()
        ->whereKey($conversationId)
        ->whereHas('participants', fn ($query) => $query->where('user_id', $user->id))
        ->exists();
});

Broadcast::channel('town.{town}', function ($user, string $town) {
    return true;
});

Broadcast::channel('announcements', function ($user = null) {
    return true;
});

Broadcast::channel('moderation.queue', function ($user) {
    return $user->hasAnyRole(['operator', 'municipality_admin', 'town_manager', 'super_admin']);
});
