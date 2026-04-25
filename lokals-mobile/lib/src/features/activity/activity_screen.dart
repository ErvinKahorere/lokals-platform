import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/experience/activity_timeline.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../bookings/bookings_repository.dart';
import '../discovery/discovery_repository.dart';

class ActivityScreen extends ConsumerWidget {
  const ActivityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookings = ref.watch(myBookingsProvider);
    final jobs = ref.watch(jobsProvider);
    final sos = ref.watch(sosFeedProvider);
    final alertsFeed = ref.watch(alertsFeedProvider);

    return LokalsShell(
      title: 'Activity',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Activity timeline',
            subtitle: 'Bookings, jobs, alerts, and SOS updates in one low-data feed.',
          ),
          const SizedBox(height: 16),
          bookings.when(
            data: (items) => ActivityTimeline(
              items: [
                ...items.take(3).map(
                  (item) => ActivityTimelineItem(
                    icon: Icons.event_available_outlined,
                    title: item.serviceName ?? 'Booking update',
                    body: '${item.providerName ?? 'Provider'} • ${item.bookingDate} at ${item.startTime}',
                    time: 'Recent',
                    status: item.status,
                  ),
                ),
              ],
            ),
            loading: () => const LoadingSkeleton(height: 120),
            error: (error, _) => Text('Activity unavailable: $error'),
          ),
          const SizedBox(height: 12),
          jobs.when(
            data: (items) => ActivityTimeline(
              items: items.take(2).map(
                (item) => ActivityTimelineItem(
                  icon: Icons.work_outline_rounded,
                  title: item.title,
                  body: item.description,
                  time: 'Today',
                  status: 'job',
                ),
              ).toList(),
            ),
            loading: () => const LoadingSkeleton(height: 120),
            error: (error, _) => Text('Jobs unavailable: $error'),
          ),
          const SizedBox(height: 12),
          sos.when(
            data: (items) => ActivityTimeline(
              items: items.take(1).map(
                (item) => ActivityTimelineItem(
                  icon: Icons.warning_amber_rounded,
                  title: 'SOS history',
                  body: item.message,
                  time: 'Recent',
                  status: 'sos',
                ),
              ).toList(),
            ),
            loading: () => const SizedBox.shrink(),
            error: (error, _) => Text('SOS unavailable: $error'),
          ),
          const SizedBox(height: 12),
          alertsFeed.when(
            data: (items) => ActivityTimeline(
              items: items.take(3).map(
                (item) => ActivityTimelineItem(
                  icon: Icons.notifications_active_outlined,
                  title: item.title,
                  body: item.body,
                  time: item.timestamp ?? 'Recent',
                  status: item.severity ?? 'alert',
                ),
              ).toList(),
            ),
            loading: () => const SizedBox.shrink(),
            error: (error, _) => Text('Alerts unavailable: $error'),
          ),
        ],
      ),
    );
  }
}
