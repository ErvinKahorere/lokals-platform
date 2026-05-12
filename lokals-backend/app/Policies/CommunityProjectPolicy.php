<?php

namespace App\Policies;

use App\Models\CommunityProject;
use App\Models\User;

class CommunityProjectPolicy
{
    public function update(User $user, CommunityProject $project): bool
    {
        if ($user->hasAnyRole(['town_manager', 'municipality_admin', 'super_admin', 'operator'])) {
            return true;
        }

        if ($project->user_id !== $user->id) {
            return false;
        }

        return in_array($project->verification_status, ['pending', 'changes_requested'], true)
            || in_array($project->status, ['draft', 'submitted'], true);
    }

    public function review(User $user, CommunityProject $project): bool
    {
        return $user->hasAnyRole(['town_manager', 'municipality_admin', 'super_admin', 'operator']);
    }
}
