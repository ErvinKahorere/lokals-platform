import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Directory', 'Police, clinics, schools, businesses', Icons.business_outlined, '/directory'),
      ('Stay', 'Rentals, homes, short stays', Icons.apartment_outlined, '/accommodation'),
      ('Send Parcel', 'Pickup and drop-off requests', Icons.local_shipping_outlined, '/delivery'),
      ('Alerts & Activity', 'Recent updates and city notices', Icons.notifications_active_outlined, '/activity'),
      ('Settings', 'Location, theme, notifications', Icons.settings_outlined, '/settings'),
      ('SOS', 'Emergency support', Icons.sos_outlined, '/sos'),
    ];

    return LokalsShell(
      title: 'More',
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Everything else, without clutter',
            subtitle: 'Secondary actions live here so the main app stays simple.',
          ),
          const SizedBox(height: 16),
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => context.go(item.$4),
                child: LokalsCard(
                  child: Row(
                    children: [
                      Icon(item.$3),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.$1, style: const TextStyle(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            Text(item.$2, style: const TextStyle(color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
