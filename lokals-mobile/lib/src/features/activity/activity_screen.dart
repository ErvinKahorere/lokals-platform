import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../shared/widgets/experience/activity_timeline.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../notifications/notification_routing.dart';

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
      case 'job_application':
        return Icons.work_outline_rounded;
      case 'report':
        return Icons.report_problem_outlined;
      case 'alert':
        return Icons.notifications_active_outlined;
      case 'saved':
      case 'saved_item':
        return Icons.bookmark_outline_rounded;
      case 'sos':
        return Icons.warning_amber_rounded;
      case 'notification':
        return Icons.notifications_none_rounded;
      default:
        return Icons.notifications_none_rounded;
    }
  }

  String _groupLabel(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) return 'Earlier';
    final parsed = DateTime.tryParse(timestamp);
    if (parsed == null) return 'Earlier';
    final now = DateTime.now();
    return parsed.year == now.year && parsed.month == now.month && parsed.day == now.day ? 'Today' : 'Earlier';
  }

  String _formatSummaryLabel(String value) {
    return value.replaceAll('_', ' ');
  }

  String _formatTime(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) return 'Recent';
    final parsed = DateTime.tryParse(timestamp);
    if (parsed == null) return 'Recent';
    return DateFormat('EEE, d MMM • HH:mm').format(parsed.toLocal());
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;
    final scrollBottomPadding = safeBottom + 88;
    final activityFeed = ref.watch(activityFeedProvider);

    return LokalsShell(
      title: 'Activity',
      showBack: true,
      bodyBottomInset: 10,
      child: activityFeed.when(
        data: (payload) {
          final items = (payload['data'] as List<dynamic>? ?? const [])
              .map((item) => Map<String, dynamic>.from(item as Map))
              .toList();
          final summary = Map<String, dynamic>.from(payload['summary'] as Map? ?? const {});

          return ListView(
            padding: EdgeInsets.fromLTRB(20, 20, 20, scrollBottomPadding),
            children: [
              const SectionTitle(
                title: 'Activity timeline',
                subtitle:
                    'Bookings, tickets, deliveries, rides, alerts, and SOS updates in one low-data feed.',
              ),
              const SizedBox(height: 16),
              if (summary.isNotEmpty) ...[
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: summary.entries
                      .map(
                        (entry) => AppBadge(
                          label: '${_formatSummaryLabel(entry.key)}: ${entry.value}',
                          tone: AppBadgeTone.neutral,
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 16),
              ],
              if (items.isEmpty)
                const EmptyStateView(
                  title: 'No activity yet.',
                  body:
                      'Your bookings, tickets, deliveries, rides, alerts, and saved items will appear here.',
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (final group in ['Today', 'Earlier'])
                      if (items.where((item) => _groupLabel(item['timestamp']?.toString()) == group).isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Text(
                            group,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.black54),
                          ),
                        ),
                        ActivityTimeline(
                          items: items
                              .where((item) => _groupLabel(item['timestamp']?.toString()) == group)
                              .take(18)
                              .map((item) {
                                final type = item['type']?.toString() ?? 'activity';
                                final status = item['status']?.toString() ?? type;
                                final route = item['route']?.toString();
                                return ActivityTimelineItem(
                                  icon: _iconForType(type),
                                  title: item['title']?.toString() ?? 'Activity update',
                                  body: item['body']?.toString() ?? 'Open for details.',
                                  time: _formatTime(item['timestamp']?.toString()),
                                  status: status,
                                  onTap: route == null || route.isEmpty
                                      ? null
                                      : () => context.go(normalizeInAppRoute(route)),
                                );
                              }).toList(),
                        ),
                      ],
                  ],
                ),
            ],
          );
        },
        loading: () => ListView(
          padding: EdgeInsets.fromLTRB(20, 20, 20, scrollBottomPadding),
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
