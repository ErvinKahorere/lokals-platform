import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_text_styles.dart';
import '../core/models.dart';
import '../../shared/widgets/experience/notification_bell.dart';
import '../../shared/widgets/mobile_bottom_nav.dart';
import '../features/auth/auth_controller.dart';
import '../features/discovery/discovery_repository.dart';

const _locationOptions = <({String town, String area})>[
  (town: 'Windhoek', area: 'Katutura'),
  (town: 'Windhoek', area: 'Khomasdal'),
  (town: 'Windhoek', area: 'Klein Windhoek'),
  (town: 'Windhoek', area: 'Eros'),
  (town: 'Windhoek', area: 'CBD'),
  (town: 'Swakopmund', area: 'Town Center'),
  (town: 'Walvis Bay', area: 'Narraville'),
];

class LokalsShell extends ConsumerWidget {
  const LokalsShell({
    super.key,
    required this.title,
    required this.child,
    this.showBack = false,
    this.actions,
    this.floatingActionButton,
  });

  final String title;
  final Widget child;
  final bool showBack;
  final List<Widget>? actions;
  final Widget? floatingActionButton;

  int _currentIndex(BuildContext context) {
    final path = GoRouterState.of(context).matchedLocation;
    if (path.startsWith('/services') || path.startsWith('/book')) return 1;
    if (path.startsWith('/store') || path.startsWith('/directory') || path.startsWith('/events') || path.startsWith('/marketplace') || path.startsWith('/more')) return 2;
    if (path.startsWith('/activity') || path.startsWith('/alerts') || path.startsWith('/news')) return 3;
    if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/my-bookings') || path.startsWith('/my-tickets') || path.startsWith('/saved-items')) return 4;
    return 0;
  }

  String _formatRole(String role) {
    return role
        .split('_')
        .map((item) => item.isEmpty ? item : '${item[0].toUpperCase()}${item.substring(1)}')
        .join(' ');
  }

  Future<void> _openProfileMenu(BuildContext context, WidgetRef ref) async {
    final auth = ref.read(authControllerProvider);
    final user = auth.user;
    final unread = ref.read(notificationsProvider).asData?.value.where((item) => item.readAt == null).length ?? 0;

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 48,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.purpleSoft,
                      child: Text(
                        user?.name.characters.first.toUpperCase() ?? 'L',
                        style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.name ?? 'LOKALS',
                            style: AppTextStyles.h3.copyWith(fontSize: 18),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${user?.defaultArea ?? user?.location ?? 'Windhoek'}, ${user?.defaultTown ?? 'Namibia'}',
                            style: AppTextStyles.bodyMuted,
                          ),
                        ],
                      ),
                    ),
                    if (unread > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '$unread unread',
                          style: const TextStyle(
                            color: AppColors.danger,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 18),
                if ((user?.roles.length ?? 0) > 1) ...[
                  const Text(
                    'Switch role',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.mutedText,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: user!.roles
                        .map(
                          (role) => ActionChip(
                            label: Text(_formatRole(role)),
                          backgroundColor: role == user.currentRole
                                ? AppColors.primaryPurple
                                : AppColors.softBackground,
                            labelStyle: TextStyle(
                              color: role == user.currentRole
                                  ? Colors.white
                                  : AppColors.deepCharcoal,
                              fontWeight: FontWeight.w700,
                            ),
                            onPressed: auth.isLoading
                                ? null
                                : () async {
                                    await ref.read(authControllerProvider.notifier).switchRole(role);
                                    if (!context.mounted) return;
                                    Navigator.of(context).pop();
                                  },
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 18),
                ],
                ...[
                  ('/profile', 'Profile', Icons.person_outline_rounded),
                  ('/activity', 'Activity', Icons.notifications_active_outlined),
                  ('/my-bookings', 'Bookings', Icons.book_online_outlined),
                  ('/my-tickets', 'Tickets', Icons.confirmation_number_outlined),
                  ('/saved-items', 'Saved', Icons.bookmark_outline_rounded),
                  ('/settings', 'Settings', Icons.settings_outlined),
                ].map(
                  (item) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(item.$3, color: AppColors.primaryPurple),
                    title: Text(item.$2),
                    onTap: () {
                      Navigator.of(context).pop();
                      context.go(item.$1);
                    },
                  ),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.logout_rounded, color: AppColors.danger),
                  title: const Text('Logout'),
                  onTap: () async {
                    Navigator.of(context).pop();
                    await ref.read(authControllerProvider.notifier).logout();
                    if (!context.mounted) return;
                    context.go('/login');
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _openLocationSelector(
    BuildContext context,
    WidgetRef ref, {
    required UserModel? user,
    required UserPreferenceModel? preferences,
  }) async {
    final currentTown = preferences?.defaultTown ?? user?.defaultTown ?? user?.location ?? 'Windhoek';
    final currentArea = preferences?.defaultArea ?? user?.defaultArea ?? 'Katutura';
    final repository = ref.read(discoveryRepositoryProvider);

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 48,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text('Choose your area', style: AppTextStyles.h3.copyWith(fontSize: 20)),
                const SizedBox(height: 6),
                Text(
                  'Keep Home focused on the services, updates, events, and products closest to you.',
                  style: AppTextStyles.bodyMuted,
                ),
                const SizedBox(height: 18),
                ..._locationOptions.map((option) {
                  final isSelected = option.town == currentTown && option.area == currentArea;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () async {
                        await repository.updatePreferences(
                          defaultTown: option.town,
                          defaultArea: option.area,
                          serviceRadius: user?.serviceRadius ?? 10,
                          notificationPreferences: preferences?.notificationPreferences.map(
                                (key, value) => MapEntry(key, value == true),
                              ) ??
                              const {},
                        );
                        ref.invalidate(preferencesProvider);
                        if (!context.mounted) return;
                        Navigator.of(context).pop();
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.purpleSoftAlt : AppColors.surfaceWhite,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.primaryPurple : AppColors.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.primaryPurple : AppColors.softBackground,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                Icons.place_outlined,
                                color: isSelected ? Colors.white : AppColors.primaryPurple,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${option.area}, ${option.town}', style: AppTextStyles.h4),
                                  const SizedBox(height: 2),
                                  Text(
                                    isSelected ? 'Currently showing Home for this area' : 'Switch Home to this local area',
                                    style: AppTextStyles.caption,
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              const Icon(Icons.check_circle_rounded, color: AppColors.primaryPurple),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final preferences = ref.watch(preferencesProvider).asData?.value;
    final notifications = ref.watch(notificationsProvider).asData?.value ?? const [];
    final unreadCount = notifications.where((item) => item.readAt == null).length;
    final canShowBrand = !showBack;
    final isHome = title == 'LOKALS';
    final currentTown = preferences?.defaultTown ?? user?.defaultTown ?? user?.location ?? 'Windhoek';
    final currentArea = preferences?.defaultArea ?? user?.defaultArea;
    final locationLabel = [currentArea, currentTown].whereType<String>().where((item) => item.isNotEmpty).join(', ');

    return Scaffold(
      extendBody: true,
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        titleSpacing: showBack ? 0 : 20,
        title: isHome
            ? InkWell(
                borderRadius: BorderRadius.circular(999),
                onTap: () => _openLocationSelector(
                  context,
                  ref,
                  user: user,
                  preferences: preferences,
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.place_outlined, size: 16, color: AppColors.deepCharcoal),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          currentTown,
                          style: AppTextStyles.h4,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.expand_more_rounded, size: 18, color: AppColors.mutedText),
                    ],
                  ),
                ),
              )
            : canShowBrand
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Image.asset('assets/brand/lokals-logo.png', height: 28),
                    ],
                  )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(title, style: AppTextStyles.h3),
                  if (locationLabel.isNotEmpty)
                    Text(
                      locationLabel,
                      style: AppTextStyles.caption,
                    ),
                ],
              ),
        actions: [
          NotificationBell(count: unreadCount, route: '/notifications'),
          IconButton(
            tooltip: 'Profile menu',
            onPressed: user == null ? () => context.go('/login') : () => _openProfileMenu(context, ref),
            icon: CircleAvatar(
              radius: 15,
              backgroundColor: AppColors.purpleSoft,
              child: Text(
                user?.name.characters.first.toUpperCase() ?? 'L',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.primaryPurple,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          ...?actions,
        ],
        leading: showBack
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new),
                onPressed: () => context.pop(),
              )
            : null,
      ),
      body: SafeArea(
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.hero)),
          ),
          child: child,
        ),
      ),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: MobileBottomNav(currentIndex: _currentIndex(context)),
    );
  }
}
