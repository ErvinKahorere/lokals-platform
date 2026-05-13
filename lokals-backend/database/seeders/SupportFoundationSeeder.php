<?php

namespace Database\Seeders;

use App\Models\SupportIntent;
use App\Models\SupportKnowledgeBaseArticle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SupportFoundationSeeder extends Seeder
{
    public function run(): void
    {
        $intents = [
            [
                'key' => 'report_issue',
                'name' => 'Report an issue',
                'training_phrases' => ['report issue', 'water leak', 'pothole', 'streetlight', 'waste collection'],
                'response_template' => 'You can report a city issue in a few steps. Add a short title, description, and location, then submit it to the town service desk.',
                'suggested_route' => '/report-issue',
            ],
            [
                'key' => 'find_services',
                'name' => 'Find services',
                'training_phrases' => ['find service', 'plumber', 'electrician', 'services nearby'],
                'response_template' => 'Open Services to browse trusted local providers, view verification, and request bookings.',
                'suggested_route' => '/services',
            ],
            [
                'key' => 'ride_help',
                'name' => 'Taxi and ride help',
                'training_phrases' => ['taxi', 'ride request', 'transport'],
                'response_template' => 'Use the Ride request flow to ask for a taxi or local transport pickup.',
                'suggested_route' => '/ride',
            ],
            [
                'key' => 'delivery_help',
                'name' => 'Delivery help',
                'training_phrases' => ['delivery', 'parcel', 'courier'],
                'response_template' => 'Use Delivery to send parcels, medicine, and small goods across town.',
                'suggested_route' => '/delivery',
            ],
        ];

        foreach ($intents as $intent) {
            SupportIntent::query()->updateOrCreate(
                ['key' => $intent['key']],
                [
                    'name' => $intent['name'],
                    'description' => $intent['name'],
                    'training_phrases' => $intent['training_phrases'],
                    'response_template' => $intent['response_template'],
                    'suggested_route' => $intent['suggested_route'],
                    'is_active' => true,
                ]
            );
        }

        $articles = [
            [
                'title' => 'How to report a city issue',
                'category' => 'reporting',
                'summary' => 'Open Report Issue, add a short title, describe the problem, and set the location.',
                'body' => 'LOKALS sends issue reports to the local service desk. Adding a photo helps the Town Manager verify the issue faster.',
                'route_hint' => '/report-issue',
                'tags' => ['report', 'issue', 'town services'],
                'priority' => 90,
            ],
            [
                'title' => 'How to find emergency support',
                'category' => 'safety',
                'summary' => 'Use SOS for urgent help and Alerts for official emergency notices.',
                'body' => 'SOS is reserved for urgent situations. Town alerts and service notices are available in Alerts and the feed.',
                'route_hint' => '/sos',
                'tags' => ['sos', 'emergency', 'alerts'],
                'priority' => 100,
            ],
            [
                'title' => 'How to track your requests',
                'category' => 'account',
                'summary' => 'Open Activity to follow bookings, reports, tickets, rides, deliveries, and key notifications.',
                'body' => 'Activity brings your most important resident updates into one timeline.',
                'route_hint' => '/activity',
                'tags' => ['activity', 'requests', 'notifications'],
                'priority' => 85,
            ],
        ];

        foreach ($articles as $article) {
            SupportKnowledgeBaseArticle::query()->updateOrCreate(
                ['slug' => Str::slug($article['title'])],
                [
                    ...$article,
                    'slug' => Str::slug($article['title']),
                    'is_published' => true,
                    'town' => 'Okahandja',
                ]
            );
        }
    }
}
