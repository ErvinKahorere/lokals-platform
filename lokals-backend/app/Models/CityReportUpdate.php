<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CityReportUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_report_id',
        'user_id',
        'type',
        'visibility',
        'from_status',
        'to_status',
        'message',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(CityReport::class, 'city_report_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
