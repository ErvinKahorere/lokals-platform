import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../widgets/cards.dart';

class DashboardQuickActionTile extends StatelessWidget {
  const DashboardQuickActionTile({
    super.key,
    required this.label,
    required this.body,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final String body;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return LokalsSurfaceTile(
      onTap: onTap,
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(
              color: AppColors.purpleSoft,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, color: AppColors.primaryPurple),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(body, style: AppTextStyles.bodyMuted),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: AppColors.mutedText),
        ],
      ),
    );
  }
}

class DashboardActivityList extends StatelessWidget {
  const DashboardActivityList({super.key, required this.items});

  final List<Map<String, dynamic>> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Text('No recent activity yet.', style: AppTextStyles.bodyMuted);
    }

    return Column(
      children: items.map((item) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: LokalsSurfaceTile(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        item['title']?.toString() ?? 'Activity',
                        style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700),
                      ),
                    ),
                    AppBadge(
                      label: item['type']?.toString() ?? 'update',
                      tone: AppBadgeTone.brand,
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(item['body']?.toString() ?? 'Recent platform activity.', style: AppTextStyles.bodyMuted),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class DashboardStatusCard extends StatelessWidget {
  const DashboardStatusCard({super.key, required this.items});

  final List<Map<String, dynamic>> items;

  @override
  Widget build(BuildContext context) {
    return LokalsCard(
      child: Column(
        children: items.map((item) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    item['label']?.toString() ?? 'Status item',
                    style: AppTextStyles.bodyMuted,
                  ),
                ),
                Text(
                  '${item['count'] ?? item['value'] ?? 0}',
                  style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

Widget buildDashboardCollectionSection({
  required String title,
  required String subtitle,
  required List<Map<String, dynamic>> items,
  required String emptyMessage,
  required IconData icon,
  String Function(Map<String, dynamic> item)? bodyBuilder,
  VoidCallback Function(Map<String, dynamic> item)? onTapBuilder,
}) {
  return LokalsCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(title: title, subtitle: subtitle),
        const SizedBox(height: 14),
        if (items.isEmpty)
          Text(emptyMessage, style: AppTextStyles.bodyMuted)
        else
          ...items.take(5).map((item) {
            final body = bodyBuilder?.call(item) ?? 'Open this dashboard item.';
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: DashboardQuickActionTile(
                label: item['title']?.toString() ??
                    item['name']?.toString() ??
                    'Dashboard item',
                body: body,
                icon: icon,
                onTap: onTapBuilder?.call(item) ?? () {},
              ),
            );
          }),
      ],
    ),
  );
}

class DashboardScaffold extends StatelessWidget {
  const DashboardScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.stats,
    required this.quickActions,
    required this.pendingTasks,
    required this.recentActivity,
    this.extraSections = const [],
  });

  final String title;
  final String subtitle;
  final Map<String, dynamic> stats;
  final List<Widget> quickActions;
  final List<Map<String, dynamic>> pendingTasks;
  final List<Map<String, dynamic>> recentActivity;
  final List<Widget> extraSections;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      children: [
        SectionTitle(title: title, subtitle: subtitle),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: stats.entries.map((entry) {
            return SizedBox(
              width: 160,
              child: MetricCard(
                label: entry.key.replaceAll('_', ' '),
                value: '${entry.value}',
                color: AppColors.primaryPurple,
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),
        LokalsCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionTitle(
                title: 'Quick actions',
                subtitle: 'Shortcuts for the next useful thing to do.',
              ),
              const SizedBox(height: 14),
              ...quickActions.expand((widget) => [widget, const SizedBox(height: 10)]),
            ],
          ),
        ),
        const SizedBox(height: 16),
        LokalsCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionTitle(
                title: 'Pending tasks',
                subtitle: 'What still needs attention.',
              ),
              const SizedBox(height: 14),
              DashboardStatusCard(items: pendingTasks),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ...extraSections,
        LokalsCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionTitle(
                title: 'Recent activity',
                subtitle: 'Latest movement across your dashboard.',
              ),
              const SizedBox(height: 14),
              DashboardActivityList(items: recentActivity),
            ],
          ),
        ),
      ],
    );
  }
}

IconData dashboardActionIcon(String label) {
  switch (label) {
    case 'Book Service':
      return Icons.design_services_outlined;
    case 'Report Issue':
      return Icons.report_problem_outlined;
    case 'Send Parcel':
      return Icons.local_shipping_outlined;
    case 'View Alerts':
      return Icons.notifications_active_outlined;
    case 'View Jobs':
      return Icons.work_outline_rounded;
    case 'Go Online':
      return Icons.power_settings_new_rounded;
    case 'Available Rides':
      return Icons.local_taxi_outlined;
    case 'Trip History':
      return Icons.history_toggle_off_outlined;
    case 'Documents':
      return Icons.description_outlined;
    case 'Available Deliveries':
      return Icons.delivery_dining_outlined;
    case 'Delivery History':
      return Icons.history_toggle_off_outlined;
    case 'Pending Approvals':
    case 'All Approvals':
      return Icons.fact_check_outlined;
    case 'Edit Worker Profile':
      return Icons.edit_outlined;
    case 'Update Availability':
      return Icons.schedule_outlined;
    case 'Add Product':
      return Icons.inventory_2_outlined;
    case 'Add Service':
      return Icons.add_business_outlined;
    case 'Post Promotion':
      return Icons.campaign_outlined;
    case 'View Store':
      return Icons.storefront_outlined;
    case 'Manage Availability':
      return Icons.calendar_month_outlined;
    case 'View Bookings':
      return Icons.book_online_outlined;
    case 'Post Alert':
    case 'Publish Alert':
    case 'Publish City Alert':
      return Icons.notification_important_outlined;
    case 'Add Event':
    case 'Create Event':
      return Icons.event_available_outlined;
    case 'Update Directory Profile':
    case 'Manage Directory':
    case 'Add Public Service':
    case 'Update Public Services':
      return Icons.account_balance_outlined;
    case 'View Followers':
    case 'Manage Users':
      return Icons.groups_2_outlined;
    case 'Manage Reports':
      return Icons.assignment_outlined;
    case 'Moderate Content':
      return Icons.shield_outlined;
    case 'View System Health':
      return Icons.monitor_heart_outlined;
    default:
      return Icons.chevron_right_rounded;
  }
}

List<Widget> buildQuickActions(BuildContext context, List<dynamic> actions) {
  return actions.map((item) {
    final action = Map<String, dynamic>.from(item as Map);
    final href = normalizeDashboardHref(action['href']?.toString() ?? '/');
    return DashboardQuickActionTile(
      label: action['label']?.toString() ?? 'Open',
      body: 'Open ${action['label']?.toString().toLowerCase() ?? 'dashboard section'}.',
      icon: dashboardActionIcon(action['label']?.toString() ?? ''),
      onTap: () => context.go(href),
    );
  }).toList();
}

String normalizeDashboardHref(String href) {
  switch (href) {
    case '/dashboard/events/create':
      return '/events';
    case '/admin/users':
    case '/admin/providers':
    case '/admin/bookings':
    case '/admin/listings':
    case '/admin/reports':
    case '/admin/overview':
      return '/dashboard/admin';
    case '/dashboard/town-manager/role-applications':
      return '/dashboard/town-manager/role-applications';
    default:
      return href;
  }
}
