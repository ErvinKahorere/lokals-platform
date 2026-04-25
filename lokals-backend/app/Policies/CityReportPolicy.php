<?php

namespace App\Policies;

use App\Models\CityReport;
use App\Models\User;

class CityReportPolicy
{
    public function view(User $user, CityReport $cityReport): bool
    {
        return $user->id === $cityReport->user_id || $user->hasAnyRole(['municipality_admin', 'operator', 'super_admin']);
    }
}
