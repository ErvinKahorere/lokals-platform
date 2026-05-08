import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import 'app_badge.dart';
import 'app_card.dart';

class AlertCard extends StatelessWidget {
  const AlertCard({
    super.key,
    required this.title,
    required this.body,
    required this.priority,
    this.location,
  });

  final String title;
  final String body;
  final String priority;
  final String? location;

  @override
  Widget build(BuildContext context) {
    final tone = priority == 'high'
        ? AppBadgeTone.danger
        : priority == 'medium'
            ? AppBadgeTone.warning
            : AppBadgeTone.info;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: AppColors.purpleSoft,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.notifications_active_outlined, color: AppColors.primaryPurple),
              ),
              const SizedBox(width: 12),
              Expanded(child: Text(title, style: AppTextStyles.h3)),
              AppBadge(label: priority, tone: tone),
            ],
          ),
          const SizedBox(height: 12),
          Text(body, style: AppTextStyles.bodyMuted),
          if (location != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.place_outlined, size: 14, color: AppColors.mutedText),
                const SizedBox(width: 4),
                Expanded(child: Text(location!, style: AppTextStyles.caption)),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
