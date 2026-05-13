<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\TownMetricSnapshot;
use App\Models\User;
use App\Models\UserEngagementMetric;

class AnalyticsService
{
    public function record(?User $user, string $eventName, array $payload = []): AnalyticsEvent
    {
        $event = AnalyticsEvent::query()->create([
            'user_id' => $user?->id,
            'event_name' => $eventName,
            'category' => $payload['category'] ?? null,
            'town' => $payload['town'] ?? $user?->default_town,
            'area' => $payload['area'] ?? $user?->default_area,
            'subject_type' => $payload['subject_type'] ?? null,
            'subject_id' => $payload['subject_id'] ?? null,
            'metadata' => $payload['metadata'] ?? null,
            'ip_address' => request()?->ip(),
            'platform' => $payload['platform'] ?? request()?->header('X-Platform'),
        ]);

        if ($user !== null) {
            $metric = UserEngagementMetric::query()->firstOrNew([
                'user_id' => $user->id,
                'metric_key' => $eventName,
            ]);
            $metric->metric_value = (float) $metric->metric_value + (float) ($payload['weight'] ?? 1);
            $metric->metadata = array_merge($metric->metadata ?? [], $payload['metric_metadata'] ?? []);
            $metric->last_recorded_at = now();
            $metric->save();
        }

        return $event;
    }

    public function snapshotTown(string $town, ?string $area = null, array $metrics = []): TownMetricSnapshot
    {
        return TownMetricSnapshot::query()->updateOrCreate(
            [
                'town' => $town,
                'area' => $area,
                'snapshot_date' => now()->toDateString(),
            ],
            [
                'metrics' => $metrics,
            ],
        );
    }
}
