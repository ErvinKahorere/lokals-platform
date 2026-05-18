import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

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
    final repository = ref.read(discoveryRepositoryProvider);

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

          final startsAt = ticket.event?.startsAt == null ? null : DateTime.tryParse(ticket.event!.startsAt!);

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ticket.event?.title ?? 'Event ticket',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      ticket.status,
                      style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF166534)),
                    ),
                    const SizedBox(height: 12),
                    Text('Code: ${ticket.ticketCode}', style: const TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text(ticket.event?.locationLabel ?? ticket.event?.location ?? 'Location TBC'),
                    if (startsAt != null) ...[
                      const SizedBox(height: 8),
                      Text(DateFormat('EEE, d MMM yyyy | HH:mm').format(startsAt.toLocal())),
                    ],
                    const SizedBox(height: 8),
                    Text(ticket.holderName ?? 'Ticket holder'),
                    if (ticket.holderPhone != null) ...[
                      const SizedBox(height: 4),
                      Text(ticket.holderPhone!),
                    ],
                    if (ticket.ticketType != null) ...[
                      const SizedBox(height: 8),
                      Text('Ticket type: ${ticket.ticketType!.name}'),
                    ],
                    if (ticket.qrCodePayload != null) ...[
                      const SizedBox(height: 12),
                      const Text('Present this ticket code at check-in. QR check-in support will use the same access record when venue scanners are enabled.'),
                    ],
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        AddToCalendarButton(icsUrl: ticket.event?.calendar?.icsUrl),
                        if (ticket.status == 'reserved' || ticket.status == 'confirmed')
                          AppButton(
                            label: 'Cancel ticket',
                            expanded: false,
                            variant: AppButtonVariant.secondary,
                            onPressed: () async {
                              await repository.cancelEventTicket(ticket.id);
                              ref.invalidate(myTicketsProvider);
                              if (!context.mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Ticket cancelled.')),
                              );
                            },
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading ticket',
          message: 'Fetching your ticket code and event access details...',
        ),
        error: (error, _) => const Center(
          child: EmptyStateView(
            title: 'Ticket unavailable',
            body: 'We could not load this ticket right now.',
          ),
        ),
      ),
    );
  }
}
