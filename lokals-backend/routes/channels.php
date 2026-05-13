<?php

use App\Models\Conversation;
use App\Support\PilotLocation;
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

Broadcast::channel('towns.{townId}.managers', function ($user, string $townId) {
    if (! $user->hasTownManagerAccess()) {
        return false;
    }

    if ($user->hasAnyRole(['super_admin', 'operator'])) {
        return true;
    }

    return PilotLocation::profileTown($user->default_town) === PilotLocation::profileTown($townId);
});

Broadcast::channel('platform.admins', function ($user) {
    return $user->hasAnyRole(['super_admin', 'operator']);
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
