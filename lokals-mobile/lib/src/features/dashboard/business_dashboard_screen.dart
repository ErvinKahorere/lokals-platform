import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class BusinessDashboardScreen extends ConsumerWidget {
  const BusinessDashboardScreen({
    super.key,
    this.title = 'Business Dashboard',
    this.dashboardTitle = 'Business dashboard',
    this.subtitle =
        'Products, services, followers, and promotions in one calm workspace.',
  });

  final String title;
  final String dashboardTitle;
  final String subtitle;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(businessDashboardProvider);

    return LokalsShell(
      title: title,
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: dashboardTitle,
          subtitle: subtitle,
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const []).map((item) => Map<String, dynamic>.from(item as Map)).toList(),
          extraSections: [
            buildDashboardCollectionSection(
              title: 'Products',
              subtitle: 'Recent products and store updates ready for customers.',
              items: ((data['recent_products'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Products you add to the store will show up here for quick review.',
              icon: Icons.inventory_2_outlined,
              bodyBuilder: (item) =>
                  '${item['category'] ?? 'Local product'} | ${item['price'] ?? 'Price on request'}',
            ),
            const SizedBox(height: 16),
            buildDashboardCollectionSection(
              title: 'Promotions',
              subtitle: 'Recent sale alerts and business-facing announcements.',
              items: ((data['sale_alerts'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList(),
              emptyMessage:
                  'Post a promotion to keep followers and local shoppers engaged.',
              icon: Icons.campaign_outlined,
              bodyBuilder: (item) =>
                  item['body']?.toString() ?? 'Promotion details will appear here.',
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading business dashboard',
          message: 'Pulling in products, services, and bookings...',
        ),
        error: (error, _) => const Center(child: Text('Dashboard unavailable')),
      ),
    );
  }
}
