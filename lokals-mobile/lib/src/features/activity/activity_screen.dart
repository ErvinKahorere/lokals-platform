import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/experience/activity_timeline.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class ActivityScreen extends ConsumerWidget {
  const ActivityScreen({super.key});

  static IconData _iconForType(String type) {
    switch (type) {
      case 'booking':
        return Icons.event_available_outlined;
      case 'ticket':
        return Icons.confirmation_number_outlined;
      case 'delivery':
        return Icons.local_shipping_outlined;
      case 'ride':
        return Icons.local_taxi_outlined;
      case 'application':
        return Icons.work_outline_rounded;
      case 'report':
        return Icons.report_problem_outlined;
      case 'alert':
        return Icons.notifications_active_outlined;
      case 'saved':
        return Icons.bookmark_outline_rounded;
      case 'sos':
        return Icons.warning_amber_rounded;
      default:
        return Icons.notifications_none_rounded;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activityFeed = ref.watch(activityFeedProvider);

    return LokalsShell(
      title: 'Activity',
      showBack: true,
      child: activityFeed.when(
        data: (payload) {
          final items = (payload['data'] as List<dynamic>? ?? const [])
              .map((item) => Map<String, dynamic>.from(item as Map))
              .toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const SectionTitle(
                title: 'Activity timeline',
                subtitle:
                    'Bookings, tickets, deliveries, rides, alerts, and SOS updates in one low-data feed.',
              ),
              const SizedBox(height: 16),
              if (items.isEmpty)
                const EmptyStateView(
                  title: 'No activity yet.',
                  body:
                      'Your bookings, tickets, deliveries, rides, alerts, and saved items will appear here.',
                )
              else
                ActivityTimeline(
                  items: items.take(18).map((item) {
                    final type = item['type']?.toString() ?? 'activity';
                    final status = item['status']?.toString() ?? type;
                    final route = item['route']?.toString();
                    return ActivityTimelineItem(
                      icon: _iconForType(type),
                      title: item['title']?.toString() ?? 'Activity update',
                      body: item['body']?.toString() ?? 'Open for details.',
                      time: item['timestamp']?.toString() ?? 'Recent',
                      status: status,
                      onTap: route == null || route.isEmpty
                          ? null
                          : () => context.go(route),
                    );
                  }).toList(),
                ),
            ],
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            SectionTitle(
              title: 'Activity timeline',
              subtitle:
                  'Bookings, tickets, deliveries, rides, alerts, and SOS updates in one low-data feed.',
            ),
            SizedBox(height: 16),
            LoadingSkeleton(height: 120),
            SizedBox(height: 12),
            LoadingSkeleton(height: 120),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Activity unavailable',
              body: 'Please try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(activityFeedProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
