import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/experience/notification_bell.dart';
import '../../core/experience_helpers.dart';
import '../../core/theme_controller.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  String _formatRole(String role) {
    return role
        .split('_')
        .map((item) => item.isEmpty ? item : '${item[0].toUpperCase()}${item.substring(1)}')
        .join(' ');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(profileSummaryProvider);
    final themeMode = ref.watch(themeControllerProvider);
    final authState = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Profile',
      actions: const [NotificationBell(count: 2)],
      child: profile.when(
        data: (summary) {
          final menu = [
            ('/my-bookings', 'My Bookings', Icons.book_online_outlined),
            ('/jobs', 'My Jobs', Icons.work_outline),
            ('/marketplace', 'My Listings', Icons.storefront_outlined),
            ('/services', 'My Services', Icons.design_services_outlined),
            ('/activity', 'Activity', Icons.timeline_outlined),
            ('/store', 'Store', Icons.shopping_bag_outlined),
            ('/accommodation', 'Accommodation', Icons.apartment_outlined),
            ('/settings', 'Settings', Icons.settings_outlined),
          ];
          final avatarUrl = resolveMediaUrl(
            summary.user.avatar ?? summary.profile['avatar_url']?.toString(),
          );

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundImage: avatarUrl != null
                              ? NetworkImage(avatarUrl)
                              : null,
                          child: avatarUrl == null
                              ? Text(
                                  summary.user.name.characters.first
                                      .toUpperCase(),
                                )
                              : null,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(summary.user.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              Text(summary.user.phone),
                              const SizedBox(height: 4),
                              Text('${summary.user.defaultArea ?? summary.profile['default_area']?.toString() ?? summary.user.location ?? 'Windhoek'}, ${summary.user.defaultTown ?? summary.profile['default_town']?.toString() ?? 'Namibia'}', style: const TextStyle(color: Color(0xFF64748B))),
                              const SizedBox(height: 4),
                              Text(summary.user.profession ?? summary.profile['profession']?.toString() ?? 'Profession not added yet', style: const TextStyle(color: Color(0xFF64748B))),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFEDE9FE),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      _formatRole(
                                        summary.user.currentRole ??
                                            (summary.user.roles.isNotEmpty
                                                ? summary.user.roles.first
                                                : 'citizen'),
                                      ),
                                      style: const TextStyle(
                                        color: Color(0xFF4F46E5),
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  if (summary.user.roles.length > 1)
                                    PopupMenuButton<String>(
                                      onSelected: (role) async {
                                        await ref.read(authControllerProvider.notifier).switchRole(role);
                                      },
                                      itemBuilder: (context) => summary.user.roles
                                          .map(
                                            (role) => PopupMenuItem<String>(
                                              value: role,
                                              child: Text(_formatRole(role)),
                                            ),
                                          )
                                          .toList(),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF8FAFC),
                                          borderRadius: BorderRadius.circular(999),
                                          border: Border.all(color: const Color(0xFFE2E8F0)),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              'Switch role',
                                              style: const TextStyle(fontWeight: FontWeight.w600),
                                            ),
                                            const SizedBox(width: 6),
                                            authState.isLoading
                                                ? const SizedBox(
                                                    width: 14,
                                                    height: 14,
                                                    child: CircularProgressIndicator(strokeWidth: 2),
                                                  )
                                                : const Icon(Icons.expand_more_rounded, size: 18),
                                          ],
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    LinearProgressIndicator(
                      value: summary.completionPercentage / 100,
                      minHeight: 10,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    const SizedBox(height: 8),
                    Text('Profile completion: ${summary.completionPercentage}%'),
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
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Appearance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    const Text('Switch between light, dark, or system mode instantly.'),
                    const SizedBox(height: 14),
                    SegmentedButton<ThemeMode>(
                      segments: const [
                        ButtonSegment(value: ThemeMode.light, label: Text('Light')),
                        ButtonSegment(value: ThemeMode.dark, label: Text('Dark')),
                        ButtonSegment(value: ThemeMode.system, label: Text('System')),
                      ],
                      selected: {themeMode},
                      onSelectionChanged: (selection) {
                        ref.read(themeControllerProvider.notifier).setThemeMode(selection.first);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: const [
                  Expanded(child: MetricCard(label: 'Bookings', value: '12')),
                  SizedBox(width: 12),
                  Expanded(child: MetricCard(label: 'Jobs', value: '5', color: Color(0xFF166534))),
                  SizedBox(width: 12),
                  Expanded(child: MetricCard(label: 'Listings', value: '7', color: Color(0xFF0F172A))),
                ],
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Menu', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    ...menu.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(18),
                          onTap: () => context.go(item.$1),
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              children: [
                                Icon(item.$3),
                                const SizedBox(width: 12),
                                Expanded(child: Text(item.$2, style: const TextStyle(fontWeight: FontWeight.w600))),
                                const Icon(Icons.chevron_right_rounded),
                              ],
                            ),
                          ),
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
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Failed to load profile: $error')),
      ),
    );
  }
}
