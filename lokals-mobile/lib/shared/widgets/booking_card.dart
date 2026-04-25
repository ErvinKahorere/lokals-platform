import 'package:flutter/material.dart';

import '../../src/core/experience_helpers.dart';
import '../../src/core/models.dart';
import '../../core/theme/app_text_styles.dart';
import 'app_badge.dart';
import 'app_card.dart';

class BookingCard extends StatelessWidget {
  const BookingCard({super.key, required this.booking, this.footer});

  final BookingModel booking;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final tone = switch (booking.status) {
      'confirmed' || 'completed' => AppBadgeTone.success,
      'cancelled' => AppBadgeTone.danger,
      _ => AppBadgeTone.warning,
    };

    return AppCard(
      variant: AppCardVariant.dashboard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(booking.serviceName ?? 'Booking', style: AppTextStyles.h3),
                    const SizedBox(height: 6),
                    Text(
                      booking.providerName ?? booking.customerName ?? 'Provider',
                      style: AppTextStyles.bodyMuted,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${booking.bookingDate} at ${booking.startTime}',
                      style: AppTextStyles.bodyMuted,
                    ),
                  ],
                ),
              ),
              AppBadge(label: getStatusLabel(booking.status), tone: tone),
            ],
          ),
          if (booking.notes != null && booking.notes!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(booking.notes!, style: AppTextStyles.bodyMuted),
          ],
          if (footer != null) ...[
            const SizedBox(height: 14),
            footer!,
          ],
        ],
      ),
    );
  }
}
