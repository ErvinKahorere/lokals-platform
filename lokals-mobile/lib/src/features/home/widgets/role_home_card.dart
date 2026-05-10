import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_card.dart';

class RoleHomeCard extends StatelessWidget {
  const RoleHomeCard({super.key, required this.role, required this.isGuest});

  final String role;
  final bool isGuest;

  @override
  Widget build(BuildContext context) {
    final roleKey = isGuest ? 'guest' : role;
    final content = switch (roleKey) {
      'seller' || 'service_provider' || 'business_owner' => (
        'Manage your business',
        'Track your services, products, and followers in one place.',
        'Open Dashboard',
        role == 'service_provider' ? '/dashboard/service-provider' : '/dashboard/business',
        Icons.storefront_outlined,
      ),
      'worker' => (
        'Find jobs near you',
        'Stay visible for local work and jump into new opportunities fast.',
        'View Work',
        '/jobs',
        Icons.work_outline_rounded,
      ),
      'organization_admin' => (
        'Organization dashboard ready',
        'Manage updates, alerts, events, and community activity from one place.',
        'Open Dashboard',
        '/dashboard/organization',
        Icons.campaign_outlined,
      ),
      'town_manager' || 'municipality_admin' || 'super_admin' || 'operator' => (
        'Open your dashboard',
        'Jump into reports, alerts, and role-specific oversight without leaving Home.',
        'Open Dashboard',
        role == 'super_admin' || role == 'operator' ? '/dashboard/admin' : '/dashboard/town-manager',
        Icons.dashboard_customize_outlined,
      ),
      'guest' => (
        'Sign in for a more personal local view',
        'Keep your role, location, updates, and saved actions synced across LOKALS.',
        'Sign in',
        '/login',
        Icons.login_rounded,
      ),
      _ => (
        'Explore services nearby',
        'Find trusted services, local offices, and nearby updates without leaving Home.',
        'Find Service',
        '/services',
        Icons.explore_outlined,
      ),
    };

    return AppCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.greenSoft,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(content.$5, color: AppColors.lokalsGreen),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(content.$1, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text(content.$2, style: const TextStyle(color: AppColors.mutedText)),
                const SizedBox(height: 14),
                AppButton(
                  label: content.$3,
                  expanded: false,
                  variant: isGuest ? AppButtonVariant.secondary : AppButtonVariant.primary,
                  onPressed: () => context.go(content.$4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
