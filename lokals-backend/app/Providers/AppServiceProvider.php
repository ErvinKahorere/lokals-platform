<?php

namespace App\Providers;

use App\Events\BookingCreated;
use App\Listeners\SendBookingNotifications;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\Listing;
use App\Models\ServiceProvider as ServiceProviderModel;
use App\Policies\BookingPolicy;
use App\Policies\CityReportPolicy;
use App\Policies\ListingPolicy;
use App\Policies\ServiceProviderPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(CityReport::class, CityReportPolicy::class);
        Gate::policy(Listing::class, ListingPolicy::class);
        Gate::policy(ServiceProviderModel::class, ServiceProviderPolicy::class);

        Event::listen(BookingCreated::class, SendBookingNotifications::class);
    }
}
