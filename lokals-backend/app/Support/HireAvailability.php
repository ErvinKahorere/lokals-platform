<?php

namespace App\Support;

use App\Models\HireBooking;
use App\Models\HireItem;
use Carbon\CarbonInterface;

class HireAvailability
{
    public static function isAvailable(HireItem $item, CarbonInterface $start, CarbonInterface $end, ?int $ignoreBookingId = null): bool
    {
        return ! static::hasOverlap($item, $start, $end, $ignoreBookingId);
    }

    public static function hasOverlap(HireItem $item, CarbonInterface $start, CarbonInterface $end, ?int $ignoreBookingId = null): bool
    {
        return HireBooking::query()
            ->where('hire_item_id', $item->id)
            ->whereIn('status', HireBooking::ACTIVE_AVAILABILITY_STATUSES)
            ->when($ignoreBookingId, fn ($query) => $query->whereKeyNot($ignoreBookingId))
            ->where(function ($query) use ($start, $end): void {
                $query
                    ->whereBetween('start_at', [$start, $end])
                    ->orWhereBetween('end_at', [$start, $end])
                    ->orWhere(function ($inner) use ($start, $end): void {
                        $inner->where('start_at', '<=', $start)
                            ->where('end_at', '>=', $end);
                    });
            })
            ->exists();
    }

    /**
     * @return array<string, mixed>
     */
    public static function summary(HireItem $item, ?CarbonInterface $start = null, ?CarbonInterface $end = null): array
    {
        $requested = $start && $end
            ? static::isAvailable($item, $start, $end)
            : null;

        $nextBooking = HireBooking::query()
            ->where('hire_item_id', $item->id)
            ->whereIn('status', HireBooking::ACTIVE_AVAILABILITY_STATUSES)
            ->orderBy('end_at')
            ->first();

        return [
            'available' => $requested ?? ($nextBooking === null && $item->status === HireItem::STATUS_ACTIVE && $item->verification_status === HireItem::VERIFICATION_APPROVED),
            'requested_window_available' => $requested,
            'next_available_at' => optional($nextBooking?->end_at)->toIso8601String(),
            'status' => $item->status,
            'verification_status' => $item->verification_status,
        ];
    }
}
