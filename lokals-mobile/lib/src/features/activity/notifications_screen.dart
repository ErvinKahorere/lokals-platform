import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import 'notification_item.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../notifications/notification_routing.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  String _groupLabel(String? createdAt) {
    if (createdAt == null || createdAt.isEmpty) return 'Earlier';
    final now = DateTime.now();
    final created = DateTime.tryParse(createdAt);
    if (created == null) return 'Earlier';
    return created.year == now.year && created.month == now.month && created.day == now.day ? 'Today' : 'Earlier';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);

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
                  label:
                      '${notifications.asData?.value.where((item) => item.readAt == null).length ?? 0} unread',
                  tone: AppBadgeTone.brand,
                ),
              ],
            ),
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
