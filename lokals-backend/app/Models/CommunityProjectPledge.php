<?php

namespace App\Models;

use App\Services\CommunityImpactService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityProjectPledge extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::updated(function (CommunityProjectPledge $pledge): void {
            if (! $pledge->wasChanged('status') || $pledge->status !== 'fulfilled' || ! $pledge->user) {
                return;
            }

            app(CommunityImpactService::class)->createPendingTransaction(
                $pledge->user,
                40,
                'Verified fulfilled community support pledge',
                'community_pledge_fulfilled',
                'community_project_pledge',
                $pledge->id,
                'Fulfilled community pledge',
                false,
                'Created automatically when a community pledge was marked fulfilled.'
            );
        });
    }

    protected $fillable = [
        'community_project_id',
        'user_id',
        'pledge_type',
        'pledge_description',
        'amount',
        'quantity',
        'contact_phone',
        'contact_email',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(CommunityProject::class, 'community_project_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
