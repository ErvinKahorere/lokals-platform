import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../core/models.dart';
import 'notification_item.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../notifications/notification_routing.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  String _activeFilter = 'all';

  static const _filters = [
    ('all', 'All'),
    ('orders', 'Orders'),
    ('rides', 'Rides'),
    ('hire', 'Hire'),
    ('marketplace', 'Market'),
    ('reports', 'Reports'),
    ('announcements', 'Alerts'),
  ];

  String _groupLabel(String? createdAt) {
    if (createdAt == null || createdAt.isEmpty) return 'Earlier';
    final now = DateTime.now();
    final created = DateTime.tryParse(createdAt);
    if (created == null) return 'Earlier';
    return created.year == now.year && created.month == now.month && created.day == now.day ? 'Today' : 'Earlier';
  }

  String _categoryFor(NotificationItemModel item) {
    final haystack = [
      item.type,
      item.targetType,
      item.title,
      item.body,
      item.target?.type,
    ].whereType<String>().join(' ').toLowerCase();

    if (haystack.contains('order')) return 'orders';
    if (haystack.contains('ride') || haystack.contains('driver')) return 'rides';
    if (haystack.contains('hire') || haystack.contains('rental')) return 'hire';
    if (haystack.contains('market') || haystack.contains('product') || haystack.contains('store')) return 'marketplace';
    if (haystack.contains('report') || haystack.contains('issue')) return 'reports';
    if (haystack.contains('announcement') || haystack.contains('alert') || haystack.contains('news')) return 'announcements';
    return 'all';
  }

  @override
  Widget build(BuildContext context) {
    final notifications = ref.watch(notificationsProvider);
    final allItems = notifications.asData?.value ?? const <NotificationItemModel>[];
    final unreadCount = allItems.where((item) => item.readAt == null).length;

    return LokalsShell(
      title: 'Notifications',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        children: [
          Row(
            children: [
              const Expanded(
                child: SectionTitle(
                  title: 'Notifications',
                  subtitle: 'Booking changes, followed alerts, reminders, and local updates.',
                ),
              ),
              AppButton(
                label: 'Mark all read',
                expanded: false,
                variant: AppButtonVariant.secondary,
                onPressed: () async {
                  await ref.read(discoveryRepositoryProvider).markAllNotificationsRead();
                  ref.invalidate(notificationsProvider);
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          AppCard(
            child: Row(
              children: [
                const Expanded(
                  child: SectionTitle(
                    title: 'Activity feed',
                    subtitle:
                        'Unread items stay easy to spot while bookings, alerts, and local updates stay grouped.',
                  ),
                ),
                AppBadge(
                  label: '$unreadCount unread',
                  tone: AppBadgeTone.brand,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final filter in _filters) ...[
                  ChoiceChip(
                    label: Text(
                      filter.$1 == 'all'
                          ? '${filter.$2} ${allItems.length}'
                          : '${filter.$2} ${allItems.where((item) => _categoryFor(item) == filter.$1).length}',
                    ),
                    selected: _activeFilter == filter.$1,
                    onSelected: (_) => setState(() => _activeFilter = filter.$1),
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          notifications.when(
            data: (items) {
              final visibleItems = _activeFilter == 'all'
                  ? items
                  : items.where((item) => _categoryFor(item) == _activeFilter).toList();

              if (items.isEmpty) {
                return const EmptyStateView(
                  title: 'No notifications yet.',
                  body: 'Booking updates, reminders, and followed alerts will appear here.',
                );
              }

              if (visibleItems.isEmpty) {
                return const EmptyStateView(
                  title: 'Nothing in this category yet.',
                  body: 'Switch filters or check back when this workflow has activity.',
                );
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final group in ['Today', 'Earlier'])
                    if (visibleItems.where((item) => _groupLabel(item.createdAt) == group).isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Text(
                          group,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.mutedText),
                        ),
                      ),
                      ...visibleItems.where((item) => _groupLabel(item.createdAt) == group).map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: NotificationItemCard(
                            item: item,
                            onTap: () async {
                              if (item.readAt == null) {
                                await ref.read(discoveryRepositoryProvider).markNotificationRead(item.id);
                                ref.invalidate(notificationsProvider);
                              }
                              if (context.mounted) {
                                context.go(routeForNotification(item));
                              }
                            },
                          ),
                        ),
                      ),
                    ],
                ],
              );
            },
            loading: () => const LoadingSkeleton(height: 140),
            error: (error, _) => const EmptyStateView(
              title: 'No notifications right now.',
              body: 'Try again in a moment.',
            ),
          ),
        ],
      ),
    );
  }
}
