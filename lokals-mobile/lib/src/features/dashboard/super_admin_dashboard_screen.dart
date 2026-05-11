import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class SuperAdminDashboardScreen extends ConsumerWidget {
  const SuperAdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(superAdminDashboardProvider);

    return LokalsShell(
      title: 'Super Admin Dashboard',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Platform control center',
          subtitle: 'Users, moderation, directory, and system-level platform pressure in one place.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'Moderation queue',
              subtitle: 'Flagged content and operational review pressure.',
              items: ((data['moderation_flags'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Moderation flags will appear here when reports need review.',
              icon: Icons.shield_outlined,
              bodyBuilder: (item) =>
                  '${item['status'] ?? 'open'} | ${item['notes'] ?? 'Pending review'}',
              onTapBuilder: (_) => () => context.go('/dashboard/admin'),
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Recent reports',
              subtitle: 'City reports that may need admin visibility or escalation.',
              items: ((data['recent_reports'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage: 'Recent reports will appear here once reports are flowing.',
              icon: Icons.report_outlined,
              bodyBuilder: (item) =>
                  '${item['status'] ?? 'open'} | ${item['priority'] ?? 'standard'}',
              onTapBuilder: (item) => () => context.go('/reports/${item['id']}'),
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading platform overview',
          message: 'Checking users, content, and system activity...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Dashboard unavailable',
            body: 'We could not load the platform control center right now.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(superAdminDashboardProvider),
            ),
          ),
        ),
      ),
    );
  }
}
