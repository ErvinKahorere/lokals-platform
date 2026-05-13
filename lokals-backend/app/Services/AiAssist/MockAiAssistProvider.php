<?php

namespace App\Services\AiAssist;

class MockAiAssistProvider implements AiAssistProvider
{
    public function key(): string
    {
        return 'mock';
    }

    public function suggest(string $module, array $payload): array
    {
        $titleSeed = trim((string) ($payload['title'] ?? $payload['location'] ?? 'Local update'));
        $filename = strtolower(pathinfo((string) ($payload['filename'] ?? ''), PATHINFO_FILENAME));
        $description = trim((string) ($payload['description'] ?? ''));

        $category = match (true) {
            str_contains($filename, 'water') || str_contains($description, 'water') => 'water',
            str_contains($filename, 'road') || str_contains($description, 'road') => 'roads',
            str_contains($filename, 'chair') || str_contains($filename, 'table') => 'furniture',
            str_contains($filename, 'phone') => 'electronics',
            $module === 'issue-report' => 'other',
            $module === 'business' => 'retail',
            $module === 'community-project' => 'community_support',
            default => 'general',
        };

        $priceEstimate = match ($module) {
            'marketplace' => 350,
            'business' => 0,
            'issue-report' => 0,
            'community-project' => 0,
            default => 0,
        };

        return [
            'title' => $titleSeed !== '' ? $titleSeed : match ($module) {
                'issue-report' => 'Issue reported near '.$payload['location'] ?? 'Okahandja',
                'community-project' => 'Community support drive',
                'business' => 'Local business listing',
                default => 'Marketplace listing',
            },
            'category' => $category,
            'description' => $description !== '' ? $description : 'Generated suggestion from the uploaded media. Please review and edit before publishing.',
            'condition' => $module === 'marketplace' ? 'good' : null,
            'tags' => array_values(array_filter([$category, 'okahandja', $module])),
            'price_estimate' => $priceEstimate > 0 ? $priceEstimate : null,
            'location_hint' => $payload['location'] ?? 'Okahandja',
            'missing_fields' => array_values(array_filter([
                empty($payload['title']) ? 'title' : null,
                empty($payload['description']) ? 'description' : null,
                empty($payload['location']) ? 'location' : null,
            ])),
            'confidence_score' => 0.78,
            'needs_user_review' => true,
            'safety_status' => 'clear',
            'public_summary' => 'AI-assisted draft suggestion ready for review.',
        ];
    }
}
