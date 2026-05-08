import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => const Center(child: Text('Dashboard unavailable')),
      ),
    );
  }
}
