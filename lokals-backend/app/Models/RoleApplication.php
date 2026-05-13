<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoleApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'requested_role',
        'status',
        'full_name',
        'phone',
        'email',
        'town_id',
        'town_name',
        'city_name',
        'address',
        'national_id_number',
        'license_number',
        'vehicle_registration',
        'vehicle_type',
        'service_category',
        'organisation_name',
        'business_name',
        'documents',
        'notes',
        'rejection_reason',
        'approved_by',
        'approved_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
            'approved_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvalLogs(): HasMany
    {
        return $this->hasMany(RoleApprovalLog::class);
    }
}
