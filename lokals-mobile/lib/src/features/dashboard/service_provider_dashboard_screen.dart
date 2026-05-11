import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class ServiceProviderDashboardScreen extends ConsumerWidget {
  const ServiceProviderDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(serviceProviderDashboardProvider);

    return LokalsShell(
      title: 'Service Dashboard',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Service provider dashboard',
          subtitle: 'Bookings, services, rates, and availability in one practical workspace.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'Recent bookings',
              subtitle: 'The latest client demand and booking movement.',
              items: ((data['recent_bookings'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Bookings from your public service profile will appear here.',
              icon: Icons.calendar_month_outlined,
              bodyBuilder: (item) =>
                  '${item['status'] ?? 'pending'} | ${item['booking_date'] ?? 'Upcoming'}',
              onTapBuilder: (_) => () => context.go('/provider-bookings'),
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Services and rates',
              subtitle: 'Your most visible rates and service entries.',
              items: ((data['services_offered'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Services you publish will show up here for quick review.',
              icon: Icons.payments_outlined,
              bodyBuilder: (item) =>
                  '${item['price'] ?? 'Price on request'} | ${item['price_type'] ?? 'fixed'}',
              onTapBuilder: (_) => () => context.go('/services'),
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading service dashboard',
          message: 'Preparing bookings, rates, and client activity...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Dashboard unavailable',
            body: 'We could not load your service provider dashboard right now.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(serviceProviderDashboardProvider),
            ),
          ),
        ),
      ),
    );
  }
}
