import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class WorkerDashboardScreen extends ConsumerWidget {
  const WorkerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(workerDashboardProvider);

    return LokalsShell(
      title: 'Worker Dashboard',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Worker dashboard',
          subtitle: 'Jobs near you, applications, and availability at a glance.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'Nearby jobs',
              subtitle: 'Fresh work opportunities around Okahandja.',
              items: ((data['jobs_near_me'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage: 'New nearby jobs will show up here when local demand grows.',
              icon: Icons.work_outline_rounded,
              bodyBuilder: (item) =>
                  '${item['location'] ?? 'Okahandja'} | ${item['compensation'] ?? 'Budget on request'}',
              onTapBuilder: (item) => () => context.go('/jobs/${item['id']}'),
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Applications',
              subtitle: 'Track where you have already put your name forward.',
              items: ((data['applications'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage: 'Applications you send through LOKALS will appear here.',
              icon: Icons.assignment_turned_in_outlined,
              bodyBuilder: (item) {
                final job = Map<String, dynamic>.from(item['job'] as Map? ?? const {});
                return '${job['location'] ?? 'Okahandja'} | ${item['status'] ?? 'pending'}';
              },
              onTapBuilder: (item) {
                final job = Map<String, dynamic>.from(item['job'] as Map? ?? const {});
                return () => context.go('/jobs/${job['id']}');
              },
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading worker dashboard',
          message: 'Getting your work leads and activity ready...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Dashboard unavailable',
            body: 'We could not load your worker dashboard right now.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(workerDashboardProvider),
            ),
          ),
        ),
      ),
    );
  }
}
