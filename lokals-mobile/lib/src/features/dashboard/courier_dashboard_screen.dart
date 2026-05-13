import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/loading_skeleton.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class CourierDashboardScreen extends ConsumerWidget {
  const CourierDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(courierDashboardProvider);

    return LokalsShell(
      title: 'Courier Dashboard',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Courier dashboard',
          subtitle: 'Parcel requests, active drop-offs, and courier earnings in one focused workspace.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'Available deliveries',
              subtitle: 'Parcel requests still waiting for a courier.',
              items: ((data['available_deliveries'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
              emptyMessage: 'New delivery requests will appear here when residents or businesses request a courier.',
              icon: Icons.delivery_dining_outlined,
              bodyBuilder: (item) => '${item['user']?['name'] ?? 'Resident'} | ${item['parcel_size'] ?? 'Parcel'} | N\$ ${item['estimated_price'] ?? '0'}',
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Delivery history',
              subtitle: 'Recent courier work and status changes.',
              items: ((data['delivery_history'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
              emptyMessage: 'Accepted and completed deliveries will show up here once you start working.',
              icon: Icons.history_toggle_off_outlined,
              bodyBuilder: (item) => '${item['status'] ?? 'requested'} | ${item['user']?['name'] ?? 'Resident'}',
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading courier dashboard',
          message: 'Checking delivery demand, active drop-offs, and earnings...',
        ),
        error: (error, _) => const Center(child: Text('Courier dashboard unavailable')),
      ),
    );
  }
}
