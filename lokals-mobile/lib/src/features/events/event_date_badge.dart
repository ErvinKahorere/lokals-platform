import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class EventDateBadge extends StatelessWidget {
  const EventDateBadge({super.key, this.startsAt, this.endsAt});

  final String? startsAt;
  final String? endsAt;

  String _formatDate(String? value) {
    if (value == null || value.isEmpty) return 'Date TBC';
    return DateFormat('EEE, d MMM').format(DateTime.parse(value).toLocal());
  }

  String _formatTime(String? value) {
    if (value == null || value.isEmpty) return 'Time TBC';
    return DateFormat('HH:mm').format(DateTime.parse(value).toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Wrap(
        spacing: 10,
        runSpacing: 6,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.calendar_today_rounded,
                size: 15,
                color: AppColors.primaryPurple,
              ),
              const SizedBox(width: 8),
              Text(
                _formatDate(startsAt),
                style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.schedule_rounded,
                size: 15,
                color: AppColors.mutedText,
              ),
              const SizedBox(width: 8),
              Text(
                '${_formatTime(startsAt)}${endsAt == null ? '' : ' - ${_formatTime(endsAt)}'}',
                style: AppTextStyles.bodyMuted,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
