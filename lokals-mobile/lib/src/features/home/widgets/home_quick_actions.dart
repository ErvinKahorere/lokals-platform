import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/category_tile.dart';
import '../../../widgets/cards.dart';

class HomeQuickActions extends StatelessWidget {
  const HomeQuickActions({
    super.key,
    required this.role,
    required this.isGuest,
  });

  final String role;
  final bool isGuest;

  static const _primaryActions = <_QuickActionItem>[
    _QuickActionItem('SOS', '/sos', Icons.shield_rounded, AppColors.dangerSoft, AppColors.danger),
    _QuickActionItem('Services', '/services', Icons.home_repair_service_outlined, AppColors.infoSoft, AppColors.softBlue),
    _QuickActionItem('Taxi', '/ride', Icons.local_taxi_outlined, Color(0xFFFFF1D9), Color(0xFFD97706)),
    _QuickActionItem('Delivery', '/delivery', Icons.local_shipping_outlined, AppColors.successSoft, AppColors.primaryGreen),
    _QuickActionItem('Market', '/store', Icons.storefront_outlined, AppColors.warningSoft, AppColors.warning),
    _QuickActionItem('Report', '/report-issue', Icons.report_problem_outlined, AppColors.warningSoft, Color(0xFFD97706)),
    _QuickActionItem('Alerts', '/alerts', Icons.campaign_outlined, AppColors.purpleSoftAlt, AppColors.primaryPurple),
    _QuickActionItem('Directory', '/directory', Icons.business_outlined, AppColors.neutralSoft, AppColors.deepCharcoal),
  ];

  static const _exploreActions = <_QuickActionItem>[
    _QuickActionItem('Jobs', '/jobs', Icons.work_outline_rounded, AppColors.infoSoft, AppColors.softBlue),
    _QuickActionItem('Rentals', '/accommodation', Icons.home_work_outlined, AppColors.successSoft, AppColors.primaryGreen),
    _QuickActionItem('Events', '/events', Icons.event_outlined, AppColors.goldSoft, Color(0xFFD97706)),
    _QuickActionItem('News', '/news', Icons.newspaper_outlined, AppColors.neutralSoft, AppColors.deepCharcoal),
    _QuickActionItem('Orgs', '/following-organizations', Icons.groups_2_outlined, AppColors.purpleSoftAlt, AppColors.primaryPurple),
    _QuickActionItem('Saved', '/saved-items', Icons.bookmark_outline_rounded, AppColors.neutralSoft, AppColors.deepCharcoal),
    _QuickActionItem('Help', '/support', Icons.support_agent_outlined, AppColors.infoSoft, AppColors.softBlue),
  ];

  static const _accountActions = <_QuickActionItem>[
    _QuickActionItem('Activity', '/activity', Icons.history_rounded, AppColors.purpleSoftAlt, AppColors.primaryPurple),
    _QuickActionItem('Notify', '/notifications', Icons.notifications_none_rounded, AppColors.infoSoft, AppColors.softBlue),
    _QuickActionItem('Profile', '/profile', Icons.person_outline_rounded, AppColors.neutralSoft, AppColors.deepCharcoal),
    _QuickActionItem('Verify', '/verification', Icons.verified_user_outlined, AppColors.successSoft, AppColors.primaryGreen),
  ];

  List<_QuickActionItem> _roleActions() {
    final roleKey = isGuest ? 'guest' : role;
    switch (roleKey) {
      case 'seller':
      case 'business_owner':
        return const [
          _QuickActionItem('Business', '/dashboard/business', Icons.store_mall_directory_outlined, AppColors.purpleSoftAlt, AppColors.primaryPurple),
          _QuickActionItem('Listings', '/store', Icons.inventory_2_outlined, AppColors.warningSoft, AppColors.warning),
          _QuickActionItem('Requests', '/provider-bookings', Icons.assignment_outlined, AppColors.infoSoft, AppColors.softBlue),
          _QuickActionItem('Portal', '/okahandja', Icons.account_balance_outlined, AppColors.neutralSoft, AppColors.deepCharcoal),
        ];
      case 'service_provider':
        return const [
          _QuickActionItem('Provider', '/dashboard/service-provider', Icons.badge_outlined, AppColors.purpleSoftAlt, AppColors.primaryPurple),
          _QuickActionItem('Requests', '/provider-bookings', Icons.assignment_outlined, AppColors.infoSoft, AppColors.softBlue),
          _QuickActionItem('Jobs', '/jobs', Icons.work_outline_rounded, AppColors.warningSoft, AppColors.warning),
          _QuickActionItem('Verify', '/verification', Icons.verified_user_outlined, AppColors.successSoft, AppColors.primaryGreen),
        ];
      case 'organization_admin':
        return const [
          _QuickActionItem('Org Hub', '/dashboard/organization', Icons.groups_rounded, AppColors.purpleSoftAlt, AppColors.primaryPurple),
          _QuickActionItem('Alerts', '/alerts', Icons.campaign_outlined, AppColors.warningSoft, Color(0xFFD97706)),
          _QuickActionItem('Events', '/events', Icons.event_outlined, AppColors.infoSoft, AppColors.softBlue),
          _QuickActionItem('Activity', '/activity', Icons.history_rounded, AppColors.neutralSoft, AppColors.deepCharcoal),
        ];
      case 'town_manager':
      case 'municipality_admin':
      case 'super_admin':
      case 'operator':
        return [
          _QuickActionItem(
            'Portal',
            roleKey == 'super_admin' || roleKey == 'operator' ? '/dashboard/admin' : '/dashboard/town-manager',
            Icons.account_balance_outlined,
            AppColors.purpleSoftAlt,
            AppColors.primaryPurple,
          ),
          const _QuickActionItem('Reports', '/my-reports', Icons.assignment_late_outlined, AppColors.warningSoft, Color(0xFFD97706)),
          const _QuickActionItem('Alerts', '/alerts', Icons.campaign_outlined, AppColors.infoSoft, AppColors.softBlue),
          const _QuickActionItem('Requests', '/activity', Icons.mark_email_unread_outlined, AppColors.successSoft, AppColors.primaryGreen),
        ];
      case 'worker':
        return const [
          _QuickActionItem('Work Hub', '/dashboard/worker', Icons.work_history_outlined, AppColors.purpleSoftAlt, AppColors.primaryPurple),
          _QuickActionItem('Quick Jobs', '/jobs', Icons.bolt_outlined, AppColors.warningSoft, Color(0xFFD97706)),
          _QuickActionItem('Profile', '/profile', Icons.person_outline_rounded, AppColors.infoSoft, AppColors.softBlue),
          _QuickActionItem('Saved', '/saved-items', Icons.bookmark_outline_rounded, AppColors.neutralSoft, AppColors.deepCharcoal),
        ];
      case 'guest':
        return const [
          _QuickActionItem('Login', '/login', Icons.login_rounded, AppColors.purpleSoftAlt, AppColors.primaryPurple),
          _QuickActionItem('Support', '/support', Icons.support_agent_outlined, AppColors.infoSoft, AppColors.softBlue),
        ];
      default:
        return const [
          _QuickActionItem('Portal', '/okahandja', Icons.account_balance_outlined, AppColors.purpleSoftAlt, AppColors.primaryPurple),
          _QuickActionItem('Activity', '/activity', Icons.history_rounded, AppColors.infoSoft, AppColors.softBlue),
          _QuickActionItem('Saved', '/saved-items', Icons.bookmark_outline_rounded, AppColors.neutralSoft, AppColors.deepCharcoal),
          _QuickActionItem('Support', '/support', Icons.support_agent_outlined, AppColors.successSoft, AppColors.primaryGreen),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final roleActions = _roleActions();

    return Column(
      children: [
        _ActionGroupCard(
          eyebrow: 'Primary actions',
          title: 'Quick actions',
          subtitle: 'The fastest ways to get help, move around town, and reach key local tools.',
          items: _primaryActions,
          footer: Align(
            alignment: Alignment.centerLeft,
            child: AppButton(
              label: 'View all services',
              compact: true,
              expanded: false,
              variant: AppButtonVariant.secondary,
              onPressed: () => context.go('/services'),
            ),
          ),
        ),
        const SizedBox(height: 16),
        _ActionGroupCard(
          eyebrow: 'Explore more',
          title: 'More services',
          subtitle: 'Opportunities, local life, and community tools that should stay one tap away.',
          items: _exploreActions,
        ),
        const SizedBox(height: 16),
        _ActionGroupCard(
          eyebrow: 'My space',
          title: 'Account and updates',
          subtitle: 'Keep your requests, notifications, saved items, and profile easy to reach.',
          items: _accountActions,
        ),
        if (roleActions.isNotEmpty) ...[
          const SizedBox(height: 16),
          _ActionGroupCard(
            eyebrow: 'Role tools',
            title: 'Built for your role',
            subtitle: 'Shortcuts that match what you do in LOKALS right now.',
            items: roleActions,
          ),
        ],
      ],
    );
  }
}

class _ActionGroupCard extends StatelessWidget {
  const _ActionGroupCard({
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.items,
    this.footer,
  });

  final String eyebrow;
  final String title;
  final String subtitle;
  final List<_QuickActionItem> items;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(
            eyebrow: eyebrow,
            title: title,
            subtitle: subtitle,
          ),
          const SizedBox(height: 14),
          LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth < 360 ? 2 : 3;
              final ratio = constraints.maxWidth < 360 ? 1.04 : 0.98;

              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: items.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: columns,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: ratio,
                ),
                itemBuilder: (context, index) {
                  final item = items[index];
                  return CategoryTile(
                    icon: item.icon,
                    label: item.label,
                    color: item.color,
                    iconColor: item.iconColor,
                    onTap: () => context.go(item.route),
                  );
                },
              );
            },
          ),
          if (footer != null) ...[
            const SizedBox(height: 14),
            footer!,
          ],
        ],
      ),
    );
  }
}

class _QuickActionItem {
  const _QuickActionItem(this.label, this.route, this.icon, this.color, this.iconColor);

  final String label;
  final String route;
  final IconData icon;
  final Color color;
  final Color iconColor;
}
