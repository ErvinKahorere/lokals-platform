import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../discovery/discovery_repository.dart';

class EventReminderButton extends ConsumerStatefulWidget {
  const EventReminderButton({super.key, required this.eventId, required this.startsAt});

  final int eventId;
  final String? startsAt;

  @override
  ConsumerState<EventReminderButton> createState() => _EventReminderButtonState();
}

class _EventReminderButtonState extends ConsumerState<EventReminderButton> {
  bool _busy = false;
  bool _done = false;

  @override
  Widget build(BuildContext context) {
    return AppButton(
      label: _done ? 'Reminder set' : 'Remind me',
      expanded: false,
      variant: AppButtonVariant.secondary,
      isLoading: _busy,
      onPressed: widget.startsAt == null || _done
          ? null
          : () async {
              final messenger = ScaffoldMessenger.of(context);
              setState(() => _busy = true);
              try {
                final startsAt = DateTime.parse(widget.startsAt!).toUtc();
                final remindAt = startsAt.subtract(const Duration(hours: 6)).toIso8601String();
                await ref.read(discoveryRepositoryProvider).createEventReminder(
                  eventId: widget.eventId,
                  remindAt: remindAt,
                );
                if (mounted) {
                  setState(() => _done = true);
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Reminder set')),
                  );
                }
              } finally {
                if (mounted) setState(() => _busy = false);
              }
            },
    );
  }
}
