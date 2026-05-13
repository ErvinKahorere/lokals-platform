<?php

namespace App\Support;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Support\Collection;

class RealtimeChannels
{
    public static function user(int|string $userId): PrivateChannel
    {
        return new PrivateChannel('users.'.$userId);
    }

    /**
     * @param  iterable<int|string|null>  $userIds
     * @return array<int, PrivateChannel>
     */
    public static function users(iterable $userIds): array
    {
        return collect($userIds)
            ->filter(static fn ($userId) => $userId !== null && $userId !== '')
            ->map(static fn ($userId) => (string) $userId)
            ->unique()
            ->values()
            ->map(static fn (string $userId) => self::user($userId))
            ->all();
    }

    public static function townManagers(int|string|null $townId): ?PrivateChannel
    {
        if ($townId === null || $townId === '') {
            return null;
        }

        return new PrivateChannel('towns.'.$townId.'.managers');
    }

    public static function platformAdmins(): PrivateChannel
    {
        return new PrivateChannel('platform.admins');
    }

    /**
     * @return array<int, PrivateChannel>
     */
    public static function operational(int|string|null $townId = null): array
    {
        return self::unique(collect([
            self::townManagers($townId),
            self::platformAdmins(),
        ]));
    }

    /**
     * @param  iterable<PrivateChannel|null>  $channels
     * @return array<int, PrivateChannel>
     */
    public static function unique(iterable $channels): array
    {
        return Collection::make($channels)
            ->filter(static fn ($channel) => $channel instanceof PrivateChannel)
            ->unique(static fn (PrivateChannel $channel) => $channel->name)
            ->values()
            ->all();
    }
}
