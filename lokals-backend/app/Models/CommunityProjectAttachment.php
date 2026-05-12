<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityProjectAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_project_id',
        'user_id',
        'file_path',
        'file_url',
        'mime_type',
        'file_type',
        'original_name',
        'size',
        'caption',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
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
