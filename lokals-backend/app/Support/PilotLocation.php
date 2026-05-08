<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PilotLocation
{
    public static function isLocked(): bool
    {
        return (bool) config('lokals.location_lock', false);
    }

    public static function town(): string
    {
        return (string) config('lokals.pilot_town', 'Okahandja');
    }

    /**
     * @return list<string>
     */
    public static function allowedAreas(): array
    {
        return array_values(config('lokals.okahandja_areas', []));
    }

    public static function normalizeArea(?string $value): ?string
    {
        $candidate = trim((string) $value);
        if ($candidate === '') {
            return null;
        }

        foreach (self::allowedAreas() as $area) {
            if (Str::lower($area) === Str::lower($candidate)) {
                return $area;
            }
        }

        return self::isLocked() ? null : $candidate;
    }

    public static function requestTown(Request $request): ?string
    {
        if (self::isLocked()) {
            return self::town();
        }

        $town = $request->string('town')->trim()->value();

        return $town !== '' ? $town : null;
    }

    public static function requestArea(Request $request): ?string
    {
        return self::normalizeArea($request->string('area')->trim()->value());
    }

    public static function scope(Builder $query, Request $request, string $townField = 'town', string $areaField = 'area'): Builder
    {
        $town = self::requestTown($request);
        $area = self::requestArea($request);

        if ($town) {
            $query->where($townField, $town);
        }

        if ($area) {
            $query->where($areaField, $area);
        }

        return $query;
    }

    public static function profileTown(?string $town = null): string
    {
        if (self::isLocked()) {
            return self::town();
        }

        return trim((string) $town) !== '' ? (string) $town : self::town();
    }
}
