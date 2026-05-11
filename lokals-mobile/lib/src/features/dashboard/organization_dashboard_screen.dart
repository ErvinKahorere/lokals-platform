import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class OrganizationDashboardScreen extends ConsumerWidget {
  const OrganizationDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(organizationDashboardProvider);

    return LokalsShell(
      title: 'Organization Dashboard',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Organization dashboard',
          subtitle: 'Followers, updates, events, and public profile work in one place.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'Public updates',
              subtitle: 'Recent notices and organization-led public messaging.',
              items: ((data['public_updates'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Alerts and public updates you publish will show up here.',
              icon: Icons.campaign_outlined,
              bodyBuilder: (item) =>
                  item['location']?.toString() ?? 'Local public update',
              onTapBuilder: (_) => () => context.go('/dashboard/organization'),
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Events',
              subtitle: 'Upcoming meetings, events, and public community moments.',
              items: ((data['events'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Events you create will appear here for quick follow-up.',
              icon: Icons.event_available_outlined,
              bodyBuilder: (item) =>
                  '${item['category'] ?? 'community'} | ${item['starts_at'] ?? 'Schedule pending'}',
              onTapBuilder: (item) => () => context.go('/events/${item['id']}'),
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading organization dashboard',
          message: 'Bringing in alerts, events, and local activity...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Dashboard unavailable',
            body: 'We could not load your organization dashboard right now.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(organizationDashboardProvider),
            ),
          ),
        ),
      ),
    );
  }
}
