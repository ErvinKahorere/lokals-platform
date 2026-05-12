<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class MediaUrl
{
    public static function resolve(?string $path): ?string
    {
        if (! is_string($path)) {
            return null;
        }

        $value = trim($path);

        if ($value === '') {
            return null;
        }

        if (preg_match('/^(https?:)?\/\//i', $value) || str_starts_with($value, 'data:')) {
            return $value;
        }

        if (str_starts_with($value, '/storage/')) {
            return url($value);
        }

        if (str_starts_with($value, 'storage/')) {
            return url('/' . ltrim($value, '/'));
        }

        return Storage::disk('public')->url(ltrim($value, '/'));
    }
}
