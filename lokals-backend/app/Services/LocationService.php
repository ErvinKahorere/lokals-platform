<?php

namespace App\Services;

class LocationService
{
    public function distanceKm(?float $fromLat, ?float $fromLng, ?float $toLat, ?float $toLng): ?float
    {
        if ($fromLat === null || $fromLng === null || $toLat === null || $toLng === null) {
            return null;
        }

        $earthRadius = 6371;
        $dLat = deg2rad($toLat - $fromLat);
        $dLng = deg2rad($toLng - $fromLng);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($fromLat)) * cos(deg2rad($toLat)) * sin($dLng / 2) ** 2;

        return round($earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a)), 2);
    }
}
