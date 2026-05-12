<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityProjectUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_project_id',
        'user_id',
        'title',
        'body',
        'status_after_update',
        'progress_percent',
        'attachments',
        'approved_by_town_manager',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'approved_by_town_manager' => 'boolean',
            'progress_percent' => 'integer',
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
