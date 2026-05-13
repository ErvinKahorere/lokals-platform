<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TownMetricSnapshot extends Model
{
    protected $fillable = [
        'town',
        'area',
        'snapshot_date',
        'metrics',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'metrics' => 'array',
    ];
}
