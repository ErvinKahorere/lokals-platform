import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class EventCalendarScreen extends ConsumerWidget {
  const EventCalendarScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final calendar = ref.watch(eventCalendarProvider);

    return LokalsShell(
      title: 'Event calendar',
      child: calendar.when(
        data: (groups) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const SectionTitle(
              title: 'Calendar view',
              subtitle: 'Upcoming events grouped by date for easy planning.',
            ),
            const SizedBox(height: 16),
            ...groups.map((group) {
              final events = (group['events'] as List<dynamic>? ?? const [])
                  .map((item) => EventModel.fromJson(item as Map<String, dynamic>))
                  .toList();
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(DateFormat('EEEE, d MMMM').format(DateTime.parse(group['date'].toString()))),
                      const SizedBox(height: 12),
                      ...events.map((event) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(event.title),
                        subtitle: Text(event.locationLabel ?? event.location ?? 'Location TBC'),
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () => context.push('/events/${event.id}'),
                      )),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Calendar unavailable: $error')),
      ),
    );
  }
}
