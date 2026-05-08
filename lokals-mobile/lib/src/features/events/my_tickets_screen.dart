import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'ticket_card.dart';

class MyTicketsScreen extends ConsumerStatefulWidget {
  const MyTicketsScreen({super.key});

  @override
  ConsumerState<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends ConsumerState<MyTicketsScreen> {
  String _tab = 'upcoming';

  List<EventTicketModel> _filterTickets(List<EventTicketModel> items) {
    final now = DateTime.now();
    return items.where((ticket) {
      if (_tab == 'cancelled') return ticket.status == 'cancelled';
      final startsAt = ticket.event?.startsAt == null ? null : DateTime.tryParse(ticket.event!.startsAt!);
      final isPast = startsAt != null && startsAt.isBefore(now);
      if (_tab == 'past') return ticket.status != 'cancelled' && isPast;
      return ticket.status != 'cancelled' && !isPast;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final tickets = ref.watch(myTicketsProvider);

    return LokalsShell(
      title: 'My tickets',
      child: tickets.when(
        data: (items) {
          final filtered = _filterTickets(items);
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const SectionTitle(
                title: 'My tickets',
                subtitle: 'Confirmed, reserved, and cancelled event tickets stay here with their codes.',
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final item in const [
                    ('upcoming', 'Upcoming'),
                    ('past', 'Past'),
                    ('cancelled', 'Cancelled'),
                  ])
                    ChoiceChip(
                      label: Text(item.$2),
                      selected: _tab == item.$1,
                      onSelected: (_) => setState(() => _tab = item.$1),
                      selectedColor: AppColors.primaryPurple,
                      backgroundColor: AppColors.surfaceWhite,
                      side: const BorderSide(color: AppColors.border),
                      labelStyle: TextStyle(
                        color: _tab == item.$1 ? Colors.white : AppColors.deepCharcoal,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              if (filtered.isEmpty)
                const EmptyStateView(
                  title: 'No tickets yet. Explore events near you.',
                  body: 'Reserve an event and your ticket will appear here.',
                )
              else
                ...filtered.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: TicketCard(ticket: item),
                    )),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Tickets unavailable',
            body: 'Try again in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(myTicketsProvider),
            ),
          ),
        ),
      ),
    );
  }
}
