import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class CitizenDashboardScreen extends ConsumerWidget {
  const CitizenDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(citizenDashboardProvider);

    return LokalsShell(
      title: 'Dashboard',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Citizen dashboard',
          subtitle: 'Bookings, alerts, reports, tickets, and followed updates in one place.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'My reports',
              subtitle: 'Your latest civic issues and their current status.',
              items: ((data['my_reports'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Your reports will appear here once you send your first city issue.',
              icon: Icons.report_problem_outlined,
              bodyBuilder: (item) =>
                  '${item['status'] ?? 'open'} | ${item['priority'] ?? 'standard'}',
              onTapBuilder: (item) => () => context.go('/reports/${item['id']}'),
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'My tickets',
              subtitle: 'Reserved and confirmed tickets you can open quickly.',
              items: ((data['my_tickets'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Event tickets you reserve through LOKALS will appear here.',
              icon: Icons.confirmation_number_outlined,
              bodyBuilder: (item) =>
                  item['status']?.toString() ?? 'Ticket activity will appear here.',
              onTapBuilder: (item) => () => context.go('/tickets/${item['id']}'),
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Alerts',
              subtitle: 'Fresh municipal and community updates that matter to you.',
              items: ((data['recent_alerts'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage: 'Local alerts will appear here when new updates are published.',
              icon: Icons.notifications_active_outlined,
              bodyBuilder: (item) =>
                  item['priority']?.toString() ?? 'Recent alert',
              onTapBuilder: (_) => () => context.go('/alerts'),
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading citizen dashboard',
          message: 'Bringing in your bookings, reports, tickets, and local activity...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Dashboard unavailable',
            body: 'We could not load your citizen dashboard right now.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(citizenDashboardProvider),
            ),
          ),
        ),
      ),
    );
  }
}
