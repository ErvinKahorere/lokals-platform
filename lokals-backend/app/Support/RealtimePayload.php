<?php

namespace App\Support;

use DateTimeInterface;

class RealtimePayload
{
    public static function make(
        string $type,
        int|string $id,
        string $resourceType,
        int|string|null $resourceId = null,
        int|string|null $townId = null,
        int|string|null $userId = null,
        ?string $message = null,
        DateTimeInterface|string|null $createdAt = null,
        array $extra = [],
    ): array {
        $payload = [
            'type' => $type,
            'id' => (string) $id,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId !== null ? (string) $resourceId : null,
            'town_id' => $townId !== null ? (string) $townId : null,
            'user_id' => $userId !== null ? (string) $userId : null,
            'message' => $message,
            'created_at' => self::formatCreatedAt($createdAt),
        ];

        foreach ($extra as $key => $value) {
            $payload[$key] = $value;
        }

        return array_filter($payload, static fn ($value) => $value !== null);
    }

    private static function formatCreatedAt(DateTimeInterface|string|null $createdAt): ?string
    {
        if ($createdAt instanceof DateTimeInterface) {
            return $createdAt->toAtomString();
        }

        return $createdAt !== null ? (string) $createdAt : null;
    }
}
