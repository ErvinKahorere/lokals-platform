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
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  bool _markingAllRead = false;

  String _groupLabel(String? createdAt) {
    if (createdAt == null || createdAt.isEmpty) return 'Earlier';
    final now = DateTime.now();
    final created = DateTime.tryParse(createdAt);
    if (created == null) return 'Earlier';
    return created.year == now.year && created.month == now.month && created.day == now.day ? 'Today' : 'Earlier';
  }

  Future<void> _refresh() async {
    ref.invalidate(notificationsProvider);
    await ref.read(notificationsProvider.future);
  }

  Future<void> _markAllRead() async {
    if (_markingAllRead) return;
    setState(() => _markingAllRead = true);
    try {
      await ref.read(discoveryRepositoryProvider).markAllNotificationsRead();
      ref.invalidate(notificationsProvider);
    } finally {
      if (mounted) {
        setState(() => _markingAllRead = false);
      }
    }
  }

  Future<void> _openNotification(NotificationItemModel item) async {
    if (item.readAt == null) {
      try {
        await ref.read(discoveryRepositoryProvider).markNotificationRead(item.id);
      } catch (_) {
        // Keep navigation responsive even if read state syncing fails.
      } finally {
        ref.invalidate(notificationsProvider);
      }
    }

    if (!mounted) return;
    context.go(routeForNotification(item));
  }

  @override
  Widget build(BuildContext context) {
    final notifications = ref.watch(notificationsProvider);

    return LokalsShell(
      title: 'Notifications',
      showBack: true,
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(20),
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
                  label: _markingAllRead ? 'Processing...' : 'Mark all read',
                  expanded: false,
                  variant: AppButtonVariant.secondary,
                  onPressed: _markingAllRead ? null : _markAllRead,
                ),
              ],
            ),
            const SizedBox(height: 16),
            notifications.when(
              data: (items) {
                if (items.isEmpty) {
                  return const EmptyStateView(
                    title: 'No notifications yet.',
                    body: 'Booking updates, reminders, and followed alerts will appear here.',
                  );
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (final group in ['Today', 'Earlier'])
                      if (items.where((item) => _groupLabel(item.createdAt) == group).isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Text(
                            group,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.mutedText),
                          ),
                        ),
                        ...items.where((item) => _groupLabel(item.createdAt) == group).map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: NotificationItemCard(
                              item: item,
                              onTap: () => _openNotification(item),
                              onMarkRead: item.readAt == null
                                  ? () async {
                                      await ref.read(discoveryRepositoryProvider).markNotificationRead(item.id);
                                      ref.invalidate(notificationsProvider);
                                    }
                                  : null,
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
      ),
    );
  }
}
