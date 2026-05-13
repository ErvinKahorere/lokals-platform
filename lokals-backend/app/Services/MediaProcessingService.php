<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class MediaProcessingService
{
    public function metadataFor(UploadedFile $file): array
    {
        return [
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }

    public function shouldGenerateThumbnail(?string $mimeType): bool
    {
        if ($mimeType === null) {
            return false;
        }

        return str_starts_with($mimeType, 'image/') || str_starts_with($mimeType, 'video/');
    }
}
