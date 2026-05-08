import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';

class TicketCard extends StatelessWidget {
  const TicketCard({super.key, required this.ticket});

  final EventTicketModel ticket;

  @override
  Widget build(BuildContext context) {
    final startsAt = ticket.event?.startsAt == null ? null : DateTime.tryParse(ticket.event!.startsAt!);

    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () => context.push('/tickets/${ticket.id}'),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: ticket.status == 'confirmed'
                        ? const Color(0xFFDCFCE7)
                        : ticket.status == 'cancelled'
                            ? const Color(0xFFF3F4F6)
                            : const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(ticket.status, style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
                if (ticket.ticketType != null)
                  Text(ticket.ticketType!.name, style: const TextStyle(color: AppColors.mutedText)),
              ],
            ),
            const SizedBox(height: 12),
            Text(ticket.event?.title ?? 'Event ticket', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(ticket.event?.locationLabel ?? ticket.event?.location ?? 'Location TBC', style: const TextStyle(color: AppColors.mutedText)),
            const SizedBox(height: 8),
            Text(
              startsAt == null ? 'Date TBC' : '${startsAt.day}/${startsAt.month}/${startsAt.year} ${startsAt.hour.toString().padLeft(2, '0')}:${startsAt.minute.toString().padLeft(2, '0')}',
              style: AppTextStyles.bodyMuted,
            ),
            const SizedBox(height: 10),
            Text('Code: ${ticket.ticketCode}', style: const TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            const Text('QR placeholder ready for later check-in support.', style: TextStyle(color: AppColors.mutedText)),
          ],
        ),
      ),
    );
  }
}
