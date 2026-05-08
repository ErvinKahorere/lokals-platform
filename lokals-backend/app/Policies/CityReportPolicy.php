<?php

namespace App\Policies;

use App\Models\CityReport;
use App\Models\User;

class CityReportPolicy
{
    public function view(User $user, CityReport $cityReport): bool
    {
        if ($user->id === $cityReport->user_id || $user->hasAnyRole(['operator', 'super_admin'])) {
            return true;
        }

        if (! $user->hasAnyRole(['town_manager', 'municipality_admin'])) {
            return false;
        }

        if (($cityReport->town ?? null) && ($user->default_town ?? null) && $cityReport->town !== $user->default_town) {
            return false;
        }

        return ! $user->default_area || ! $cityReport->area || $cityReport->area === $user->default_area;
    }
}
