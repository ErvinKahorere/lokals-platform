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
        $latDelta = deg2rad($toLat - $fromLat);
        $lngDelta = deg2rad($toLng - $fromLng);
        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($fromLat)) * cos(deg2rad($toLat)) * sin($lngDelta / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 1);
    }

    public function mapsUrl(?float $lat, ?float $lng, ?string $label = null): ?string
    {
        if ($lat === null || $lng === null) {
            return null;
        }

        $marker = $label ? '('.urlencode($label).')' : '';

        return "https://www.openstreetmap.org/?mlat={$lat}&mlon={$lng}#map=16/{$lat}/{$lng}{$marker}";
    }
}
