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
import 'features/directory/directory_screen.dart';
import 'features/directory/directory_details_screen.dart';
import 'features/dashboard/dashboard_router_screen.dart';
import 'features/dashboard/worker_dashboard_screen.dart';
import 'features/dashboard/business_dashboard_screen.dart';
import 'features/dashboard/organization_dashboard_screen.dart';
import 'features/dashboard/service_provider_dashboard_screen.dart';
import 'features/dashboard/town_manager_dashboard_screen.dart';
import 'features/dashboard/super_admin_dashboard_screen.dart';
import 'features/events/event_calendar_screen.dart';
import 'features/events/event_details_screen.dart';
import 'features/events/events_screen.dart';
import 'features/events/my_tickets_screen.dart';
import 'features/events/ticket_details_screen.dart';
import 'features/home/home_screen.dart';
import 'features/home/onboarding_screen.dart';
import 'features/jobs/job_details_screen.dart';
import 'features/jobs/jobs_screen.dart';
import 'features/marketplace/marketplace_screen.dart';
import 'features/more/more_screen.dart';
import 'features/news/news_screen.dart';
import 'features/news/news_details_screen.dart';
import 'features/news/article_browser_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/profile/edit_profile_screen.dart';
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
        '/sos',
        '/profile',
        '/saved-items',
        '/dashboard',
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
              (auth.user?.roles.isNotEmpty == true ? auth.user!.roles.first : null),
        );
      }

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardRouterScreen(),
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
        path: '/dashboard/admin',
        builder: (context, state) => const SuperAdminDashboardScreen(),
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
      GoRoute(
        path: '/news',
        builder: (context, state) => const NewsScreen(),
      ),
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
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
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
        builder: (context, state) => DirectoryDetailsScreen(
          directoryId: state.pathParameters['id']!,
        ),
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
        builder: (context, state) => DeliveryDetailsScreen(
          deliveryId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/ride',
        builder: (context, state) => const RideRequestScreen(),
      ),
      GoRoute(
        path: '/ride/:id',
        builder: (context, state) => RideDetailsScreen(
          rideId: state.pathParameters['id']!,
        ),
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
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
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
