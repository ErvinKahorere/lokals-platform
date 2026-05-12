<?php

namespace App\Models;

use App\Services\CommunityImpactService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CommunityProject extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::updated(function (CommunityProject $project): void {
            $completed = $project->status === 'completed' || $project->completed_at !== null;
            if ((! $project->wasChanged(['status', 'completed_at', 'verification_status'])) || ! $completed || $project->verification_status !== 'approved' || ! $project->user) {
                return;
            }

            app(CommunityImpactService::class)->createPendingTransaction(
                $project->user,
                35,
                'Verified community project participation',
                'community_project_participation',
                'community_project',
                $project->id,
                'Verified community participation',
                false,
                'Created automatically when a verified community project was completed.'
            );
        });
    }

    protected $fillable = [
        'user_id',
        'organization_id',
        'category_id',
        'title',
        'slug',
        'reference_code',
        'summary',
        'description',
        'support_needed',
        'target_amount',
        'target_items',
        'target_volunteers',
        'current_amount',
        'current_items',
        'current_volunteers',
        'location_text',
        'town',
        'area',
        'latitude',
        'longitude',
        'contact_name',
        'contact_phone',
        'contact_whatsapp',
        'contact_email',
        'status',
        'verification_status',
        'verification_notes',
        'rejection_reason',
        'is_verified',
        'is_featured',
        'starts_at',
        'ends_at',
        'approved_at',
        'approved_by',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'support_needed' => 'array',
            'target_items' => 'array',
            'current_items' => 'array',
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'target_volunteers' => 'integer',
            'current_volunteers' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'approved_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CommunityProjectCategory::class, 'category_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CommunityProjectAttachment::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(CommunityProjectUpdate::class);
    }

    public function pledges(): HasMany
    {
        return $this->hasMany(CommunityProjectPledge::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(CommunityProjectVerification::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function followers(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }
}
