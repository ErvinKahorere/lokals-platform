<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AlertFeedController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\CityServiceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DeviceTokenController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\FollowFeedController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\AccommodationController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\ModerationController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\NewsSourceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PreferenceController;
use App\Http\Controllers\Api\PostDraftController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RideController;
use App\Http\Controllers\Api\SafetyController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SavedItemController;
use App\Http\Controllers\Api\ServiceProviderController;
use App\Http\Controllers\Api\SosController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\WorkerController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'LOKALS',
        'environment' => app()->environment(),
    ]);
});

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::get('/feed', [FeedController::class, 'index']);
    Route::get('/marketplace', [ListingController::class, 'index']);
    Route::get('/marketplace/{listing}', [ListingController::class, 'show']);
    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/{job}', [JobController::class, 'show']);
    Route::get('/workers', [WorkerController::class, 'index']);
    Route::get('/workers/{worker}', [WorkerController::class, 'show']);
    Route::get('/directory', [OrganizationController::class, 'index']);
    Route::get('/directory/{organization}', [OrganizationController::class, 'show']);
    Route::get('/directory/{organization}/alerts', [OrganizationController::class, 'alerts']);
    Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
    Route::get('/store/products', [ProductController::class, 'index']);
    Route::get('/store/products/{product}', [ProductController::class, 'show']);
    Route::get('/store/sale-alerts', [ProductController::class, 'saleAlerts']);
    Route::get('/accommodations', [AccommodationController::class, 'index']);
    Route::get('/accommodations/{accommodation}', [AccommodationController::class, 'show']);
    Route::get('/announcements', [CityServiceController::class, 'announcements']);
    Route::get('/alerts', [CityServiceController::class, 'alerts']);
    Route::get('/alerts/feed', [AlertFeedController::class, 'index']);
    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/feed', [NewsController::class, 'feed']);
    Route::get('/news/trending', [NewsController::class, 'trending']);
    Route::get('/news/local', [NewsController::class, 'local']);
    Route::get('/news/{newsItem}', [NewsController::class, 'show']);
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/calendar', [EventController::class, 'calendar']);
    Route::get('/events/upcoming', [EventController::class, 'upcoming']);
    Route::get('/events/nearby', [EventController::class, 'nearby']);
    Route::get('/events/{event}', [EventController::class, 'show']);
    Route::get('/events/{event}/calendar.ics', [EventController::class, 'downloadCalendar']);
    Route::get('/search', [SearchController::class, 'index']);
    Route::get('/service-providers', [ServiceProviderController::class, 'index']);
    Route::get('/service-providers/{serviceProvider}', [ServiceProviderController::class, 'show']);
    Route::get('/service-providers/{serviceProvider}/services', [ServiceProviderController::class, 'services']);
    Route::get('/service-providers/{serviceProvider}/availability', [ServiceProviderController::class, 'availability']);
    Route::get('/subscription-plans', [SubscriptionController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/dashboard/citizen', [DashboardController::class, 'citizen']);
        Route::get('/dashboard/worker', [DashboardController::class, 'worker']);
        Route::get('/dashboard/seller', [DashboardController::class, 'business']);
        Route::get('/dashboard/business', [DashboardController::class, 'business']);
        Route::get('/dashboard/service-provider', [DashboardController::class, 'serviceProvider']);
        Route::get('/dashboard/organization', [DashboardController::class, 'organization']);
        Route::get('/dashboard/municipality', [DashboardController::class, 'municipality']);
        Route::get('/dashboard/town-manager', [DashboardController::class, 'municipality']);
        Route::get('/dashboard/admin', [DashboardController::class, 'admin']);

        Route::get('/me', [MeController::class, 'show']);
        Route::put('/me', [MeController::class, 'update']);
        Route::post('/profile/avatar', [MeController::class, 'uploadAvatar']);
        Route::get('/preferences', [PreferenceController::class, 'show']);
        Route::put('/preferences', [PreferenceController::class, 'update']);

        Route::post('/follow', [FollowController::class, 'store']);
        Route::get('/follow', [FollowController::class, 'index']);
        Route::delete('/follow/{follow}', [FollowController::class, 'destroy']);
        Route::post('/directory/{organization}/follow', [OrganizationController::class, 'follow']);
        Route::get('/following-feed', [FollowFeedController::class, 'index']);
        Route::get('/activity', [ActivityController::class, 'index']);
        Route::post('/reports', [CityServiceController::class, 'reportIssue']);
        Route::get('/reports', [CityServiceController::class, 'reports']);
        Route::get('/reports/{report}', [CityServiceController::class, 'showReport']);
        Route::patch('/reports/{report}/status', [CityServiceController::class, 'updateReportStatus']);
        Route::post('/reports/{report}/updates', [CityServiceController::class, 'addReportUpdate']);
        Route::get('/my-reports', [CityServiceController::class, 'myReports']);
        Route::post('/alerts', [CityServiceController::class, 'createAlert']);
        Route::post('/post-drafts/preview', [PostDraftController::class, 'preview']);
        Route::get('/saved-items', [SavedItemController::class, 'index']);
        Route::post('/saved-items', [SavedItemController::class, 'store']);
        Route::delete('/saved-items', [SavedItemController::class, 'destroy']);

        Route::post('/listings', [ListingController::class, 'store']);
        Route::put('/listings/{listing}', [ListingController::class, 'update']);
        Route::get('/my-listings', [ListingController::class, 'mine']);
        Route::post('/store/products', [ProductController::class, 'store']);
        Route::put('/store/products/{product}', [ProductController::class, 'update']);
        Route::post('/accommodations', [AccommodationController::class, 'store']);
        Route::put('/accommodations/{accommodation}', [AccommodationController::class, 'update']);
        Route::middleware('role:seller|service_provider|business_owner|organization_admin|municipality_admin|town_manager|super_admin')->group(function (): void {
            Route::get('/my-businesses', [BusinessController::class, 'index']);
            Route::post('/my-businesses', [BusinessController::class, 'store']);
            Route::put('/my-businesses/{organization}', [BusinessController::class, 'update']);
            Route::post('/my-businesses/{organization}/logo', [BusinessController::class, 'uploadLogo']);
            Route::get('/my-businesses/{organization}/followers', [BusinessController::class, 'followers']);
            Route::post('/my-businesses/{organization}/alerts', [BusinessController::class, 'alerts']);
        });

        Route::post('/jobs', [JobController::class, 'store']);
        Route::post('/jobs/{job}/apply', [JobController::class, 'apply']);
        Route::get('/my-jobs', [JobController::class, 'mine']);

        Route::post('/worker-profile', [WorkerController::class, 'store']);

        Route::get('/bookings', [BookingController::class, 'index']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
        Route::get('/provider/bookings', [ServiceProviderController::class, 'providerBookings']);

        Route::post('/provider-profile', [ServiceProviderController::class, 'storeProvider']);
        Route::put('/provider-profile/{serviceProvider}', [ServiceProviderController::class, 'updateProvider']);
        Route::post('/services', [ServiceProviderController::class, 'storeService']);
        Route::post('/availability', [ServiceProviderController::class, 'storeAvailability']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread', [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);
        Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
        Route::delete('/device-tokens/{deviceToken}', [DeviceTokenController::class, 'destroy']);

        Route::get('/deliveries', [DeliveryController::class, 'index']);
        Route::post('/deliveries', [DeliveryController::class, 'store']);
        Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show']);
        Route::get('/rides', [RideController::class, 'index']);
        Route::post('/rides', [RideController::class, 'store']);
        Route::get('/rides/{ride}', [RideController::class, 'show']);
        Route::get('/sos', [SosController::class, 'index']);
        Route::post('/sos', [SosController::class, 'store']);
        Route::get('/my/events', [EventController::class, 'myEvents']);
        Route::get('/my/tickets', [EventController::class, 'myTickets']);
        Route::post('/events/{event}/save', [EventController::class, 'save']);
        Route::delete('/events/{event}/save', [EventController::class, 'unsave']);
        Route::post('/events/{event}/reminders', [EventController::class, 'reminder']);
        Route::post('/events/{event}/tickets/reserve', [EventController::class, 'reserveTicket']);
        Route::post('/events', [EventController::class, 'create']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        Route::post('/events/{event}/ticket-types', [EventController::class, 'addTicketType']);
        Route::put('/event-ticket-types/{ticketType}', [EventController::class, 'updateTicketType']);
        Route::get('/events/{event}/tickets', [EventController::class, 'eventTickets']);
        Route::post('/tickets/{ticket}/cancel', [EventController::class, 'cancelTicket']);
        Route::post('/tickets/{ticket}/check-in', [EventController::class, 'checkIn']);
        Route::post('/safety-reports', [SafetyController::class, 'store']);
        Route::post('/moderation-flags', [ModerationController::class, 'store']);
        Route::get('/blocks', [BlockController::class, 'index']);
        Route::post('/blocks', [BlockController::class, 'store']);
        Route::delete('/blocks/{block}', [BlockController::class, 'destroy']);

        Route::middleware('role:operator|municipality_admin|town_manager|super_admin')->group(function (): void {
            Route::get('/admin/summary', [AdminController::class, 'summary']);
            Route::get('/admin/overview', [AdminController::class, 'overview']);
            Route::get('/admin/municipality-dashboard', [AdminController::class, 'municipalityDashboard']);
            Route::get('/admin/reports', [CityServiceController::class, 'reports']);
            Route::get('/admin/news-sources', [NewsSourceController::class, 'index']);
            Route::post('/admin/news-sources', [NewsSourceController::class, 'store']);
            Route::put('/admin/news-sources/{newsSource}', [NewsSourceController::class, 'update']);
            Route::post('/admin/news-sources/{newsSource}/fetch', [NewsSourceController::class, 'fetch']);
            Route::put('/admin/news-items/{newsItem}', [NewsSourceController::class, 'updateItem']);
            Route::put('/admin/reports/{report}/status', [CityServiceController::class, 'updateReportStatus']);
            Route::post('/admin/announcements', [CityServiceController::class, 'createAnnouncement']);
            Route::get('/admin/moderation-flags', [ModerationController::class, 'index']);
            Route::put('/admin/moderation-flags/{moderationFlag}', [ModerationController::class, 'update']);
            Route::get('/admin/safety-flags', [SafetyController::class, 'flags']);
            Route::put('/admin/suspend', [SafetyController::class, 'suspend']);
        });

        Route::middleware('role:organization_admin|business_owner|super_admin')->group(function (): void {
            Route::post('/my-businesses/{organization}/news-sources', [NewsSourceController::class, 'storeForOrganization']);
        });
    });
});
