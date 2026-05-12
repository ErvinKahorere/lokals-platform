import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  List<({String label, String description, IconData icon, String route})> _roleItems(String role, bool isGuest) {
    if (isGuest) {
      return const [
        (label: 'Login', description: 'Sign in and unlock your saved actions.', icon: Icons.login_rounded, route: '/login'),
        (label: 'Support', description: 'Get help with the app and your account.', icon: Icons.support_agent_outlined, route: '/support'),
      ];
    }

    switch (role) {
      case 'seller':
      case 'business_owner':
        return const [
          (label: 'Business Dashboard', description: 'Listings, products, and local traction.', icon: Icons.store_mall_directory_outlined, route: '/dashboard/business'),
          (label: 'Provider Requests', description: 'Manage service and booking demand.', icon: Icons.assignment_outlined, route: '/provider-bookings'),
        ];
      case 'service_provider':
        return const [
          (label: 'Provider Dashboard', description: 'Profile, bookings, and verification shortcuts.', icon: Icons.badge_outlined, route: '/dashboard/service-provider'),
          (label: 'Verification', description: 'Keep trust details and profile status updated.', icon: Icons.verified_user_outlined, route: '/verification'),
        ];
      case 'organization_admin':
        return const [
          (label: 'Organization Dashboard', description: 'Updates, events, and community alerts.', icon: Icons.groups_rounded, route: '/dashboard/organization'),
          (label: 'Followed Organisations', description: 'Community and organization updates in one place.', icon: Icons.campaign_outlined, route: '/following-organizations'),
        ];
      case 'town_manager':
      case 'municipality_admin':
      case 'super_admin':
      case 'operator':
        return [
          (
            label: 'Town Portal',
            description: 'Official alerts, reports, and municipality tools.',
            icon: Icons.account_balance_outlined,
            route: role == 'super_admin' || role == 'operator' ? '/dashboard/admin' : '/dashboard/town-manager',
          ),
          const (label: 'Resident Requests', description: 'Track reports and incoming local requests.', icon: Icons.mark_email_unread_outlined, route: '/activity'),
        ];
      default:
        return const [];
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final role = user?.currentRole ?? (user?.roles.isNotEmpty == true ? user!.roles.first : 'citizen');
    final roleItems = _roleItems(role, user == null);
    final items = [
      (label: 'Town Portal', description: 'Town alerts, public services, and council updates', icon: Icons.account_balance_outlined, route: '/okahandja'),
      (label: 'Directory', description: 'Police, clinics, schools, businesses', icon: Icons.business_outlined, route: '/directory'),
      (label: 'Services', description: 'Trusted local help and bookable providers', icon: Icons.home_repair_service_outlined, route: '/services'),
      (label: 'Marketplace', description: 'Products, listings, and local deals', icon: Icons.storefront_outlined, route: '/store'),
      (label: 'Jobs', description: 'Work opportunities and quick jobs', icon: Icons.work_outline_rounded, route: '/jobs'),
      (label: 'Stay', description: 'Rentals, homes, short stays', icon: Icons.apartment_outlined, route: '/accommodation'),
      (label: 'Events', description: 'Local events, tickets, and reminders', icon: Icons.event_outlined, route: '/events'),
      (label: 'News', description: 'Aggregated local stories and announcements', icon: Icons.newspaper_outlined, route: '/news'),
      (label: 'Activity', description: 'Requests, notifications, and city updates', icon: Icons.notifications_active_outlined, route: '/activity'),
      (label: 'Saved Items', description: 'Saved products, providers, and local updates', icon: Icons.bookmark_outline_rounded, route: '/saved-items'),
      (label: 'Notifications', description: 'Unread alerts, reminders, and booking changes', icon: Icons.notifications_none_rounded, route: '/notifications'),
      (label: 'Profile', description: 'Identity, verification, and personal shortcuts', icon: Icons.person_outline_rounded, route: '/profile'),
      (label: 'Help', description: 'Support and account help', icon: Icons.support_agent_outlined, route: '/support'),
      (label: 'SOS', description: 'Emergency support', icon: Icons.sos_outlined, route: '/sos'),
    ];

    return LokalsShell(
      title: 'More',
      bodyBottomInset: 10,
      child: ListView(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.viewPaddingOf(context).bottom + 88),
        children: [
          const SectionTitle(
            eyebrow: 'Discover more',
            title: 'Everything visible, without clutter',
            subtitle: 'Town tools, local discovery, personal shortcuts, and support all stay one tap away here.',
          ),
          const SizedBox(height: 16),
          AppCard(
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.purpleSoftAlt,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: const Icon(Icons.grid_view_rounded, color: AppColors.primaryPurple),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Move quickly through LOKALS', style: TextStyle(fontWeight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      Text('Hidden features now stay easier to find from Home, dashboards, and this More menu.', style: AppTextStyles.bodyMuted),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (roleItems.isNotEmpty) ...[
            const SizedBox(height: 16),
            const SectionTitle(
              eyebrow: 'Role tools',
              title: 'Built for your role',
              subtitle: 'Role-aware shortcuts for the work you do most often.',
            ),
            const SizedBox(height: 12),
            ...roleItems.map((item) => _MoreListItem(item: item)),
          ],
          const SizedBox(height: 16),
          const SectionTitle(
            eyebrow: 'All features',
            title: 'Explore LOKALS',
            subtitle: 'Core features, community tools, and account shortcuts across the whole app.',
          ),
          const SizedBox(height: 12),
          ...items.map((item) => _MoreListItem(item: item)),
        ],
      ),
    );
  }
}

class _MoreListItem extends StatelessWidget {
  const _MoreListItem({
    required this.item,
  });

  final ({String label, String description, IconData icon, String route}) item;

  @override
  Widget build(BuildContext context) {
    final isSos = item.route == '/sos';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => context.go(item.route),
        child: LokalsCard(
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: isSos ? AppColors.dangerSoft : AppColors.purpleSoftAlt,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  item.icon,
                  color: isSos ? AppColors.danger : AppColors.primaryPurple,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(item.description, style: AppTextStyles.bodyMuted),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded),
            ],
          ),
        ),
      ),
    );
  }
}
