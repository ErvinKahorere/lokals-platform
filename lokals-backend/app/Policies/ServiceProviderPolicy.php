<?php

namespace App\Policies;

use App\Models\ServiceProvider;
use App\Models\User;

class ServiceProviderPolicy
{
    public function manage(User $user, ServiceProvider $provider): bool
    {
        return $user->id === $provider->user_id || $user->hasAnyRole(['operator', 'super_admin']);
    }
}
