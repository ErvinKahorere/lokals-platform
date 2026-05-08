import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'add_to_calendar_button.dart';

class TicketDetailsScreen extends ConsumerWidget {
  const TicketDetailsScreen({super.key, required this.ticketId});

  final String ticketId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tickets = ref.watch(myTicketsProvider);

    return LokalsShell(
      title: 'Ticket details',
      showBack: true,
      child: tickets.when(
        data: (items) {
          final matches = items.where((item) => item.id.toString() == ticketId);
          final ticket = matches.isEmpty ? null : matches.first;
          if (ticket == null) {
            return const Center(child: Text('Ticket not found.'));
          }
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ticket.event?.title ?? 'Event ticket', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text(ticket.status, style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF166534))),
                    const SizedBox(height: 12),
                    Text('Code: ${ticket.ticketCode}', style: const TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text(ticket.event?.locationLabel ?? ticket.event?.location ?? 'Location TBC'),
                    const SizedBox(height: 8),
                    Text(ticket.holderName ?? 'Ticket holder'),
                    if (ticket.holderPhone != null) ...[
                      const SizedBox(height: 4),
                      Text(ticket.holderPhone!),
                    ],
                    const SizedBox(height: 16),
                    AddToCalendarButton(icsUrl: ticket.event?.calendar?.icsUrl),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Ticket unavailable: $error')),
      ),
    );
  }
}
