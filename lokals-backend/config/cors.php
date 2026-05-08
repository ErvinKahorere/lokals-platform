<?php

$frontendUrl = env('FRONTEND_URL');
$configuredOrigins = array_filter(array_map(
    static fn (string $origin): string => trim($origin),
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
));

$allowedOrigins = array_values(array_unique(array_filter([
    $frontendUrl,
    'https://lokals-platform.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...$configuredOrigins,
])));

return [
    'paths' => [
        'api/*',
        'auth/*',
        'my-businesses',
        'my-businesses/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
        'user',
    ],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'Authorization',
        'Accept',
        'Origin',
    ],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
