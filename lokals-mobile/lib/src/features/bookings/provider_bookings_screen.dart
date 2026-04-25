import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/booking_card.dart';
import '../../widgets/shell.dart';
import 'bookings_repository.dart';

class ProviderBookingsScreen extends ConsumerWidget {
  const ProviderBookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookings = ref.watch(providerBookingsProvider);

    return LokalsShell(
      title: 'Provider bookings',
      showBack: true,
      child: bookings.when(
        data: (items) => ListView.separated(
          padding: const EdgeInsets.all(20),
          itemCount: items.length,
          separatorBuilder: (_, _) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final booking = items[index];

            return BookingCard(
              booking: booking,
              footer: Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Confirm',
                      variant: AppButtonVariant.secondary,
                      onPressed: () async {
                        await ref
                            .read(bookingsRepositoryProvider)
                            .updateStatus(booking.id, 'confirmed');
                        ref.invalidate(providerBookingsProvider);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: 'Reject',
                      variant: AppButtonVariant.danger,
                      onPressed: () async {
                        await ref
                            .read(bookingsRepositoryProvider)
                            .updateStatus(booking.id, 'cancelled');
                        ref.invalidate(providerBookingsProvider);
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) =>
            Center(child: Text('Failed to load provider bookings: $error')),
      ),
    );
  }
}
