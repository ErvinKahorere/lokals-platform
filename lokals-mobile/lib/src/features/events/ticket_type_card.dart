import 'package:flutter/material.dart';

import '../../core/models.dart';
import '../../widgets/cards.dart';

class TicketTypeCard extends StatelessWidget {
  const TicketTypeCard({
    super.key,
    required this.ticketType,
    required this.selected,
    required this.onTap,
  });

  final EventTicketTypeModel ticketType;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final remaining = ticketType.quantityAvailable == null
        ? null
        : (ticketType.quantityAvailable! - ticketType.quantitySold).clamp(0, ticketType.quantityAvailable!);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: AppCard(
        padding: const EdgeInsets.all(18),
        color: selected ? const Color(0xFFDCFCE7) : null,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(ticketType.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700))),
                if (remaining != null)
                  Text('$remaining left', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF166534))),
              ],
            ),
            if (ticketType.description != null) ...[
              const SizedBox(height: 8),
              Text(ticketType.description!, style: const TextStyle(color: Color(0xFF64748B))),
            ],
            const SizedBox(height: 12),
            Text(
              ticketType.price == null || ticketType.price == '0' || ticketType.price == '0.00'
                  ? 'Free'
                  : 'N\$${ticketType.price}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
          ],
        ),
      ),
    );
  }
}
