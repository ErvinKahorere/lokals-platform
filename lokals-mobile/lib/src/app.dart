import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_theme.dart';
import 'core/theme_controller.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/accommodation/accommodation_screen.dart';
import 'features/accommodation/accommodation_details_screen.dart';
import 'features/activity/activity_screen.dart';
import 'features/activity/alerts_screen.dart';
import 'features/bookings/booking_screen.dart';
import 'features/bookings/my_bookings_screen.dart';
import 'features/bookings/provider_bookings_screen.dart';
import 'features/directory/directory_screen.dart';
import 'features/directory/directory_details_screen.dart';
import 'features/home/home_screen.dart';
import 'features/jobs/jobs_screen.dart';
import 'features/marketplace/marketplace_screen.dart';
import 'features/more/more_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/profile/edit_profile_screen.dart';
import 'features/requests/delivery_request_screen.dart';
import 'features/requests/ride_request_screen.dart';
import 'features/reports/report_issue_screen.dart';
import 'features/services/provider_details_screen.dart';
import 'features/services/services_screen.dart';
import 'features/settings/settings_screen.dart';
import 'features/sos/sos_screen.dart';
import 'features/store/store_screen.dart';
import 'features/store/product_details_screen.dart';
import 'features/workers/worker_profile_screen.dart';
import 'features/workers/workers_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = auth.token != null;
      final isLoggingIn = state.matchedLocation == '/login';
      const protectedPrefixes = [
        '/book',
        '/my',
        '/provider-bookings',
        '/report-issue',
        '/delivery',
        '/ride',
        '/sos',
        '/profile',
      ];
      final needsAuth = protectedPrefixes.any(
        (prefix) => state.matchedLocation.startsWith(prefix),
      );

      if (!isLoggedIn && !isLoggingIn && needsAuth) {
        return '/login';
      }

      if (isLoggedIn && isLoggingIn) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/activity',
        builder: (context, state) => const ActivityScreen(),
      ),
      GoRoute(
        path: '/alerts',
        builder: (context, state) => const AlertsScreen(),
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
        path: '/directory/:id',
        builder: (context, state) => DirectoryDetailsScreen(
          directoryId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(path: '/jobs', builder: (context, state) => const JobsScreen()),
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
        path: '/delivery',
        builder: (context, state) => const DeliveryRequestScreen(),
      ),
      GoRoute(
        path: '/ride',
        builder: (context, state) => const RideRequestScreen(),
      ),
      GoRoute(path: '/sos', builder: (context, state) => const SosScreen()),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
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
    final themeMode = ref.watch(themeControllerProvider);

    return MaterialApp.router(
      title: 'LOKALS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      themeMode: themeMode,
      darkTheme: AppTheme.dark(),
      themeAnimationDuration: const Duration(milliseconds: 280),
      routerConfig: router,
    );
  }
}
