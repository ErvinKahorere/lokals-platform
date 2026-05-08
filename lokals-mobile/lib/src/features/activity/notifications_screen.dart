import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../core/models.dart';
import 'notification_item.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  String _groupLabel(String? createdAt) {
    if (createdAt == null || createdAt.isEmpty) return 'Earlier';
    final now = DateTime.now();
    final created = DateTime.tryParse(createdAt);
    if (created == null) return 'Earlier';
    return created.year == now.year && created.month == now.month && created.day == now.day ? 'Today' : 'Earlier';
  }

  String _targetRoute(NotificationItemModel item) {
    if ((item.target?.externalUrl ?? '').isNotEmpty) {
      final url = Uri.encodeComponent(item.target!.externalUrl!);
      final source = Uri.encodeComponent(item.target?.sourceName ?? item.title);
      final title = Uri.encodeComponent(item.target?.title ?? item.title);
      return '/article?url=$url&source=$source&title=$title';
    }

    final href = item.target?.href;
    if (href != null && href.isNotEmpty) {
      return href;
    }

    switch (item.type) {
      case 'booking_update':
        return '/my-bookings';
      case 'job_update':
        return '/jobs';
      case 'alert_from_followed':
        return '/alerts';
      case 'news_update':
        return '/news';
      case 'event_reminder':
      case 'ticket_update':
        return '/my-tickets';
      case 'delivery_update':
        return '/delivery';
      case 'ride_update':
        return '/ride';
      default:
        return '/activity';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);

    return LokalsShell(
      title: 'Notifications',
      showBack: true,
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
                            onTap: () => context.go(_targetRoute(item)),
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
