<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Alert;
use App\Models\Announcement;
use App\Models\Booking;
use App\Models\CityReport;
use App\Models\CourierProfile;
use App\Models\DeliveryRequest;
use App\Models\DriverProfile;
use App\Models\Event;
use App\Models\EventSave;
use App\Models\EventTicket;
use App\Models\FeedPost;
use App\Models\Follow;
use App\Models\HireBooking;
use App\Models\HireItem;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\Listing;
use App\Models\ModerationFlag;
use App\Models\Organization;
use App\Models\Order;
use App\Models\Product;
use App\Models\RideRequest;
use App\Models\RoleApplication;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Models\CommunityImpactTransaction;
use App\Models\CommunityProject;
use App\Support\PilotLocation;
use App\Models\WorkerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    protected array $activeReportStatuses = ['submitted', 'received', 'in_review', 'assigned', 'in_progress'];

    public function index(Request $request): JsonResponse
    {
        $role = $request->user()->current_role ?: $request->user()->getRoleNames()->first() ?: 'citizen';

        return response()->json([
            'role' => $role,
            'dashboard_endpoint' => match ($role) {
                'worker' => '/dashboard/worker',
                'driver' => '/dashboard/driver',
                'courier' => '/dashboard/courier',
                'seller' => '/dashboard/seller',
                'business_owner' => '/dashboard/business',
                'service_provider' => '/dashboard/service-provider',
                'organization_admin' => '/dashboard/organization',
                'municipality_admin', 'town_manager' => '/dashboard/town-manager',
                'super_admin', 'operator' => '/dashboard/admin',
                default => '/dashboard/citizen',
            },
        ]);
    }

    public function citizen(Request $request): JsonResponse
    {
        $user = $request->user();
        $followedIds = Follow::query()->where('user_id', $user->id)->latest()->limit(4)->pluck('followable_id');

        return response()->json([
            'role' => 'citizen',
            'stats' => [
                'bookings' => Booking::query()->where('user_id', $user->id)->count(),
                'saved_items' => EventSave::query()->where('user_id', $user->id)->count() + Follow::query()->where('user_id', $user->id)->count(),
                'followed_sources' => Follow::query()->where('user_id', $user->id)->count(),
                'tickets' => EventTicket::query()->where('user_id', $user->id)->count(),
                'reports' => CityReport::query()->where('user_id', $user->id)->count(),
                'orders' => Order::query()->where('user_id', $user->id)->count(),
                'hire_bookings' => HireBooking::query()->where('customer_id', $user->id)->count(),
            ],
            'quick_actions' => [
                ['label' => 'Book Service', 'href' => '/services', 'icon' => 'calendar'],
                ['label' => 'Report Issue', 'href' => '/report-issue', 'icon' => 'alert-circle'],
                ['label' => 'Send Parcel', 'href' => '/delivery', 'icon' => 'package'],
                ['label' => 'Order Delivery', 'href' => '/store', 'icon' => 'shopping-bag'],
                ['label' => 'Hire Items', 'href' => '/hire', 'icon' => 'warehouse'],
                ['label' => 'View Alerts', 'href' => '/alerts', 'icon' => 'bell'],
            ],
            'pending_tasks' => [
                ['label' => 'Upcoming bookings', 'count' => Booking::query()->where('user_id', $user->id)->whereIn('status', ['pending', 'confirmed'])->count()],
                ['label' => 'Open reports', 'count' => CityReport::query()->where('user_id', $user->id)->whereIn('status', $this->activeReportStatuses)->count()],
                ['label' => 'Active orders', 'count' => Order::query()->where('user_id', $user->id)->whereNotIn('status', [Order::STATUS_DELIVERED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED])->count()],
                ['label' => 'Active hire bookings', 'count' => HireBooking::query()->where('customer_id', $user->id)->whereNotIn('status', [HireBooking::STATUS_COMPLETED, HireBooking::STATUS_CANCELLED])->count()],
            ],
            'upcoming_bookings' => Booking::query()
                ->where('user_id', $user->id)
                ->with(['serviceProvider:id,name,phone', 'service:id,name'])
                ->latest('booking_date')
                ->limit(4)
                ->get(),
            'saved_items' => Event::query()
                ->whereIn('id', EventSave::query()->where('user_id', $user->id)->pluck('event_id'))
                ->orderByDesc('starts_at')
                ->limit(4)
                ->get(['id', 'title', 'category', 'town', 'area', 'starts_at', 'status']),
            'followed_entities' => Organization::query()
                ->whereIn('id', $followedIds)
                ->limit(4)
                ->get(['id', 'name', 'category', 'town', 'area', 'logo_url', 'status', 'is_verified']),
            'recent_alerts' => Alert::query()->latest()->limit(4)->get(['id', 'title', 'body', 'priority', 'location', 'published_at']),
            'my_reports' => CityReport::query()->where('user_id', $user->id)->latest()->limit(4)->get(['id', 'title', 'category', 'location', 'status', 'priority', 'created_at']),
            'my_tickets' => EventTicket::query()->where('user_id', $user->id)->with(['event:id,title,starts_at,location'])->latest()->limit(4)->get(),
            'recent_orders' => Order::query()->where('user_id', $user->id)->with(['business:id,name', 'courier:id,name'])->latest()->limit(4)->get(),
            'recent_hire_bookings' => HireBooking::query()->where('customer_id', $user->id)->with(['item:id,title,category', 'owner:id,name,phone'])->latest()->limit(4)->get(),
            'recent_activity' => $this->mergeActivity([
                Booking::query()->where('user_id', $user->id)->latest()->limit(3)->get()->map(fn (Booking $booking) => [
                    'type' => 'booking',
                    'title' => $booking->service?->name ?? 'Booking update',
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
                EventTicket::query()->where('user_id', $user->id)->latest()->limit(2)->get()->map(fn (EventTicket $ticket) => [
                    'type' => 'ticket',
                    'title' => 'Ticket '.$ticket->ticket_code,
                    'body' => $ticket->status,
                    'timestamp' => optional($ticket->updated_at)->toIso8601String(),
                ]),
                CityReport::query()->where('user_id', $user->id)->latest()->limit(2)->get()->map(fn (CityReport $report) => [
                    'type' => 'report',
                    'title' => $report->title,
                    'body' => $report->status,
                    'timestamp' => optional($report->updated_at)->toIso8601String(),
                ]),
                Order::query()->where('user_id', $user->id)->latest()->limit(2)->get()->map(fn (Order $order) => [
                    'type' => 'order',
                    'title' => sprintf('Order ORD-%05d', $order->id),
                    'body' => $order->status,
                    'timestamp' => optional($order->updated_at)->toIso8601String(),
                ]),
                HireBooking::query()->where('customer_id', $user->id)->latest()->limit(2)->get()->map(fn (HireBooking $booking) => [
                    'type' => 'hire',
                    'title' => sprintf('Hire HIRE-%05d', $booking->id),
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function worker(Request $request): JsonResponse
    {
        $user = $request->user();
        $worker = WorkerProfile::query()->where('user_id', $user->id)->first();

        return response()->json([
            'role' => 'worker',
            'stats' => [
                'profile_completion' => $worker ? 85 : 35,
                'jobs_near_me' => JobPost::query()->where('status', 'open')->count(),
                'applications' => JobApplication::query()->where('user_id', $user->id)->count(),
                'availability' => $worker?->is_available ? 1 : 0,
            ],
            'quick_actions' => [
                ['label' => 'View Jobs', 'href' => '/jobs', 'icon' => 'briefcase'],
                ['label' => 'Edit Worker Profile', 'href' => '/workers', 'icon' => 'user'],
                ['label' => 'Update Availability', 'href' => '/dashboard/worker', 'icon' => 'clock'],
            ],
            'pending_tasks' => [
                ['label' => 'Profile setup', 'count' => $worker ? 0 : 1],
                ['label' => 'Open applications', 'count' => JobApplication::query()->where('user_id', $user->id)->where('status', 'pending')->count()],
            ],
            'worker_profile' => $worker,
            'jobs_near_me' => JobPost::query()->where('status', 'open')->latest()->limit(5)->get(['id', 'title', 'location', 'compensation', 'status', 'created_at']),
            'applications' => JobApplication::query()->where('user_id', $user->id)->with('job:id,title,location,status,compensation')->latest()->limit(5)->get(),
            'completed_jobs_placeholder' => [
                'count' => JobApplication::query()->where('user_id', $user->id)->where('status', 'accepted')->count(),
                'label' => 'Completed jobs history can expand here later.',
            ],
            'recent_activity' => $this->mergeActivity([
                JobApplication::query()->where('user_id', $user->id)->latest()->limit(4)->get()->map(fn (JobApplication $application) => [
                    'type' => 'application',
                    'title' => $application->job?->title ?? 'Job application',
                    'body' => $application->status,
                    'timestamp' => optional($application->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function driver(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['driver', 'super_admin']), 403);
        $profile = DriverProfile::query()->where('user_id', $user->id)->first();
        $activeTrip = RideRequest::query()
            ->where('driver_id', $user->id)
            ->whereIn('status', ['accepted', 'driver_en_route', 'arrived', 'in_progress'])
            ->latest()
            ->first();

        return response()->json([
            'role' => 'driver',
            'stats' => [
                'online' => $profile?->is_online ? 1 : 0,
                'available_requests' => RideRequest::query()->whereIn('status', ['requested', 'searching'])->count(),
                'active_trips' => RideRequest::query()->where('driver_id', $user->id)->whereIn('status', ['accepted', 'driver_en_route', 'arrived', 'in_progress'])->count(),
                'completed_trips' => RideRequest::query()->where('driver_id', $user->id)->where('status', 'completed')->count(),
                'earnings_today' => RideRequest::query()->where('driver_id', $user->id)->whereDate('completed_at', today())->sum('fare_estimate'),
            ],
            'quick_actions' => [
                ['label' => 'Go Online', 'href' => '/dashboard/driver', 'icon' => 'power'],
                ['label' => 'Available Rides', 'href' => '/ride', 'icon' => 'car'],
                ['label' => 'Trip History', 'href' => '/dashboard/driver', 'icon' => 'history'],
                ['label' => 'Documents', 'href' => '/dashboard/driver', 'icon' => 'file-text'],
            ],
            'pending_tasks' => [
                ['label' => 'Approval items', 'count' => $profile?->is_verified ? 0 : 1],
                ['label' => 'Current trip', 'count' => $activeTrip ? 1 : 0],
            ],
            'driver_profile' => $profile,
            'active_trip' => $activeTrip?->load(['user:id,name,phone']),
            'available_requests' => RideRequest::query()
                ->with(['user:id,name,phone'])
                ->whereIn('status', ['requested', 'searching'])
                ->latest()
                ->limit(6)
                ->get(),
            'trip_history' => RideRequest::query()
                ->with(['user:id,name,phone'])
                ->where('driver_id', $user->id)
                ->latest()
                ->limit(6)
                ->get(),
            'recent_activity' => $this->mergeActivity([
                RideRequest::query()->where('driver_id', $user->id)->latest()->limit(5)->get()->map(fn (RideRequest $ride) => [
                    'type' => 'trip',
                    'title' => $ride->pickup_location.' -> '.$ride->dropoff_location,
                    'body' => $ride->status,
                    'timestamp' => optional($ride->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function courier(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['courier', 'super_admin']), 403);
        $profile = CourierProfile::query()->where('user_id', $user->id)->first();
        $activeDelivery = DeliveryRequest::query()
            ->where('driver_id', $user->id)
            ->whereIn('status', ['accepted', 'pickup_confirmed', 'in_transit'])
            ->latest()
            ->first();
        $activeOrderDelivery = Order::query()
            ->where('courier_id', $user->id)
            ->whereIn('status', [Order::STATUS_COURIER_ASSIGNED, Order::STATUS_PICKED_UP])
            ->latest()
            ->first();

        return response()->json([
            'role' => 'courier',
            'stats' => [
                'online' => $profile?->is_online ? 1 : 0,
                'available_deliveries' => DeliveryRequest::query()->whereIn('status', ['requested', 'searching'])->count(),
                'active_deliveries' => DeliveryRequest::query()->where('driver_id', $user->id)->whereIn('status', ['accepted', 'pickup_confirmed', 'in_transit'])->count(),
                'completed_deliveries' => DeliveryRequest::query()->where('driver_id', $user->id)->where('status', 'delivered')->count(),
                'earnings_today' => DeliveryRequest::query()->where('driver_id', $user->id)->whereDate('delivered_at', today())->sum('estimated_price'),
                'available_order_deliveries' => Order::query()->where('status', Order::STATUS_READY_FOR_PICKUP)->whereNull('courier_id')->count(),
                'active_order_delivery' => $activeOrderDelivery ? 1 : 0,
            ],
            'quick_actions' => [
                ['label' => 'Go Online', 'href' => '/dashboard/courier', 'icon' => 'power'],
                ['label' => 'Available Deliveries', 'href' => '/delivery', 'icon' => 'package'],
                ['label' => 'Food/Shop Orders', 'href' => '/dashboard/courier/orders', 'icon' => 'shopping-bag'],
                ['label' => 'Delivery History', 'href' => '/dashboard/courier', 'icon' => 'history'],
                ['label' => 'Documents', 'href' => '/dashboard/courier', 'icon' => 'file-text'],
            ],
            'pending_tasks' => [
                ['label' => 'Approval items', 'count' => $profile?->is_verified ? 0 : 1],
                ['label' => 'Current delivery', 'count' => $activeDelivery ? 1 : 0],
                ['label' => 'Ready order pickups', 'count' => Order::query()->where('status', Order::STATUS_READY_FOR_PICKUP)->whereNull('courier_id')->count()],
            ],
            'courier_profile' => $profile,
            'active_delivery' => $activeDelivery?->load(['user:id,name,phone']),
            'active_order_delivery' => $activeOrderDelivery?->load(['customer:id,name,phone', 'business:id,name,location', 'items']),
            'available_deliveries' => DeliveryRequest::query()
                ->with(['user:id,name,phone'])
                ->whereIn('status', ['requested', 'searching'])
                ->latest()
                ->limit(6)
                ->get(),
            'available_order_deliveries' => Order::query()
                ->with(['customer:id,name,phone', 'business:id,name,location', 'items'])
                ->where('status', Order::STATUS_READY_FOR_PICKUP)
                ->whereNull('courier_id')
                ->latest()
                ->limit(6)
                ->get(),
            'delivery_history' => DeliveryRequest::query()
                ->with(['user:id,name,phone'])
                ->where('driver_id', $user->id)
                ->latest()
                ->limit(6)
                ->get(),
            'order_delivery_history' => Order::query()
                ->with(['customer:id,name,phone', 'business:id,name,location', 'items'])
                ->where('courier_id', $user->id)
                ->latest()
                ->limit(6)
                ->get(),
            'recent_activity' => $this->mergeActivity([
                DeliveryRequest::query()->where('driver_id', $user->id)->latest()->limit(5)->get()->map(fn (DeliveryRequest $delivery) => [
                    'type' => 'delivery',
                    'title' => ($delivery->pickup_location ?: $delivery->pickup_address).' -> '.($delivery->dropoff_location ?: $delivery->dropoff_address),
                    'body' => $delivery->status,
                    'timestamp' => optional($delivery->updated_at)->toIso8601String(),
                ]),
                Order::query()->where('courier_id', $user->id)->latest()->limit(3)->get()->map(fn (Order $order) => [
                    'type' => 'order_delivery',
                    'title' => sprintf('Order ORD-%05d', $order->id),
                    'body' => $order->status,
                    'timestamp' => optional($order->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function business(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['seller', 'business_owner', 'super_admin']), 403);

        $businesses = Organization::query()->where('owner_user_id', $user->id)->withCount('followers')->get();
        $businessIds = $businesses->pluck('id');
        $providerIds = ServiceProvider::query()
            ->whereIn('organization_id', $businessIds)
            ->pluck('id');
        $recentPromotions = Announcement::query()
            ->whereIn('organization_id', $businessIds)
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'body', 'location', 'published_at']);
        $recentProducts = Product::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'price', 'sale_price', 'category', 'town', 'area', 'created_at']);
        $recentServices = Service::query()
            ->whereIn('organization_id', $businessIds)
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'price', 'price_type', 'duration_minutes', 'is_active']);
        $recentBookings = Booking::query()
            ->whereIn('service_provider_id', $providerIds)
            ->with(['user:id,name,phone', 'service:id,name'])
            ->latest()
            ->limit(5)
            ->get();
        $recentOrders = Order::query()
            ->whereIn('business_id', $businessIds)
            ->with(['customer:id,name,phone', 'courier:id,name,phone', 'items'])
            ->latest()
            ->limit(5)
            ->get();
        $businessRole = $user->current_role === 'seller' ? 'seller' : 'business';
        $businessDashboardHref = $businessRole === 'seller' ? '/dashboard/seller' : '/dashboard/business';

        return response()->json([
            'role' => $businessRole,
            'stats' => [
                'products' => Product::query()->where('user_id', $user->id)->count(),
                'services' => Service::query()->whereIn('organization_id', $businessIds)->count(),
                'bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->count(),
                'followers' => $businesses->sum('followers_count'),
                'alerts_promotions' => Announcement::query()->whereIn('organization_id', $businessIds)->count(),
                'enquiries' => Product::query()->where('user_id', $user->id)->count() * 2,
                'pending_orders' => Order::query()->whereIn('business_id', $businessIds)->where('status', Order::STATUS_PENDING)->count(),
                'today_orders' => Order::query()->whereIn('business_id', $businessIds)->whereDate('created_at', today())->count(),
                'order_revenue' => number_format((float) Order::query()->whereIn('business_id', $businessIds)->where('status', Order::STATUS_DELIVERED)->sum('total'), 2, '.', ''),
                'hire_items' => HireItem::query()->where('owner_id', $user->id)->count(),
                'pending_hire_bookings' => HireBooking::query()->where('owner_id', $user->id)->where('status', HireBooking::STATUS_PENDING)->count(),
                'hire_revenue' => number_format((float) HireBooking::query()->where('owner_id', $user->id)->where('status', HireBooking::STATUS_COMPLETED)->sum('total'), 2, '.', ''),
            ],
            'quick_actions' => [
                ['label' => 'Add Product', 'href' => '/store', 'icon' => 'package'],
                ['label' => 'List Hire Item', 'href' => '/dashboard/business/hire-items', 'icon' => 'warehouse'],
                ['label' => 'Add Service', 'href' => '/services', 'icon' => 'hammer'],
                ['label' => 'Open Orders', 'href' => '/dashboard/business/orders', 'icon' => 'clipboard-list'],
                ['label' => 'Post Promotion', 'href' => $businessDashboardHref, 'icon' => 'megaphone'],
                ['label' => 'View Store', 'href' => '/store', 'icon' => 'store'],
            ],
            'pending_tasks' => [
                ['label' => 'Products without recent activity', 'count' => max(0, 3 - Product::query()->where('user_id', $user->id)->count())],
                ['label' => 'Promotions to refresh', 'count' => Announcement::query()->whereIn('organization_id', $businessIds)->whereDate('published_at', '<', now()->subDays(14))->count()],
                ['label' => 'Orders waiting review', 'count' => Order::query()->whereIn('business_id', $businessIds)->where('status', Order::STATUS_PENDING)->count()],
                ['label' => 'Hire requests waiting review', 'count' => HireBooking::query()->where('owner_id', $user->id)->where('status', HireBooking::STATUS_PENDING)->count()],
            ],
            'businesses' => $businesses,
            'sale_alerts' => $recentPromotions,
            'alerts' => $recentPromotions,
            'recent_products' => $recentProducts,
            'products' => $recentProducts,
            'recent_services' => $recentServices,
            'recent_bookings' => $recentBookings,
            'recent_orders' => $recentOrders,
            'recent_hire_items' => HireItem::query()->where('owner_id', $user->id)->latest()->limit(5)->get(['id', 'title', 'category', 'town', 'area', 'verification_status', 'status', 'price_per_day', 'price_per_hour', 'created_at']),
            'recent_hire_bookings' => HireBooking::query()->where('owner_id', $user->id)->with(['item:id,title,category', 'customer:id,name,phone'])->latest()->limit(5)->get(),
            'recent_activity' => $this->mergeActivity([
                Product::query()->where('user_id', $user->id)->latest()->limit(3)->get()->map(fn (Product $product) => [
                    'type' => 'product',
                    'title' => $product->title,
                    'body' => 'Product updated',
                    'timestamp' => optional($product->updated_at)->toIso8601String(),
                ]),
                Announcement::query()->whereIn('organization_id', $businessIds)->latest()->limit(2)->get()->map(fn (Announcement $alert) => [
                    'type' => 'promotion',
                    'title' => $alert->title,
                    'body' => Str::limit($alert->body, 72),
                    'timestamp' => optional($alert->published_at)->toIso8601String(),
                ]),
                Order::query()->whereIn('business_id', $businessIds)->latest()->limit(2)->get()->map(fn (Order $order) => [
                    'type' => 'order',
                    'title' => sprintf('Order ORD-%05d', $order->id),
                    'body' => $order->status,
                    'timestamp' => optional($order->updated_at)->toIso8601String(),
                ]),
                HireBooking::query()->where('owner_id', $user->id)->latest()->limit(2)->get()->map(fn (HireBooking $booking) => [
                    'type' => 'hire',
                    'title' => sprintf('Hire HIRE-%05d', $booking->id),
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function serviceProvider(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['service_provider', 'super_admin']), 403);

        $providers = ServiceProvider::query()
            ->where('user_id', $user->id)
            ->orWhereIn('organization_id', Organization::query()->where('owner_user_id', $user->id)->pluck('id'))
            ->withCount('followers')
            ->get();
        $providerIds = $providers->pluck('id');

        return response()->json([
            'role' => 'service_provider',
            'stats' => [
                'bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->count(),
                'services' => Service::query()->whereIn('service_provider_id', $providerIds)->count(),
                'availability_slots' => \App\Models\AvailabilitySlot::query()->whereIn('service_provider_id', $providerIds)->count(),
                'followers' => $providers->sum('followers_count'),
                'rates' => Service::query()->whereIn('service_provider_id', $providerIds)->count(),
                'recent_enquiries' => Booking::query()->whereIn('service_provider_id', $providerIds)->where('status', 'pending')->count(),
            ],
            'quick_actions' => [
                ['label' => 'Add Service', 'href' => '/services', 'icon' => 'plus-circle'],
                ['label' => 'Manage Availability', 'href' => '/provider-bookings', 'icon' => 'calendar'],
                ['label' => 'View Bookings', 'href' => '/provider-bookings', 'icon' => 'book-open'],
                ['label' => 'Post Alert', 'href' => '/dashboard/service-provider', 'icon' => 'bell'],
            ],
            'pending_tasks' => [
                ['label' => 'Pending bookings', 'count' => Booking::query()->whereIn('service_provider_id', $providerIds)->where('status', 'pending')->count()],
                ['label' => 'Services missing availability', 'count' => max(0, Service::query()->whereIn('service_provider_id', $providerIds)->count() - \App\Models\AvailabilitySlot::query()->whereIn('service_provider_id', $providerIds)->distinct('service_provider_id')->count('service_provider_id'))],
            ],
            'providers' => $providers,
            'recent_bookings' => Booking::query()->whereIn('service_provider_id', $providerIds)->with(['user:id,name,phone', 'service:id,name'])->latest()->limit(5)->get(),
            'services_offered' => Service::query()->whereIn('service_provider_id', $providerIds)->latest()->limit(5)->get(['id', 'name', 'price', 'price_type', 'duration_minutes', 'is_active']),
            'recent_activity' => $this->mergeActivity([
                Booking::query()->whereIn('service_provider_id', $providerIds)->latest()->limit(4)->get()->map(fn (Booking $booking) => [
                    'type' => 'booking',
                    'title' => $booking->service?->name ?? 'Booking update',
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function organization(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['organization_admin', 'super_admin']), 403);

        $organizations = Organization::query()
            ->where('owner_user_id', $user->id)
            ->withCount('followers')
            ->get();
        $organizationIds = $organizations->pluck('id');
        $eventIds = Event::query()
            ->where('created_by', $user->id)
            ->orWhere(function ($query) use ($organizationIds): void {
                $query->where('organizer_type', Organization::class)
                    ->whereIn('organizer_id', $organizationIds);
            })
            ->pluck('id');

        return response()->json([
            'role' => 'organization',
            'stats' => [
                'followers' => $organizations->sum('followers_count'),
                'alerts_published' => Announcement::query()->whereIn('organization_id', $organizationIds)->count(),
                'events' => $eventIds->count(),
                'updates' => Announcement::query()->whereIn('organization_id', $organizationIds)->count() + $eventIds->count(),
            ],
            'quick_actions' => [
                ['label' => 'Publish Alert', 'href' => '/dashboard/organization', 'icon' => 'bell'],
                ['label' => 'Add Event', 'href' => '/dashboard/events/create', 'icon' => 'calendar-plus'],
                ['label' => 'Update Directory Profile', 'href' => '/directory', 'icon' => 'building'],
                ['label' => 'View Followers', 'href' => '/dashboard/organization', 'icon' => 'users'],
            ],
            'pending_tasks' => [
                ['label' => 'Profiles to complete', 'count' => $organizations->filter(fn (Organization $organization) => empty($organization->phone) || empty($organization->description))->count()],
                ['label' => 'Upcoming events needing promotion', 'count' => Event::query()->whereIn('id', $eventIds)->where('starts_at', '>=', now())->count()],
            ],
            'organizations' => $organizations,
            'public_updates' => Announcement::query()->whereIn('organization_id', $organizationIds)->latest('published_at')->limit(5)->get(['id', 'title', 'body', 'location', 'published_at']),
            'events' => Event::query()->whereIn('id', $eventIds)->orderBy('starts_at')->limit(5)->get(['id', 'title', 'category', 'town', 'area', 'starts_at', 'status']),
            'profile_status' => [
                'complete' => $organizations->filter(fn (Organization $organization) => filled($organization->phone) && filled($organization->description))->count(),
                'needs_attention' => $organizations->filter(fn (Organization $organization) => blank($organization->phone) || blank($organization->description))->count(),
            ],
            'news_source_status' => [
                'connected' => Announcement::query()->whereIn('organization_id', $organizationIds)->exists() ? 1 : 0,
                'pending' => Announcement::query()->whereIn('organization_id', $organizationIds)->exists() ? 0 : 1,
            ],
            'recent_activity' => $this->mergeActivity([
                Announcement::query()->whereIn('organization_id', $organizationIds)->latest()->limit(3)->get()->map(fn (Announcement $alert) => [
                    'type' => 'alert',
                    'title' => $alert->title,
                    'body' => Str::limit($alert->body, 72),
                    'timestamp' => optional($alert->published_at)->toIso8601String(),
                ]),
                Event::query()->whereIn('id', $eventIds)->latest()->limit(2)->get()->map(fn (Event $event) => [
                    'type' => 'event',
                    'title' => $event->title,
                    'body' => $event->category,
                    'timestamp' => optional($event->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function municipality(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['town_manager', 'municipality_admin', 'super_admin']), 403);

        $reportQuery = CityReport::query()
            ->when(! $user->hasRole('super_admin'), function ($query) use ($user): void {
                $query->where('town', PilotLocation::profileTown($user->default_town))
                    ->when(PilotLocation::normalizeArea($user->default_area), fn ($builder, $area) => $builder->where(function ($areaQuery) use ($area): void {
                        $areaQuery->where('area', $area)
                            ->orWhereNull('area');
                    }));
            });
        $alertQuery = Alert::query()
            ->where('is_active', true)
            ->whereIn('type', ['municipal_alert', 'public_notice', 'service_update', 'emergency_alert'])
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $publicServicesQuery = Organization::query()
            ->where('is_public_service', true)
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $eventQuery = Event::query()
            ->where('category', 'municipal')
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));

        $reportsByStatus = (clone $reportQuery)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $pendingRoleApplications = RoleApplication::query()
            ->whereIn('status', ['submitted', 'pending_review'])
            ->when(! $user->hasRole('super_admin'), function ($query) use ($user): void {
                $query->where(function ($builder) use ($user): void {
                    $builder->where('town_name', PilotLocation::profileTown($user->default_town))
                        ->orWhereNull('town_name');
                });
            });
        $pendingCommunityProjects = CommunityProject::query()
            ->where('verification_status', 'pending')
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $feedPending = FeedPost::query()
            ->where('status', 'pending')
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $rewardVerificationQueue = CommunityImpactTransaction::query()
            ->where('verification_status', 'pending')
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $businessQuery = Organization::query()
            ->where('is_public_service', false)
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $providerQuery = ServiceProvider::query()
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->where('town', PilotLocation::profileTown($user->default_town)));
        $driverProfiles = DriverProfile::query()
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->whereHas('user', fn ($userQuery) => $userQuery->where('default_town', PilotLocation::profileTown($user->default_town))));
        $courierProfiles = CourierProfile::query()
            ->when(! $user->hasRole('super_admin'), fn ($query) => $query->whereHas('user', fn ($userQuery) => $userQuery->where('default_town', PilotLocation::profileTown($user->default_town))));
        $rideQuery = RideRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'arrived', 'in_progress']);
        $deliveryQuery = DeliveryRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit']);
        $orderQuery = Order::query()->whereNotIn('status', [Order::STATUS_DELIVERED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED]);
        $residentQuery = User::query()
            ->where('default_town', PilotLocation::profileTown($user->default_town))
            ->where(function ($query): void {
                $query->whereNull('current_role')->orWhere('current_role', 'citizen');
            });
        $reportCategories = (clone $reportQuery)
            ->selectRaw('category, count(*) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->limit(6)
            ->get();
        $communicationStats = [
            'total_alerts' => (clone $alertQuery)->count(),
            'emergency_alerts' => (clone $alertQuery)->where('type', 'emergency_alert')->count(),
            'announcements' => (clone $alertQuery)->whereIn('type', ['municipal_alert', 'public_notice'])->count(),
            'service_updates' => (clone $alertQuery)->where('type', 'service_update')->count(),
        ];
        $areaBreakdown = collect(PilotLocation::allowedAreas())
            ->map(fn (string $area) => [
                'area' => $area,
                'reports' => (clone $reportQuery)->where('area', $area)->count(),
                'residents' => (clone $residentQuery)->where('default_area', $area)->count(),
                'providers' => (clone $providerQuery)->where('area', $area)->count(),
            ])
            ->filter(fn (array $row) => $row['reports'] > 0 || $row['residents'] > 0 || $row['providers'] > 0)
            ->values();

        return response()->json([
            'role' => 'town_manager',
            'stats' => [
                'total_reports' => (clone $reportQuery)->count(),
                'open_reports' => (clone $reportQuery)->whereIn('status', ['submitted', 'received'])->count(),
                'in_progress_reports' => (clone $reportQuery)->whereIn('status', ['in_review', 'assigned', 'in_progress'])->count(),
                'resolved_reports' => (clone $reportQuery)->where('status', 'resolved')->count(),
                'urgent_reports' => (clone $reportQuery)->where('priority', 'high')->whereIn('status', $this->activeReportStatuses)->count(),
                'municipal_alerts_sent' => (clone $alertQuery)->count(),
                'public_service_entries' => (clone $publicServicesQuery)->count(),
                'pending_approvals' => (clone $pendingRoleApplications)->count(),
                'registered_businesses' => (clone $businessQuery)->count(),
                'service_providers' => (clone $providerQuery)->count(),
                'active_emergency_alerts' => (clone $alertQuery)->where('type', 'emergency_alert')->count(),
                'active_orders' => (clone $orderQuery)->count(),
                'pending_hire_listings' => HireItem::query()->where('verification_status', HireItem::VERIFICATION_PENDING)->count(),
                'active_hire_bookings' => HireBooking::query()->whereIn('status', HireBooking::ACTIVE_AVAILABILITY_STATUSES)->count(),
            ],
            'quick_actions' => [
                ['label' => 'Send Announcement', 'href' => '/dashboard/town-manager', 'icon' => 'megaphone'],
                ['label' => 'Send Emergency Alert', 'href' => '/dashboard/town-manager', 'icon' => 'siren'],
                ['label' => 'Pending Approvals', 'href' => '/dashboard/town-manager/role-applications', 'icon' => 'check-square'],
                ['label' => 'Review Reports', 'href' => '/dashboard/town-manager/reports', 'icon' => 'clipboard-list'],
                ['label' => 'Moderate Feed', 'href' => '/dashboard/town-manager/feed/pending', 'icon' => 'shield'],
                ['label' => 'Town Analytics', 'href' => '/dashboard/town-manager/analytics', 'icon' => 'activity'],
                ['label' => 'Review Hire Listings', 'href' => '/dashboard/admin/hire', 'icon' => 'warehouse'],
            ],
            'pending_tasks' => [
                ['label' => 'Urgent reports', 'count' => (clone $reportQuery)->where('priority', 'high')->whereIn('status', $this->activeReportStatuses)->count()],
                ['label' => 'Open reports', 'count' => (clone $reportQuery)->whereIn('status', $this->activeReportStatuses)->count()],
                ['label' => 'Role approvals waiting', 'count' => (clone $pendingRoleApplications)->count()],
                ['label' => 'Feed posts pending', 'count' => (clone $feedPending)->count()],
            ],
            'reports_by_status' => $reportsByStatus,
            'report_categories' => $reportCategories,
            'pending_approvals' => (clone $pendingRoleApplications)->latest()->limit(6)->get(['id', 'requested_role', 'status', 'full_name', 'phone', 'created_at']),
            'recent_reports' => (clone $reportQuery)->latest()->limit(6)->get(['id', 'title', 'category', 'location', 'town', 'area', 'status', 'priority', 'created_at']),
            'active_alerts' => (clone $alertQuery)->latest()->limit(5)->get(['id', 'title', 'body', 'type', 'priority', 'location', 'town', 'area', 'created_at']),
            'upcoming_events' => (clone $eventQuery)->where('status', 'published')->where('starts_at', '>=', now())->orderBy('starts_at')->limit(5)->get(['id', 'title', 'category', 'town', 'area', 'starts_at']),
            'pending_community_projects' => (clone $pendingCommunityProjects)->latest()->limit(6)->get(['id', 'title', 'town', 'area', 'verification_status', 'created_at']),
            'feed_moderation_queue' => (clone $feedPending)->latest()->limit(6)->get(['id', 'title', 'town', 'area', 'status', 'updated_at']),
            'reward_verification_queue' => (clone $rewardVerificationQueue)->latest()->limit(6)->get(['id', 'user_id', 'points', 'reason', 'verification_status', 'updated_at']),
            'local_directory_stats' => [
                'businesses' => (clone $businessQuery)->count(),
                'providers' => (clone $providerQuery)->count(),
                'public_services' => (clone $publicServicesQuery)->count(),
            ],
            'transport_activity' => [
                'active_rides' => (clone $rideQuery)->count(),
                'active_deliveries' => (clone $deliveryQuery)->count(),
                'active_orders' => (clone $orderQuery)->count(),
                'drivers_online' => (clone $driverProfiles)->where('is_online', true)->count(),
                'couriers_online' => (clone $courierProfiles)->where('is_online', true)->count(),
                'verified_drivers' => (clone $driverProfiles)->where('is_verified', true)->count(),
                'verified_couriers' => (clone $courierProfiles)->where('is_verified', true)->count(),
                'active_hire_bookings' => HireBooking::query()->whereIn('status', HireBooking::ACTIVE_AVAILABILITY_STATUSES)->count(),
            ],
            'resident_engagement' => [
                'residents' => (clone $residentQuery)->count(),
                'reports_last_7_days' => (clone $reportQuery)->where('created_at', '>=', now()->subDays(7))->count(),
                'alerts_last_7_days' => (clone $alertQuery)->where('created_at', '>=', now()->subDays(7))->count(),
                'announcement_reach_proxy' => Follow::query()->count(),
            ],
            'communication_stats' => $communicationStats,
            'town_activity_overview' => $areaBreakdown,
            'hire_overview' => [
                'pending_listings' => HireItem::query()->where('verification_status', HireItem::VERIFICATION_PENDING)->latest()->limit(5)->get(['id', 'title', 'category', 'town', 'area', 'verification_status', 'created_at']),
                'active_bookings' => HireBooking::query()->with(['item:id,title', 'customer:id,name'])->whereIn('status', HireBooking::ACTIVE_AVAILABILITY_STATUSES)->latest()->limit(5)->get(),
            ],
            'recent_activity' => $this->mergeActivity([
                (clone $reportQuery)->latest()->limit(4)->get()->map(fn (CityReport $report) => [
                    'type' => 'report',
                    'title' => $report->title,
                    'body' => $report->status,
                    'timestamp' => optional($report->updated_at)->toIso8601String(),
                ]),
                (clone $alertQuery)->latest()->limit(2)->get()->map(fn (Alert $alert) => [
                    'type' => 'alert',
                    'title' => $alert->title,
                    'body' => $alert->priority,
                    'timestamp' => optional($alert->updated_at)->toIso8601String(),
                ]),
                (clone $pendingCommunityProjects)->latest()->limit(2)->get()->map(fn (CommunityProject $project) => [
                    'type' => 'community_project',
                    'title' => $project->title,
                    'body' => $project->verification_status ?? 'pending',
                    'timestamp' => optional($project->updated_at)->toIso8601String(),
                ]),
                (clone $orderQuery)->latest()->limit(2)->get()->map(fn (Order $order) => [
                    'type' => 'order',
                    'title' => sprintf('Order ORD-%05d', $order->id),
                    'body' => $order->status,
                    'timestamp' => optional($order->updated_at)->toIso8601String(),
                ]),
                HireBooking::query()->latest()->limit(2)->get()->map(fn (HireBooking $booking) => [
                    'type' => 'hire',
                    'title' => sprintf('Hire HIRE-%05d', $booking->id),
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    public function admin(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['super_admin', 'operator']), 403);

        return response()->json([
            'role' => 'admin',
            'stats' => [
                'users' => User::count(),
                'roles' => RoleApplication::query()->whereIn('status', ['submitted', 'pending_review'])->count(),
                'providers' => ServiceProvider::count(),
                'reports' => CityReport::query()->whereIn('status', $this->activeReportStatuses)->count(),
                'alerts' => Alert::query()->where('is_active', true)->count(),
                'events' => Event::count(),
                'products' => Product::count(),
                'accommodations' => Accommodation::count(),
                'flagged_content' => ModerationFlag::query()->where('status', 'open')->count(),
                'total_users' => User::count(),
                'residents' => $this->residentCount(),
                'businesses' => Organization::query()->whereNotNull('owner_user_id')->count(),
                'service_providers' => ServiceProvider::count(),
                'drivers' => User::role('driver')->count(),
                'couriers' => User::role('courier')->count(),
                'organizations' => Organization::count(),
                'town_managers' => User::role('town_manager')->count() + User::role('municipality_admin')->count(),
                'pending_role_applications' => RoleApplication::query()->whereIn('status', ['submitted', 'pending_review'])->count(),
                'pending_community_projects' => CommunityProject::query()->where('verification_status', 'pending')->count(),
                'pending_feed_posts' => FeedPost::query()->where('status', 'pending')->count(),
                'pending_reward_approvals' => CommunityImpactTransaction::query()->where('verification_status', 'pending')->count(),
                'active_reports' => CityReport::query()->whereIn('status', $this->activeReportStatuses)->count(),
                'active_rides' => RideRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'arrived', 'in_progress'])->count(),
                'active_deliveries' => DeliveryRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit'])->count(),
                'active_orders' => Order::query()->whereNotIn('status', [Order::STATUS_DELIVERED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED])->count(),
                'notification_volume' => $this->notificationCount(),
                'hire_items' => HireItem::count(),
                'active_hire_bookings' => HireBooking::query()->whereIn('status', HireBooking::ACTIVE_AVAILABILITY_STATUSES)->count(),
            ],
            'system_overview' => [
                'total_listings' => Listing::count(),
                'total_jobs' => JobPost::count(),
                'total_bookings' => Booking::count(),
                'towns_live' => 1,
            ],
            'quick_actions' => [
                ['label' => 'Manage towns', 'href' => '/dashboard/admin/towns', 'icon' => 'building'],
                ['label' => 'Manage users', 'href' => '/dashboard/admin/users', 'icon' => 'users'],
                ['label' => 'Review role applications', 'href' => '/dashboard/admin/role-applications', 'icon' => 'check-square'],
                ['label' => 'View audit logs', 'href' => '/dashboard/admin/audit-logs', 'icon' => 'scroll-text'],
                ['label' => 'View system health', 'href' => '/dashboard/admin/system-health', 'icon' => 'activity'],
                ['label' => 'View feature flags', 'href' => '/dashboard/admin/feature-flags', 'icon' => 'sparkles'],
                ['label' => 'View orders', 'href' => '/dashboard/admin/orders', 'icon' => 'shopping-bag'],
                ['label' => 'Review hire', 'href' => '/dashboard/admin/hire', 'icon' => 'warehouse'],
            ],
            'pending_tasks' => [
                ['label' => 'Open flags', 'count' => ModerationFlag::query()->where('status', 'open')->count()],
                ['label' => 'Open reports', 'count' => CityReport::query()->whereIn('status', $this->activeReportStatuses)->count()],
                ['label' => 'Pending role approvals', 'count' => RoleApplication::query()->whereIn('status', ['submitted', 'pending_review'])->count()],
                ['label' => 'Pending community projects', 'count' => CommunityProject::query()->where('verification_status', 'pending')->count()],
                ['label' => 'Open orders', 'count' => Order::query()->whereNotIn('status', [Order::STATUS_DELIVERED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED])->count()],
                ['label' => 'Pending hire approvals', 'count' => HireItem::query()->where('verification_status', HireItem::VERIFICATION_PENDING)->count()],
            ],
            'pending_approvals' => RoleApplication::query()->latest()->limit(6)->get(['id', 'requested_role', 'status', 'full_name', 'phone', 'created_at']),
            'moderation_flags' => ModerationFlag::query()->latest()->limit(6)->get(['id', 'reason', 'status', 'notes', 'created_at']),
            'recent_reports' => CityReport::query()->latest()->limit(5)->get(['id', 'title', 'category', 'status', 'priority', 'created_at']),
            'recent_orders' => Order::query()->with(['customer:id,name,phone', 'business:id,name'])->latest()->limit(6)->get(),
            'recent_hire_items' => HireItem::query()->with(['owner:id,name,phone', 'business:id,name'])->latest()->limit(6)->get(),
            'recent_hire_bookings' => HireBooking::query()->with(['item:id,title', 'customer:id,name,phone', 'owner:id,name,phone'])->latest()->limit(6)->get(),
            'user_mix' => [
                'residents' => $this->residentCount(),
                'business_owners' => User::role('business_owner')->count() + User::role('seller')->count(),
                'service_providers' => User::role('service_provider')->count(),
                'drivers' => User::role('driver')->count(),
                'couriers' => User::role('courier')->count(),
                'town_managers' => User::role('town_manager')->count() + User::role('municipality_admin')->count(),
            ],
            'approval_breakdown' => [
                'role_applications' => RoleApplication::query()->whereIn('status', ['submitted', 'pending_review'])->count(),
                'community_projects' => CommunityProject::query()->where('verification_status', 'pending')->count(),
                'feed_posts' => FeedPost::query()->where('status', 'pending')->count(),
                'reward_verifications' => CommunityImpactTransaction::query()->where('verification_status', 'pending')->count(),
            ],
            'active_workloads' => [
                'reports' => CityReport::query()->whereIn('status', $this->activeReportStatuses)->count(),
                'rides' => RideRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'arrived', 'in_progress'])->count(),
                'deliveries' => DeliveryRequest::query()->whereIn('status', ['requested', 'searching', 'accepted', 'pickup_confirmed', 'in_transit'])->count(),
                'orders' => Order::query()->whereNotIn('status', [Order::STATUS_DELIVERED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED])->count(),
                'flags' => ModerationFlag::query()->where('status', 'open')->count(),
                'hire_bookings' => HireBooking::query()->whereIn('status', HireBooking::ACTIVE_AVAILABILITY_STATUSES)->count(),
            ],
            'notification_volume' => [
                'total_notifications' => $this->notificationCount(),
                'sent_last_24_hours' => $this->notificationCount(now()->subDay()),
                'unread_notifications' => $this->unreadNotificationCount(),
            ],
            'health_summary' => [
                [
                    'label' => 'Queue backlog',
                    'status' => $this->queueSize() > 25 ? 'warning' : 'healthy',
                    'value' => (string) ($this->queueSize() ?? 0),
                    'detail' => 'Pending jobs in the queue.',
                ],
                [
                    'label' => 'Failed jobs',
                    'status' => $this->failedJobsCount() > 0 ? 'warning' : 'healthy',
                    'value' => (string) ($this->failedJobsCount() ?? 0),
                    'detail' => 'Recent queue failures.',
                ],
                [
                    'label' => 'Realtime transport',
                    'status' => filled(config('broadcasting.default')) ? 'healthy' : 'degraded',
                    'value' => (string) config('broadcasting.default'),
                    'detail' => 'Configured broadcast driver.',
                ],
            ],
            'queue_health' => [
                'queue_driver' => (string) config('queue.default'),
                'pending_jobs' => $this->queueSize(),
                'failed_jobs' => $this->failedJobsCount(),
            ],
            'realtime_health' => [
                'broadcast_driver' => (string) config('broadcasting.default'),
                'queue_driver' => (string) config('queue.default'),
                'configured' => filled(config('broadcasting.default')),
            ],
            'town_activity_overview' => [[
                'town' => PilotLocation::town(),
                'users' => User::query()->where('default_town', PilotLocation::town())->count(),
                'open_reports' => CityReport::query()->where('town', PilotLocation::town())->whereIn('status', $this->activeReportStatuses)->count(),
                'businesses' => Organization::query()->where('town', PilotLocation::town())->count(),
                'providers' => ServiceProvider::query()->where('town', PilotLocation::town())->count(),
                'hire_items' => HireItem::query()->where('town', PilotLocation::town())->count(),
            ]],
            'recent_activity' => $this->mergeActivity([
                ModerationFlag::query()->latest()->limit(3)->get()->map(fn (ModerationFlag $flag) => [
                    'type' => 'flag',
                    'title' => $flag->reason,
                    'body' => $flag->status,
                    'timestamp' => optional($flag->updated_at)->toIso8601String(),
                ]),
                Event::query()->latest()->limit(2)->get()->map(fn (Event $event) => [
                    'type' => 'event',
                    'title' => $event->title,
                    'body' => $event->status ?? 'published',
                    'timestamp' => optional($event->updated_at)->toIso8601String(),
                ]),
                RoleApplication::query()->latest()->limit(2)->get()->map(fn (RoleApplication $application) => [
                    'type' => 'role_application',
                    'title' => $application->full_name,
                    'body' => $application->requested_role.' '.$application->status,
                    'timestamp' => optional($application->updated_at)->toIso8601String(),
                ]),
                Order::query()->latest()->limit(2)->get()->map(fn (Order $order) => [
                    'type' => 'order',
                    'title' => sprintf('Order ORD-%05d', $order->id),
                    'body' => $order->status,
                    'timestamp' => optional($order->updated_at)->toIso8601String(),
                ]),
                HireBooking::query()->latest()->limit(2)->get()->map(fn (HireBooking $booking) => [
                    'type' => 'hire',
                    'title' => sprintf('Hire HIRE-%05d', $booking->id),
                    'body' => $booking->status,
                    'timestamp' => optional($booking->updated_at)->toIso8601String(),
                ]),
            ]),
        ]);
    }

    protected function residentCount(): int
    {
        return User::query()
            ->where(function ($query): void {
                $query->whereNull('current_role')->orWhere('current_role', 'citizen');
            })
            ->count();
    }

    protected function notificationCount($since = null): int
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('notifications')) {
            return 0;
        }

        $query = \Illuminate\Support\Facades\DB::table('notifications');
        if ($since !== null) {
            $query->where('created_at', '>=', $since);
        }

        return (int) $query->count();
    }

    protected function unreadNotificationCount(): int
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('notifications')) {
            return 0;
        }

        return (int) \Illuminate\Support\Facades\DB::table('notifications')->whereNull('read_at')->count();
    }

    protected function queueSize(): ?int
    {
        try {
            $size = \Illuminate\Support\Facades\Queue::size();

            return is_numeric($size) ? (int) $size : null;
        } catch (\Throwable) {
            return null;
        }
    }

    protected function failedJobsCount(): ?int
    {
        try {
            if (! \Illuminate\Support\Facades\Schema::hasTable('failed_jobs')) {
                return null;
            }

            return (int) \Illuminate\Support\Facades\DB::table('failed_jobs')->count();
        } catch (\Throwable) {
            return null;
        }
    }

    protected function mergeActivity(array $groups): Collection
    {
        return collect($groups)
            ->flatten(1)
            ->filter()
            ->sortByDesc('timestamp')
            ->values()
            ->take(8);
    }
}
