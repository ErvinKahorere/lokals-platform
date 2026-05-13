import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/loading_skeleton.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class DriverDashboardScreen extends ConsumerWidget {
  const DriverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(driverDashboardProvider);

    return LokalsShell(
      title: 'Driver Dashboard',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Driver dashboard',
          subtitle: 'Ride requests, active trips, and earnings in one practical driver workspace.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'Available ride requests',
              subtitle: 'Resident requests still waiting for a driver.',
              items: ((data['available_requests'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
              emptyMessage: 'New ride requests will appear here when residents request transport.',
              icon: Icons.local_taxi_outlined,
              bodyBuilder: (item) => '${item['user']?['name'] ?? 'Resident'} | ${item['ride_type'] ?? 'Standard'} | N\$ ${item['fare_estimate'] ?? '0'}',
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Trip history',
              subtitle: 'Recent trips and status changes.',
              items: ((data['trip_history'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
              emptyMessage: 'Completed and active trips will show up here once you start accepting rides.',
              icon: Icons.history_toggle_off_outlined,
              bodyBuilder: (item) => '${item['status'] ?? 'requested'} | ${item['user']?['name'] ?? 'Resident'}',
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading driver dashboard',
          message: 'Checking ride demand, active trips, and earnings...',
        ),
        error: (error, _) => const Center(child: Text('Driver dashboard unavailable')),
      ),
    );
  }
}
