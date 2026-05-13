<?php

return [
    'default_provider' => env('AI_ASSIST_PROVIDER', 'mock'),
    'confidence_floor' => (float) env('AI_ASSIST_CONFIDENCE_FLOOR', 0.45),
    'storage_disk' => env('AI_ASSIST_STORAGE_DISK', 'public'),
];
