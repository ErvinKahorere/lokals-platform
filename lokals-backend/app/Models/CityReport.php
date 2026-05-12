<?php

namespace App\Models;

use App\Services\CommunityImpactService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CityReport extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::updated(function (CityReport $report): void {
            if (! $report->wasChanged('status') || $report->status !== 'resolved' || ! $report->user) {
                return;
            }

            app(CommunityImpactService::class)->createPendingTransaction(
                $report->user,
                10,
                'Verified useful issue report',
                'issue_report_resolved',
                'city_report',
                $report->id,
                'Helpful issue report',
                false,
                'Created automatically when a city report was resolved.'
            );
        });
    }

    protected $fillable = [
        'user_id',
        'category',
        'title',
        'description',
        'location',
        'town',
        'area',
        'lat',
        'lng',
        'status',
        'priority',
        'photo_url',
        'assigned_to',
        'resolution_notes',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
