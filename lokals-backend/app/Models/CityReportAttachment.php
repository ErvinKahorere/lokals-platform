<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CityReportAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_report_id',
        'user_id',
        'file_path',
        'file_url',
        'mime_type',
        'file_type',
        'original_name',
        'size',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
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
