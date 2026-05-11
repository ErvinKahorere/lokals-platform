import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';

class NotificationItemCard extends StatelessWidget {
  const NotificationItemCard({
    super.key,
    required this.item,
    required this.onTap,
    this.onMarkRead,
  });

  final NotificationItemModel item;
  final VoidCallback onTap;
  final VoidCallback? onMarkRead;

  IconData _iconForType(String? type) {
    switch (type) {
      case 'booking_update':
      case 'booking_status':
        return Icons.book_online_outlined;
      case 'job_update':
      case 'job_application':
        return Icons.work_outline_rounded;
      case 'municipal_alert':
        return Icons.campaign_outlined;
      case 'report_update':
      case 'report_created':
        return Icons.assignment_turned_in_outlined;
      case 'news_update':
        return Icons.article_outlined;
      case 'event_reminder':
        return Icons.event_available_outlined;
      case 'ticket_update':
      case 'event_ticket':
        return Icons.confirmation_number_outlined;
      case 'delivery_update':
        return Icons.local_shipping_outlined;
      case 'ride_update':
        return Icons.local_taxi_outlined;
      case 'system':
        return Icons.info_outline_rounded;
      default:
        return Icons.notifications_none_rounded;
    }
  }

  String _typeLabel(String? type) {
    switch (type) {
      case 'municipal_alert':
        return 'Municipal alert';
      case 'report_update':
      case 'report_created':
        return 'Report update';
      case 'booking_update':
      case 'booking_status':
        return 'Booking update';
      case 'job_update':
      case 'job_application':
        return 'Job update';
      case 'event_reminder':
        return 'Event reminder';
      case 'ticket_update':
      case 'event_ticket':
        return 'Ticket update';
      case 'delivery_update':
        return 'Delivery update';
      case 'ride_update':
        return 'Ride update';
      case 'news_update':
        return 'News update';
      default:
        return 'System';
    }
  }

  Color _backgroundForType(String? type, bool isUnread) {
    if (!isUnread) return AppColors.softBackground;
    switch (type) {
      case 'municipal_alert':
      case 'report_update':
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
      case 'municipal_alert':
      case 'report_update':
        return AppColors.danger;
      case 'event_reminder':
        return AppColors.warning;
      default:
        return AppColors.primaryPurple;
    }
  }

  String _timeLabel(String? createdAt) {
    if (createdAt == null || createdAt.isEmpty) return 'Recent';
    final parsed = DateTime.tryParse(createdAt);
    if (parsed == null) return 'Recent';
    return DateFormat('EEE, d MMM • HH:mm').format(parsed.toLocal());
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
                  Text(
                    _typeLabel(item.type),
                    style: TextStyle(
                      color: isUnread ? AppColors.primaryPurple : AppColors.mutedText,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(item.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(item.body, style: AppTextStyles.bodyMuted),
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
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
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _timeLabel(item.createdAt),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption,
                        ),
                      ),
                      if (isUnread && onMarkRead != null)
                        TextButton(
                          onPressed: onMarkRead,
                          child: const Text('Mark read'),
                        ),
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
