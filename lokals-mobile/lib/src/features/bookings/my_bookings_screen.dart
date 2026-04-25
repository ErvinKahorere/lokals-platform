import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/booking_card.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../../shared/widgets/experience/quick_call_button.dart';
import '../../widgets/shell.dart';
import 'bookings_repository.dart';

class MyBookingsScreen extends ConsumerStatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  ConsumerState<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends ConsumerState<MyBookingsScreen> {
  String _tab = 'upcoming';

  @override
  Widget build(BuildContext context) {
    final bookings = ref.watch(myBookingsProvider);

    return LokalsShell(
      title: 'My bookings',
      showBack: true,
      child: bookings.when(
        data: (items) {
          final filtered = _tab == 'upcoming'
              ? items.where((item) => item.status != 'completed' && item.status != 'cancelled').toList()
              : items.where((item) => item.status == 'completed' || item.status == 'cancelled').toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: const Text('Upcoming'),
                      selected: _tab == 'upcoming',
                      onSelected: (_) => setState(() => _tab = 'upcoming'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ChoiceChip(
                      label: const Text('Past'),
                      selected: _tab == 'past',
                      onSelected: (_) => setState(() => _tab = 'past'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ...filtered.map(
                (booking) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: BookingCard(
                    booking: booking,
                    footer: Row(
                      children: [
                        const QuickCallButton(phone: null),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ContactActions(
                            name: booking.providerName ?? 'provider',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) =>
            Center(child: Text('Failed to load bookings: $error')),
      ),
    );
  }
}
