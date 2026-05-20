import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_text_styles.dart';
import '../config/app_config.dart';
import '../core/role_routing.dart';
import '../core/models.dart';
import '../../shared/widgets/experience/notification_bell.dart';
import '../../shared/widgets/mobile_bottom_nav.dart';
import '../features/auth/auth_controller.dart';
import '../features/discovery/discovery_repository.dart';

final _locationOptions = AppConfig.okahandjaAreas
    .map((area) => (town: AppConfig.pilotTown, area: area))
    .toList(growable: false);

class LokalsShell extends ConsumerWidget {
  const LokalsShell({
    super.key,
    required this.title,
    required this.child,
    this.showBack = false,
    this.actions,
    this.floatingActionButton,
    this.bodyBottomInset,
    this.showAppBar = true,
  });

  final String title;
  final Widget child;
  final bool showBack;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final double? bodyBottomInset;
  final bool showAppBar;

  int _currentIndex(BuildContext context) {
    final path = GoRouterState.of(context).matchedLocation;
    if (path == '/' ||
        path.startsWith('/home') ||
        path.startsWith('/search') ||
        path.startsWith('/more') ||
        path.startsWith('/okahandja')) {
      return 0;
    }
    if (path.startsWith('/services') ||
        path.startsWith('/book') ||
        path.startsWith('/workers') ||
        path.startsWith('/directory')) {
      return 1;
    }
    if (path.startsWith('/store') ||
        path.startsWith('/marketplace') ||
        path.startsWith('/hire') ||
        path.startsWith('/accommodation')) {
      return 2;
    }
    if (path.startsWith('/activity') ||
        path.startsWith('/alerts') ||
        path.startsWith('/news') ||
        path.startsWith('/notifications') ||
        path.startsWith('/events') ||
        path.startsWith('/jobs') ||
        path.startsWith('/delivery') ||
        path.startsWith('/ride') ||
        path.startsWith('/sos') ||
        path.startsWith('/my-reports') ||
        path.startsWith('/reports')) {
      return 3;
    }
    if (path.startsWith('/profile') ||
        path.startsWith('/settings') ||
        path.startsWith('/my-bookings') ||
        path.startsWith('/my-tickets') ||
        path.startsWith('/saved-items') ||
        path.startsWith('/dashboard') ||
        path.startsWith('/provider-bookings')) {
      return 4;
    }
    return 0;
  }

  String _formatRole(String role) {
    if (role == 'citizen') {
      return 'Resident';
    }
    return role
        .split('_')
        .map(
          (item) => item.isEmpty
              ? item
              : '${item[0].toUpperCase()}${item.substring(1)}',
        )
        .join(' ');
  }

  bool _isDashboardRoute(BuildContext context) {
    return GoRouterState.of(context).matchedLocation.startsWith('/dashboard');
  }

  Widget _buildRoleChip(String label, {bool inverted = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: inverted
            ? Colors.white.withValues(alpha: 0.16)
            : AppColors.purpleSoftAlt,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: inverted ? Colors.white : AppColors.primaryPurple,
          fontSize: 11,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Future<void> _openProfileMenu(BuildContext context, WidgetRef ref) async {
    final auth = ref.read(authControllerProvider);
    final user = auth.user;
    final unread =
        ref
            .read(notificationsProvider)
            .asData
            ?.value
            .where((item) => item.readAt == null)
            .length ??
        0;

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.9,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: SafeArea(
            top: false,
            child: SingleChildScrollView(
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
                          style: AppTextStyles.h4.copyWith(
                            color: AppColors.primaryPurple,
                          ),
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
                              '${user?.defaultArea ?? user?.location ?? AppConfig.pilotTown}, ${user?.defaultTown ?? 'Namibia'}',
                              style: AppTextStyles.bodyMuted,
                            ),
                            const SizedBox(height: 8),
                            _buildRoleChip(
                              _formatRole(
                                user?.currentRole ??
                                    ((user?.roles.isNotEmpty ?? false)
                                        ? user!.roles.first
                                        : 'citizen'),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (unread > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
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
                                      final nextUser = await ref
                                          .read(authControllerProvider.notifier)
                                          .switchRole(role);
                                      if (!context.mounted) return;
                                      Navigator.of(context).pop();
                                      context.go(
                                        nextUser == null
                                            ? '/dashboard'
                                            : roleHomePath(
                                                nextUser.currentRole ?? role,
                                              ),
                                      );
                                    },
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 18),
                  ],
                  ...[
                    ('/profile', 'Profile', Icons.person_outline_rounded),
                    (
                      '/notifications',
                      'Notifications',
                      Icons.notifications_none_rounded,
                    ),
                    (
                      '/saved-items',
                      'Saved Items',
                      Icons.bookmark_outline_rounded,
                    ),
                    (
                      '/following-organizations',
                      'Followed Organizations',
                      Icons.groups_2_outlined,
                    ),
                    (
                      '/activity',
                      'Activity',
                      Icons.notifications_active_outlined,
                    ),
                    ('/my-bookings', 'My Bookings', Icons.book_online_outlined),
                    (
                      '/hire/bookings',
                      'Hire Bookings',
                      Icons.warehouse_outlined,
                    ),
                    ('/orders', 'My Orders', Icons.receipt_long_outlined),
                    (
                      '/my-tickets',
                      'My Tickets',
                      Icons.confirmation_number_outlined,
                    ),
                    (
                      roleHomePath(
                        user?.currentRole ??
                            ((user?.roles.isNotEmpty ?? false)
                                ? user!.roles.first
                                : null),
                      ),
                      'Dashboard',
                      Icons.dashboard_customize_outlined,
                    ),
                    ('/settings', 'Settings', Icons.settings_outlined),
                    (
                      '/support',
                      'Help & Support',
                      Icons.support_agent_outlined,
                    ),
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
                    leading: const Icon(
                      Icons.logout_rounded,
                      color: AppColors.danger,
                    ),
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
    final currentTown =
        preferences?.defaultTown ?? user?.defaultTown ?? AppConfig.pilotTown;
    final currentArea =
        preferences?.defaultArea ??
        user?.defaultArea ??
        AppConfig.okahandjaAreas.first;
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
                Text(
                  'Choose your area',
                  style: AppTextStyles.h3.copyWith(fontSize: 20),
                ),
                const SizedBox(height: 6),
                Text(
                  '${AppConfig.pilotLocationMessage} Keep Home focused on the services, updates, and opportunities closest to you.',
                  style: AppTextStyles.bodyMuted,
                ),
                const SizedBox(height: 18),
                ..._locationOptions.map((option) {
                  final isSelected =
                      option.town == currentTown && option.area == currentArea;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () async {
                        await repository.updatePreferences(
                          defaultTown: option.town,
                          defaultArea: option.area,
                          serviceRadius: user?.serviceRadius ?? 10,
                          notificationPreferences:
                              preferences?.notificationPreferences.map(
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
                          color: isSelected
                              ? AppColors.purpleSoftAlt
                              : AppColors.surfaceWhite,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primaryPurple
                                : AppColors.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primaryPurple
                                    : AppColors.softBackground,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                Icons.place_outlined,
                                color: isSelected
                                    ? Colors.white
                                    : AppColors.primaryPurple,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${option.area}, ${option.town}',
                                    style: AppTextStyles.h4,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    isSelected
                                        ? 'Currently showing Home for this area'
                                        : 'Switch Home to this local area',
                                    style: AppTextStyles.caption,
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              const Icon(
                                Icons.check_circle_rounded,
                                color: AppColors.primaryPurple,
                              ),
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
    final notifications =
        ref.watch(notificationsProvider).asData?.value ?? const [];
    final unreadCount = notifications
        .where((item) => item.readAt == null)
        .length;
    final isHome = title == 'LOKALS';
    final isDashboard = _isDashboardRoute(context);
    final isGuest = user == null;
    final currentTown =
        preferences?.defaultTown ?? user?.defaultTown ?? AppConfig.pilotTown;
    final currentArea = preferences?.defaultArea ?? user?.defaultArea;
    final locationLabel = [
      currentArea,
      currentTown,
    ].whereType<String>().where((item) => item.isNotEmpty).join(', ');
    final activeRole =
        user?.currentRole ??
        ((user?.roles.isNotEmpty ?? false) ? user!.roles.first : 'citizen');
    final greetingName = user?.name.split(' ').first ?? 'there';
    final headerHeight = isHome ? 86.0 : 74.0;
    final bottomNavInset =
        bodyBottomInset ??
        (MediaQuery.of(context).padding.bottom +
            kMobileBottomNavHeight +
            kMobileBottomNavBottomSpacing +
            kMobileBottomNavExtraClearance);
    final canPop = Navigator.of(context).canPop();
    final titleWidget = isHome
        ? (isGuest
              ? Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset('assets/brand/lokals-logo.png', height: 28),
                    const SizedBox(width: 10),
                    _buildRoleChip(currentTown),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Hello, $greetingName',
                      style: AppTextStyles.bodyMuted.copyWith(
                        color: AppColors.mutedText,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      currentArea == null || currentArea.isEmpty
                          ? currentTown
                          : '$currentArea, $currentTown',
                      style: AppTextStyles.h3,
                    ),
                    const SizedBox(height: 6),
                    _buildRoleChip(_formatRole(activeRole)),
                  ],
                ))
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(title, style: AppTextStyles.h3),
              const SizedBox(height: 4),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  if (isDashboard) _buildRoleChip(_formatRole(activeRole)),
                  if (locationLabel.isNotEmpty)
                    Text(locationLabel, style: AppTextStyles.caption),
                ],
              ),
            ],
          );

    return Scaffold(
      extendBody: true,
      appBar: showAppBar
          ? AppBar(
              toolbarHeight: headerHeight,
              backgroundColor: Theme.of(context).scaffoldBackgroundColor,
              titleSpacing: showBack ? 0 : 20,
              title: isHome && !isGuest
                  ? InkWell(
                      borderRadius: BorderRadius.circular(999),
                      onTap: () => _openLocationSelector(
                        context,
                        ref,
                        user: user,
                        preferences: preferences,
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: titleWidget,
                      ),
                    )
                  : titleWidget,
              actions: [
                if (user != null) ...[
                  NotificationBell(count: unreadCount, route: '/activity'),
                  Padding(
                    padding: const EdgeInsets.only(left: 4),
                    child: IconButton(
                      tooltip: 'Profile menu',
                      onPressed: () => _openProfileMenu(context, ref),
                      icon: CircleAvatar(
                        radius: 15,
                        backgroundColor: AppColors.purpleSoft,
                        child: Text(
                          user.name.characters.first.toUpperCase(),
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.primaryPurple,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ),
                ] else
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: TextButton(
                      onPressed: () => context.go('/login'),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primaryPurple,
                        textStyle: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      child: const Text('Login'),
                    ),
                  ),
                ...?actions,
              ],
              leading: showBack
                  ? IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new),
                      onPressed: () {
                        if (canPop) {
                          context.pop();
                        } else {
                          context.go(
                            isGuest ? '/home' : roleHomePath(activeRole),
                          );
                        }
                      },
                    )
                  : null,
            )
          : null,
      body: SafeArea(
        top: !showAppBar,
        child: Padding(
          padding: EdgeInsets.only(bottom: bottomNavInset),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppRadius.hero),
              ),
            ),
            child: child,
          ),
        ),
      ),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: MobileBottomNav(
        currentIndex: _currentIndex(context),
      ),
    );
  }
}
