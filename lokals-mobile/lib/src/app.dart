import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_theme.dart';
import 'core/role_routing.dart';
import 'features/auth/auth_navigation.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/accommodation/accommodation_screen.dart';
import 'features/accommodation/accommodation_details_screen.dart';
import 'features/activity/activity_screen.dart';
import 'features/activity/alerts_screen.dart';
import 'features/activity/notifications_screen.dart';
import 'features/bookings/booking_screen.dart';
import 'features/bookings/my_bookings_screen.dart';
import 'features/bookings/provider_bookings_screen.dart';
import 'features/community_projects/community_project_details_screen.dart';
import 'features/community_projects/community_project_list_screen.dart';
import 'features/community_projects/community_project_review_queue_screen.dart';
import 'features/community_projects/community_project_review_screen.dart';
import 'features/community_projects/community_project_updates_screen.dart';
import 'features/community_projects/get_involved_home_screen.dart';
import 'features/community_projects/my_community_pledges_screen.dart';
import 'features/community_projects/my_community_projects_screen.dart';
import 'features/community_projects/submit_community_project_screen.dart';
import 'features/community_impact/community_impact_dashboard_screen.dart';
import 'features/community_impact/community_impact_history_screen.dart';
import 'features/community_impact/community_impact_leaderboard_screen.dart';
import 'features/community_impact/community_impact_pending_screen.dart';
import 'features/community_impact/community_impact_privacy_screen.dart';
import 'features/community_impact/community_impact_redemptions_screen.dart';
import 'features/community_impact/community_impact_rewards_screen.dart';
import 'features/directory/directory_screen.dart';
import 'features/directory/directory_details_screen.dart';
import 'features/dashboard/dashboard_router_screen.dart';
import 'features/dashboard/worker_dashboard_screen.dart';
import 'features/dashboard/driver_dashboard_screen.dart';
import 'features/dashboard/courier_dashboard_screen.dart';
import 'features/dashboard/seller_dashboard_screen.dart';
import 'features/dashboard/business_dashboard_screen.dart';
import 'features/dashboard/organization_dashboard_screen.dart';
import 'features/dashboard/service_provider_dashboard_screen.dart';
import 'features/dashboard/town_manager_dashboard_screen.dart';
import 'features/dashboard/super_admin_dashboard_screen.dart';
import 'features/dashboard/role_applications_review_screen.dart';
import 'features/events/event_calendar_screen.dart';
import 'features/events/event_details_screen.dart';
import 'features/events/events_screen.dart';
import 'features/events/my_tickets_screen.dart';
import 'features/events/ticket_details_screen.dart';
import 'features/feed/feed_screen.dart';
import 'features/hire/hire_booking_details_screen.dart';
import 'features/hire/hire_bookings_screen.dart';
import 'features/hire/hire_item_details_screen.dart';
import 'features/hire/hire_owner_bookings_screen.dart';
import 'features/hire/hire_screen.dart';
import 'features/home/home_screen.dart';
import 'features/home/onboarding_screen.dart';
import 'features/jobs/job_details_screen.dart';
import 'features/jobs/jobs_screen.dart';
import 'features/marketplace/marketplace_screen.dart';
import 'features/messages/conversation_screen.dart';
import 'features/messages/inbox_screen.dart';
import 'features/more/more_screen.dart';
import 'features/news/news_screen.dart';
import 'features/news/news_details_screen.dart';
import 'features/news/article_browser_screen.dart';
import 'features/orders/checkout_screen.dart';
import 'features/orders/order_details_screen.dart';
import 'features/orders/orders_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/profile/edit_profile_screen.dart';
import 'features/profile/role_modes_screen.dart';
import 'features/requests/delivery_request_screen.dart';
import 'features/requests/delivery_details_screen.dart';
import 'features/requests/ride_request_screen.dart';
import 'features/requests/ride_details_screen.dart';
import 'features/reports/report_issue_screen.dart';
import 'features/reports/my_reports_screen.dart';
import 'features/reports/report_details_screen.dart';
import 'features/saved/saved_items_screen.dart';
import 'features/search/search_results_screen.dart';
import 'features/services/provider_details_screen.dart';
import 'features/services/services_screen.dart';
import 'features/settings/settings_screen.dart';
import 'features/sos/sos_screen.dart';
import 'features/splash/splash_screen.dart';
import 'features/store/store_screen.dart';
import 'features/store/product_details_screen.dart';
import 'features/support/support_screen.dart';
import 'features/town_portal/town_portal_screen.dart';
import 'features/workers/worker_profile_screen.dart';
import 'features/workers/workers_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final refreshListenable = ValueNotifier<AuthState>(
    ref.read(authControllerProvider),
  );
  ref.listen<AuthState>(
    authControllerProvider,
    (_, next) => refreshListenable.value = next,
  );
  ref.onDispose(refreshListenable.dispose);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: refreshListenable,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final isLoggedIn = auth.token != null;
      final isRestoring = auth.isRestoring || !auth.hasRestored;
      final isSplash = state.matchedLocation == '/splash';
      final isLoggingIn = state.matchedLocation == '/login';
      final isRegistering = state.matchedLocation == '/register';
      final isOnboarding = state.matchedLocation == '/onboarding';
      const protectedPrefixes = [
        '/book',
        '/my',
        '/tickets',
        '/activity',
        '/provider-bookings',
        '/my-tickets',
        '/report-issue',
        '/delivery',
        '/ride',
        '/hire/bookings',
        '/hire/owner',
        '/orders',
        '/sos',
        '/profile',
        '/saved-items',
        '/dashboard',
        '/get-involved/my',
        '/get-involved/submit',
      ];
      final needsAuth = protectedPrefixes.any(
        (prefix) => state.matchedLocation.startsWith(prefix),
      );

      if (isRestoring && !isSplash) {
        return '/splash';
      }

      if (!isLoggedIn && !isLoggingIn && needsAuth) {
        return buildLoginLocation(next: state.uri.toString());
      }

      if (isLoggedIn && (isLoggingIn || isRegistering || isOnboarding)) {
        return roleHomePath(
          auth.user?.currentRole ??
              (auth.user?.roles.isNotEmpty == true
                  ? auth.user!.roles.first
                  : null),
        );
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/get-involved',
        builder: (context, state) => const GetInvolvedHomeScreen(),
      ),
      GoRoute(
        path: '/get-involved/list',
        builder: (context, state) => const CommunityProjectListScreen(),
      ),
      GoRoute(
        path: '/get-involved/submit',
        builder: (context, state) => const SubmitCommunityProjectScreen(),
      ),
      GoRoute(
        path: '/get-involved/my-projects',
        builder: (context, state) => const MyCommunityProjectsScreen(),
      ),
      GoRoute(
        path: '/get-involved/my-pledges',
        builder: (context, state) => const MyCommunityPledgesScreen(),
      ),
      GoRoute(
        path: '/get-involved/:slug/updates',
        builder: (context, state) =>
            CommunityProjectUpdatesScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/get-involved/:slug',
        builder: (context, state) =>
            CommunityProjectDetailsScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/community-impact',
        builder: (context, state) => const CommunityImpactDashboardScreen(),
      ),
      GoRoute(
        path: '/community-impact/history',
        builder: (context, state) => const CommunityImpactHistoryScreen(),
      ),
      GoRoute(
        path: '/community-impact/rewards',
        builder: (context, state) => const CommunityImpactRewardsScreen(),
      ),
      GoRoute(
        path: '/community-impact/redemptions',
        builder: (context, state) => const CommunityImpactRedemptionsScreen(),
      ),
      GoRoute(
        path: '/community-impact/leaderboard',
        builder: (context, state) => const CommunityImpactLeaderboardScreen(),
      ),
      GoRoute(
        path: '/community-impact/privacy',
        builder: (context, state) => const CommunityImpactPrivacyScreen(),
      ),
      GoRoute(
        path: '/dashboard/town-manager/community-impact/pending',
        builder: (context, state) => const CommunityImpactPendingScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardRouterScreen(),
      ),
      GoRoute(
        path: '/dashboard/community-projects/pending',
        builder: (context, state) => const CommunityProjectReviewQueueScreen(),
      ),
      GoRoute(
        path: '/dashboard/community-projects/pending/:id',
        builder: (context, state) => CommunityProjectReviewScreen(
          projectId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: '/dashboard/citizen',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/dashboard/worker',
        builder: (context, state) => const WorkerDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/driver',
        builder: (context, state) => const DriverDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/courier',
        builder: (context, state) => const CourierDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/seller',
        builder: (context, state) => const SellerDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/business',
        builder: (context, state) => const BusinessDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/service-provider',
        builder: (context, state) => const ServiceProviderDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/organization',
        builder: (context, state) => const OrganizationDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/municipality',
        builder: (context, state) => const TownManagerDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/town-manager',
        builder: (context, state) => const TownManagerDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/town-manager/role-applications',
        builder: (context, state) => const RoleApplicationsReviewScreen(),
      ),
      GoRoute(
        path: '/dashboard/admin',
        builder: (context, state) => const SuperAdminDashboardScreen(),
      ),
      GoRoute(path: '/feed', builder: (context, state) => const FeedScreen()),
      GoRoute(path: '/inbox', builder: (context, state) => const InboxScreen()),
      GoRoute(
        path: '/conversations/:id',
        builder: (context, state) =>
            ConversationScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/activity',
        builder: (context, state) => const ActivityScreen(),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => SearchResultsScreen(
          initialQuery: state.uri.queryParameters['q'] ?? '',
        ),
      ),
      GoRoute(
        path: '/alerts',
        builder: (context, state) => const AlertsScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(path: '/news', builder: (context, state) => const NewsScreen()),
      GoRoute(
        path: '/news/:id',
        builder: (context, state) =>
            NewsDetailsScreen(newsId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/article',
        builder: (context, state) => ArticleBrowserScreen(
          url: state.uri.queryParameters['url'] ?? '',
          sourceName: state.uri.queryParameters['source'] ?? 'External source',
          title: state.uri.queryParameters['title'] ?? 'Article',
        ),
      ),
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventsScreen(),
      ),
      GoRoute(
        path: '/events/calendar',
        builder: (context, state) => const EventCalendarScreen(),
      ),
      GoRoute(
        path: '/events/:id',
        builder: (context, state) =>
            EventDetailsScreen(eventId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/my-tickets',
        builder: (context, state) => const MyTicketsScreen(),
      ),
      GoRoute(
        path: '/tickets/:id',
        builder: (context, state) =>
            TicketDetailsScreen(ticketId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/services',
        builder: (context, state) => const ServicesScreen(),
      ),
      GoRoute(
        path: '/services/:id',
        builder: (context, state) =>
            ProviderDetailsScreen(providerId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/book/:id',
        builder: (context, state) =>
            BookingScreen(providerId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/my-bookings',
        builder: (context, state) => const MyBookingsScreen(),
      ),
      GoRoute(
        path: '/provider-bookings',
        builder: (context, state) => const ProviderBookingsScreen(),
      ),
      GoRoute(
        path: '/marketplace',
        builder: (context, state) => const MarketplaceScreen(),
      ),
      GoRoute(path: '/hire', builder: (context, state) => const HireScreen()),
      GoRoute(
        path: '/hire/bookings',
        builder: (context, state) => const HireBookingsScreen(),
      ),
      GoRoute(
        path: '/hire/bookings/:id',
        builder: (context, state) =>
            HireBookingDetailsScreen(bookingId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/hire/owner/bookings',
        builder: (context, state) => const HireOwnerBookingsScreen(),
      ),
      GoRoute(
        path: '/hire/:id',
        builder: (context, state) =>
            HireItemDetailsScreen(itemId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/orders',
        builder: (context, state) => const OrdersScreen(),
      ),
      GoRoute(
        path: '/orders/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) =>
            OrderDetailsScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/store', builder: (context, state) => const StoreScreen()),
      GoRoute(
        path: '/store/:id',
        builder: (context, state) =>
            ProductDetailsScreen(productId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/more', builder: (context, state) => const MoreScreen()),
      GoRoute(
        path: '/accommodation',
        builder: (context, state) => const AccommodationScreen(),
      ),
      GoRoute(
        path: '/accommodation/:id',
        builder: (context, state) => AccommodationDetailsScreen(
          accommodationId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/directory',
        builder: (context, state) => const DirectoryScreen(),
      ),
      GoRoute(
        path: '/okahandja',
        builder: (context, state) => const TownPortalScreen(),
      ),
      GoRoute(
        path: '/directory/:id',
        builder: (context, state) =>
            DirectoryDetailsScreen(directoryId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/jobs', builder: (context, state) => const JobsScreen()),
      GoRoute(
        path: '/jobs/:id',
        builder: (context, state) =>
            JobDetailsScreen(jobId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/workers',
        builder: (context, state) => const WorkersScreen(),
      ),
      GoRoute(
        path: '/workers/:id',
        builder: (context, state) =>
            WorkerProfileScreen(workerId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/report-issue',
        builder: (context, state) => const ReportIssueScreen(),
      ),
      GoRoute(
        path: '/my-reports',
        builder: (context, state) => const MyReportsScreen(),
      ),
      GoRoute(
        path: '/reports/:id',
        builder: (context, state) => ReportDetailsScreen(
          reportId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: '/delivery',
        builder: (context, state) => const DeliveryRequestScreen(),
      ),
      GoRoute(
        path: '/delivery/:id',
        builder: (context, state) =>
            DeliveryDetailsScreen(deliveryId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/ride',
        builder: (context, state) => const RideRequestScreen(),
      ),
      GoRoute(
        path: '/ride/:id',
        builder: (context, state) =>
            RideDetailsScreen(rideId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/sos', builder: (context, state) => const SosScreen()),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/saved-items',
        builder: (context, state) => const SavedItemsScreen(),
      ),
      GoRoute(
        path: '/profile/edit',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/profile/modes',
        builder: (context, state) => const RoleModesScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/following-organizations',
        builder: (context, state) => const ActivityScreen(),
      ),
      GoRoute(
        path: '/verification',
        builder: (context, state) => const RoleModesScreen(),
      ),
      GoRoute(
        path: '/support',
        builder: (context, state) => const SupportScreen(),
      ),
    ],
  );
});

class LokalsApp extends ConsumerWidget {
  const LokalsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'LOKALS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      themeMode: ThemeMode.light,
      themeAnimationDuration: const Duration(milliseconds: 280),
      routerConfig: router,
    );
  }
}
