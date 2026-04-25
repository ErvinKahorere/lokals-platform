<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AlertFeedController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\CityServiceController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\FollowFeedController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\AccommodationController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\ModerationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PreferenceController;
use App\Http\Controllers\Api\PostDraftController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RideController;
use App\Http\Controllers\Api\SafetyController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ServiceProviderController;
use App\Http\Controllers\Api\SosController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\WorkerController;
use Illuminate\Support\Facades\Route;

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
    Route::get('/alerts/feed', [AlertFeedController::class, 'index']);
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/search', [SearchController::class, 'index']);
    Route::get('/service-providers', [ServiceProviderController::class, 'index']);
    Route::get('/service-providers/{serviceProvider}', [ServiceProviderController::class, 'show']);
    Route::get('/service-providers/{serviceProvider}/services', [ServiceProviderController::class, 'services']);
    Route::get('/service-providers/{serviceProvider}/availability', [ServiceProviderController::class, 'availability']);
    Route::get('/subscription-plans', [SubscriptionController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);

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
        Route::post('/reports', [CityServiceController::class, 'reportIssue']);
        Route::get('/my-reports', [CityServiceController::class, 'myReports']);
        Route::post('/post-drafts/preview', [PostDraftController::class, 'preview']);

        Route::post('/listings', [ListingController::class, 'store']);
        Route::put('/listings/{listing}', [ListingController::class, 'update']);
        Route::get('/my-listings', [ListingController::class, 'mine']);
        Route::post('/store/products', [ProductController::class, 'store']);
        Route::put('/store/products/{product}', [ProductController::class, 'update']);
        Route::post('/accommodations', [AccommodationController::class, 'store']);
        Route::put('/accommodations/{accommodation}', [AccommodationController::class, 'update']);
        Route::middleware('role:seller|service_provider|business_owner|organization_admin|super_admin')->group(function (): void {
            Route::get('/dashboard/business', [BusinessController::class, 'dashboard']);
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
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);

        Route::get('/deliveries', [DeliveryController::class, 'index']);
        Route::post('/deliveries', [DeliveryController::class, 'store']);
        Route::get('/rides', [RideController::class, 'index']);
        Route::post('/rides', [RideController::class, 'store']);
        Route::get('/sos', [SosController::class, 'index']);
        Route::post('/sos', [SosController::class, 'store']);
        Route::post('/safety-reports', [SafetyController::class, 'store']);
        Route::post('/moderation-flags', [ModerationController::class, 'store']);
        Route::get('/blocks', [BlockController::class, 'index']);
        Route::post('/blocks', [BlockController::class, 'store']);
        Route::delete('/blocks/{block}', [BlockController::class, 'destroy']);

        Route::middleware('role:operator|municipality_admin|super_admin')->group(function (): void {
            Route::get('/admin/summary', [AdminController::class, 'summary']);
            Route::get('/admin/overview', [AdminController::class, 'overview']);
            Route::get('/admin/municipality-dashboard', [AdminController::class, 'municipalityDashboard']);
            Route::get('/admin/reports', [CityServiceController::class, 'reports']);
            Route::put('/admin/reports/{report}/status', [CityServiceController::class, 'updateReportStatus']);
            Route::post('/admin/announcements', [CityServiceController::class, 'createAnnouncement']);
            Route::get('/admin/moderation-flags', [ModerationController::class, 'index']);
            Route::put('/admin/moderation-flags/{moderationFlag}', [ModerationController::class, 'update']);
            Route::get('/admin/safety-flags', [SafetyController::class, 'flags']);
            Route::put('/admin/suspend', [SafetyController::class, 'suspend']);
        });
    });
});
