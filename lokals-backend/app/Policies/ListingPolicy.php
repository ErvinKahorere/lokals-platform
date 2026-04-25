<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    public function update(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id || $user->hasAnyRole(['operator', 'super_admin']);
    }
}
