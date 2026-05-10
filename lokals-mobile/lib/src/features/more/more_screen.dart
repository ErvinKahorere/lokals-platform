import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Okahandja Portal', 'Town alerts, public services, and council updates', Icons.account_balance_outlined, '/okahandja'),
      ('Directory', 'Police, clinics, schools, businesses', Icons.business_outlined, '/directory'),
      ('Stay', 'Rentals, homes, short stays', Icons.apartment_outlined, '/accommodation'),
      ('Send Parcel', 'Pickup and drop-off requests', Icons.local_shipping_outlined, '/delivery'),
      ('Alerts & Activity', 'Recent updates and city notices', Icons.notifications_active_outlined, '/activity'),
      ('News', 'Aggregated local stories and announcements', Icons.newspaper_outlined, '/news'),
      ('Events', 'Local events, tickets, and reminders', Icons.event_outlined, '/events'),
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
          AppCard(
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.purpleSoftAlt,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: const Icon(Icons.grid_view_rounded, color: AppColors.primaryPurple),
                ),
                const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Move quickly through LOKALS', style: TextStyle(fontWeight: FontWeight.w800)),
                            const SizedBox(height: 4),
                            Text('Town tools, discovery, transport, and settings stay grouped here without crowding Home.', style: AppTextStyles.bodyMuted),
                          ],
                        ),
                      ),
              ],
            ),
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
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: item.$1 == 'SOS' ? AppColors.dangerSoft : AppColors.purpleSoftAlt,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(
                          item.$3,
                          color: item.$1 == 'SOS' ? AppColors.danger : AppColors.primaryPurple,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.$1, style: const TextStyle(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            Text(item.$2, style: AppTextStyles.bodyMuted),
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
