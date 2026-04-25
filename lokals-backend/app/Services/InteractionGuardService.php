<?php

namespace App\Services;

use App\Models\Block;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class InteractionGuardService
{
    public function ensureUsersCanInteract(User $actor, ?User $counterparty): void
    {
        if (! $counterparty) {
            return;
        }

        $isBlocked = Block::query()
            ->where(function ($query) use ($actor, $counterparty): void {
                $query->where('user_id', $actor->id)->where('blocked_user_id', $counterparty->id);
            })
            ->orWhere(function ($query) use ($actor, $counterparty): void {
                $query->where('user_id', $counterparty->id)->where('blocked_user_id', $actor->id);
            })
            ->exists();

        if ($isBlocked) {
            throw ValidationException::withMessages([
                'interaction' => ['This action is not allowed because one of the users has blocked the other.'],
            ]);
        }
    }
}
