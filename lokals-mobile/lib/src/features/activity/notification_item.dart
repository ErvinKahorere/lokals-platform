import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';

class NotificationItemCard extends StatelessWidget {
  const NotificationItemCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  final NotificationItemModel item;
  final VoidCallback onTap;

  IconData _iconForType(String? type) {
    switch (type) {
      case 'booking_update':
        return Icons.book_online_outlined;
      case 'job_update':
        return Icons.work_outline_rounded;
      case 'alert_from_followed':
        return Icons.campaign_outlined;
      case 'news_update':
        return Icons.article_outlined;
      case 'event_reminder':
        return Icons.event_available_outlined;
      case 'ticket_update':
        return Icons.confirmation_number_outlined;
      case 'delivery_update':
        return Icons.local_shipping_outlined;
      case 'ride_update':
        return Icons.local_taxi_outlined;
      default:
        return Icons.notifications_none_rounded;
    }
  }

  Color _backgroundForType(String? type, bool isUnread) {
    if (!isUnread) return AppColors.softBackground;
    switch (type) {
      case 'alert_from_followed':
        return const Color(0xFFFEF2F2);
      case 'news_update':
        return AppColors.purpleSoftAlt;
      case 'event_reminder':
        return const Color(0xFFFFF7ED);
      default:
        return AppColors.purpleSoftAlt;
    }
  }

  Color _iconColorForType(String? type, bool isUnread) {
    if (!isUnread) return AppColors.mutedText;
    switch (type) {
      case 'alert_from_followed':
        return AppColors.danger;
      case 'event_reminder':
        return AppColors.warning;
      default:
        return AppColors.primaryPurple;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUnread = item.readAt == null;

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: onTap,
      child: LokalsCard(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: _backgroundForType(item.type, isUnread),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                _iconForType(item.type),
                color: _iconColorForType(item.type, isUnread),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(item.body, style: AppTextStyles.bodyMuted),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isUnread ? AppColors.purpleSoftAlt : AppColors.softBackground,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          isUnread ? 'Unread' : 'Read',
                          style: TextStyle(
                            color: isUnread ? AppColors.primaryPurple : AppColors.mutedText,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      if (item.createdAt != null && item.createdAt!.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.createdAt!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.caption,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
