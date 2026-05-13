<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ModerationAction extends Model
{
    protected $fillable = [
        'moderation_report_id',
        'actor_id',
        'action',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(ModerationReport::class, 'moderation_report_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function actionable(): MorphTo
    {
        return $this->morphTo();
    }
}
