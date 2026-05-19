<?php

namespace App\Support;

use Carbon\CarbonImmutable;

class CommerceAvailability
{
    /**
     * @param  array<int, array<string, mixed>>|null  $openingHours
     * @return array<string, mixed>
     */
    public static function availability(?string $status, ?array $openingHours = null): array
    {
        $normalized = strtolower((string) ($status ?: 'active'));

        if ($normalized === 'paused') {
            return self::state('paused', 'Paused', false, false, false);
        }

        if ($normalized === 'busy') {
            return self::state('busy', 'Busy', true, false, true);
        }

        if ($normalized === 'pickup_only') {
            return self::state('pickup_only', 'Pickup only', true, false, false, true);
        }

        if ($normalized !== 'active') {
            return self::state('closed', 'Closed', false, false, false);
        }

        $now = CarbonImmutable::now(config('app.timezone'));
        $schedule = collect($openingHours ?? [])
            ->first(function (mixed $slot) use ($now): bool {
                if (! is_array($slot)) {
                    return false;
                }

                return strtolower((string) ($slot['day'] ?? '')) === strtolower($now->format('l'));
            });

        if (! is_array($schedule) || blank($schedule['open'] ?? null) || blank($schedule['close'] ?? null)) {
            return self::state('open_now', 'Open now', true, false, false);
        }

        $openAt = self::timeForToday($now, (string) $schedule['open']);
        $closeAt = self::timeForToday($now, (string) $schedule['close']);

        if (! $openAt || ! $closeAt) {
            return self::state('open_now', 'Open now', true, false, false);
        }

        if ($now->lt($openAt) || $now->gte($closeAt)) {
            return self::state('closed', 'Closed', false, false, false);
        }

        $closingSoon = $now->diffInMinutes($closeAt, false) <= 45;

        return $closingSoon
            ? self::state('closing_soon', 'Closing soon', true, true, false)
            : self::state('open_now', 'Open now', true, false, false);
    }

    /**
     * @return array<string, mixed>
     */
    public static function commerceMeta(
        ?string $category,
        ?string $status,
        ?array $openingHours = null,
        int $followersCount = 0,
        int $serviceCount = 0,
        bool $isVerified = false,
    ): array {
        $availability = self::availability($status, $openingHours);
        $group = self::groupFor($category);
        $reviewCount = max(12, $followersCount * 2, $serviceCount * 4, $isVerified ? 28 : 16);
        $ratingBase = match ($group) {
            'food' => 4.6,
            'groceries' => 4.5,
            'shops' => 4.4,
            'services' => 4.5,
            default => 4.4,
        };
        $rating = min(4.9, $ratingBase + ($reviewCount / 240));
        $deliveryFee = match ($group) {
            'food' => 18,
            'groceries' => 22,
            'shops' => 25,
            default => 0,
        };
        $deliveryEta = match ($group) {
            'food' => 22,
            'groceries' => 30,
            'shops' => 34,
            default => 0,
        };

        if (($availability['code'] ?? null) === 'pickup_only') {
            $deliveryFee = 0;
            $deliveryEta = 0;
        }

        return [
            'commerce_category' => $group,
            'open_now' => (bool) $availability['is_open'],
            'availability' => $availability,
            'availability_status' => $availability['label'],
            'availability_code' => $availability['code'],
            'rating' => round($rating, 1),
            'review_count' => $reviewCount,
            'delivery_fee' => $deliveryFee,
            'delivery_eta_minutes' => $deliveryEta,
            'fast_delivery' => $deliveryEta > 0 && $deliveryEta <= 25,
            'featured' => $isVerified || $followersCount >= 10,
            'popular' => $followersCount >= 5 || $serviceCount >= 3,
        ];
    }

    public static function groupFor(?string $category): string
    {
        $value = strtolower((string) $category);

        return match (true) {
            str_contains($value, 'food'),
            str_contains($value, 'restaurant'),
            str_contains($value, 'takeaway'),
            str_contains($value, 'cafe'),
            str_contains($value, 'bakery') => 'food',
            str_contains($value, 'grocery'),
            str_contains($value, 'produce'),
            str_contains($value, 'supermarket'),
            str_contains($value, 'pharmacy') => 'groceries',
            str_contains($value, 'service'),
            str_contains($value, 'repair'),
            str_contains($value, 'salon'),
            str_contains($value, 'clean') => 'services',
            default => 'shops',
        };
    }

    /**
     * @return array<string, mixed>
     */
    private static function state(
        string $code,
        string $label,
        bool $isOpen,
        bool $closingSoon,
        bool $busy,
        bool $pickupOnly = false,
    ): array {
        return [
            'code' => $code,
            'label' => $label,
            'is_open' => $isOpen,
            'closing_soon' => $closingSoon,
            'busy' => $busy,
            'paused' => $code === 'paused',
            'pickup_only' => $pickupOnly,
            'supports_delivery' => $isOpen && ! $pickupOnly && $code !== 'paused',
        ];
    }

    private static function timeForToday(CarbonImmutable $reference, string $value): ?CarbonImmutable
    {
        try {
            [$hour, $minute] = array_pad(explode(':', $value), 2, '0');

            return $reference->setTime((int) $hour, (int) $minute);
        } catch (\Throwable) {
            return null;
        }
    }
}
