<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\Organization;
use App\Models\Product;
use App\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function summary(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'providers' => ServiceProvider::count(),
            'bookings' => Booking::count(),
            'listings' => Listing::count(),
            'events' => Event::count(),
        ]);
    }

    public function overview(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'active_users' => User::query()->where('status', 'active')->count(),
            'listings' => Listing::count(),
            'jobs' => JobPost::count(),
            'reports' => CityReport::count(),
            'bookings' => Booking::count(),
            'providers' => ServiceProvider::count(),
            'active_alerts' => Alert::query()->where('is_active', true)->count(),
            'services_registered' => \App\Models\Service::count(),
            'products' => Product::count(),
            'events' => Event::count(),
            'event_tickets' => EventTicket::count(),
        ]);
    }

    public function municipalityDashboard(): JsonResponse
    {
        $reportsByStatus = CityReport::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $areas = collect(['Katutura', 'Khomasdal', 'Klein Windhoek', 'Eros', 'CBD'])
            ->map(fn (string $area) => [
                'area' => $area,
                'users' => User::query()->where('default_area', $area)->count(),
                'reports' => CityReport::query()->where('location', 'like', '%'.$area.'%')->count(),
            ])
            ->filter(fn (array $row) => $row['users'] > 0 || $row['reports'] > 0)
            ->values();

        return response()->json([
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::query()->where('status', 'active')->count(),
                'reports_count' => CityReport::count(),
                'alerts_sent' => Alert::count(),
                'services_registered' => ServiceProvider::count(),
                'directory_entries' => Organization::count(),
                'municipal_events' => Event::query()->where('category', 'municipal')->count(),
            ],
            'reports_by_status' => $reportsByStatus,
            'most_active_areas' => $areas,
            'most_requested_services' => ServiceProvider::query()
                ->select('category', DB::raw('count(*) as total'))
                ->groupBy('category')
                ->orderByDesc('total')
                ->limit(5)
                ->get(),
            'trending_issues' => CityReport::query()
                ->select('category', DB::raw('count(*) as total'))
                ->groupBy('category')
                ->orderByDesc('total')
                ->limit(5)
                ->get(),
            'recent_reports' => CityReport::query()->latest()->limit(6)->get(['id', 'title', 'category', 'location', 'status', 'created_at']),
            'recent_alerts' => Alert::query()->latest()->limit(4)->get(['id', 'title', 'location', 'priority', 'created_at']),
            'upcoming_events' => Event::query()->where('status', 'published')->where('starts_at', '>=', now())->orderBy('starts_at')->limit(6)->get(['id', 'title', 'category', 'town', 'area', 'starts_at']),
        ]);
    }
}
