<?php

namespace App\Services;

class AutoFillDraftService
{
    public function suggest(array $payload): array
    {
        $type = $payload['type'] ?? 'marketplace';
        $location = $payload['location'] ?? 'Windhoek';
        $filename = strtolower(pathinfo($payload['filename'] ?? '', PATHINFO_FILENAME));

        $category = match (true) {
            str_contains($filename, 'phone') => 'Electronics',
            str_contains($filename, 'chair'), str_contains($filename, 'table') => 'Furniture',
            str_contains($filename, 'parcel') => 'Delivery',
            default => ucfirst($type),
        };

        $title = $payload['title'] ?? trim(($type === 'service' ? 'Local service' : 'Local item').' '.$category);
        $description = $payload['description'] ?? "Suggested from your photo. Review and publish when ready.";

        return [
            'suggested_title' => $title,
            'suggested_category' => $category,
            'suggested_description' => $description,
            'suggested_price' => $type === 'delivery' ? 65 : ($type === 'service' ? 250 : 450),
            'location' => $location,
            'metadata' => [
                'source' => 'fallback_autofill',
                'filename' => $payload['filename'] ?? null,
            ],
        ];
    }
}
