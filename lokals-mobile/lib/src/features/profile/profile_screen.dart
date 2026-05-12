import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/experience_helpers.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'widgets/profile_menu_item.dart';
import 'widgets/role_switcher.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;
    final scrollBottomPadding = safeBottom + 88;
    final profile = ref.watch(profileSummaryProvider);
    final authState = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Profile',
      bodyBottomInset: 10,
      child: profile.when(
        data: (summary) {
          final currentRole = summary.user.currentRole ??
              (summary.user.roles.isNotEmpty ? summary.user.roles.first : 'citizen');
          final avatarUrl = resolveMediaUrl(
            summary.user.avatar ?? summary.profile['avatar_url']?.toString(),
          );
          final stats = summary.stats;
          final menu = [
            ('/my-bookings', 'My Bookings', 'Appointments, rides, and deliveries.', Icons.calendar_month_outlined),
            ('/my-tickets', 'My Tickets', 'Reserved and confirmed event tickets.', Icons.confirmation_number_outlined),
            ('/jobs', 'My Jobs', 'Job posts, applications, and worker tools.', Icons.work_outline_rounded),
            ('/marketplace', 'My Listings', 'Marketplace posts and listing shortcuts.', Icons.storefront_outlined),
            ('/store', 'My Products', 'Store items and seller shortcuts.', Icons.shopping_bag_outlined),
            ('/accommodation', 'My Accommodation', 'Property and short-stay listings.', Icons.home_work_outlined),
            ('/saved-items', 'Saved Items', 'Saved products, events, providers, and local updates.', Icons.bookmark_outline_rounded),
            ('/activity', 'Activity', 'Notifications, alerts, and account history.', Icons.notifications_active_outlined),
            ('/dashboard', 'Manage My Business', 'Business, service, and organization tools.', Icons.business_center_outlined),
            ('/settings', 'Settings', 'Preferences, roles, privacy, and support.', Icons.settings_outlined),
          ];

          return ListView(
            padding: EdgeInsets.fromLTRB(20, 20, 20, scrollBottomPadding),
            children: [
              AppCard(
                variant: AppCardVariant.dashboard,
                padding: EdgeInsets.zero,
                child: Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        AppColors.primaryPurple,
                        AppColors.electricPurple,
                      ],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 46,
                        backgroundColor: Colors.white,
                        backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                        child: avatarUrl == null
                            ? Text(
                                summary.user.name.characters.first.toUpperCase(),
                                style: AppTextStyles.h2.copyWith(
                                  color: AppColors.primaryPurple,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(height: 14),
                      Text(
                        summary.user.name,
                        textAlign: TextAlign.center,
                        style: AppTextStyles.h2.copyWith(
                          fontSize: 28,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        summary.user.phone,
                        textAlign: TextAlign.center,
                        style: AppTextStyles.body.copyWith(color: Colors.white70),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${summary.user.defaultArea ?? summary.profile['default_area']?.toString() ?? summary.user.location ?? 'Okahandja'}, ${summary.user.defaultTown ?? summary.profile['default_town']?.toString() ?? 'Namibia'}',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodyMuted.copyWith(color: Colors.white70),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          AppBadge(
                            label: 'Okahandja pilot',
                            tone: AppBadgeTone.neutral,
                          ),
                          AppBadge(
                            label: formatRoleLabel(currentRole),
                            tone: AppBadgeTone.brand,
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      AppButton(
                        label: 'Edit profile',
                        expanded: false,
                        variant: AppButtonVariant.secondary,
                        onPressed: () => context.push('/profile/edit'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: MetricCard(
                      label: 'Bookings',
                      value: '${stats['bookings'] ?? 0}',
                      color: AppColors.primaryPurple,
                      icon: Icons.calendar_month_outlined,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: MetricCard(
                      label: 'Jobs',
                      value: '${stats['jobs_applications'] ?? 0}',
                      icon: Icons.work_outline_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: MetricCard(
                      label: 'Listings',
                      value: '${(stats['listings'] ?? 0) + (stats['products'] ?? 0)}',
                      color: AppColors.primaryGreen,
                      icon: Icons.storefront_outlined,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: MetricCard(
                      label: 'Saved',
                      value: '${stats['saved_items'] ?? 0}',
                      color: AppColors.warning,
                      icon: Icons.bookmark_outline_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      title: 'Role management',
                      subtitle: 'Switch tools and shortcuts based on what you are doing now.',
                    ),
                    const SizedBox(height: 14),
                    RoleSwitcher(
                      roles: summary.user.roles,
                      currentRole: currentRole,
                      isBusy: authState.isLoading,
                      onSelected: (role) async {
                        await ref.read(authControllerProvider.notifier).switchRole(role);
                        ref.invalidate(profileSummaryProvider);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      title: 'Account shortcuts',
                      subtitle: 'Everything you manage from your account in one clean list.',
                    ),
                    const SizedBox(height: 14),
                    ...menu.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: ProfileMenuItem(
                          label: item.$2,
                          description: item.$3,
                          icon: item.$4,
                          onTap: () => context.go(item.$1),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppButton(
                label: 'Logout',
                variant: AppButtonVariant.secondary,
                onPressed: () async {
                  await ref.read(authControllerProvider.notifier).logout();
                },
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading profile',
          message: 'Pulling in your account and activity summary...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Profile unavailable',
            body: 'We could not load your profile right now.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(profileSummaryProvider),
            ),
          ),
        ),
      ),
    );
  }
}
