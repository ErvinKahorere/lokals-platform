import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';

class NotificationPreferencesSection extends StatelessWidget {
  const NotificationPreferencesSection({
    super.key,
    required this.values,
    required this.onChanged,
  });

  final Map<String, bool> values;
  final ValueChanged<MapEntry<String, bool>> onChanged;

  static const Map<String, String> _labels = {
    'alerts_from_followed_entities': 'Alerts from followed sources',
    'booking_updates': 'Booking updates',
    'job_updates': 'Jobs and applications',
    'news_updates': 'Local news',
    'promotions': 'Promotions and sale alerts',
    'city_alerts': 'Public notices and safety alerts',
  };

  @override
  Widget build(BuildContext context) {
    return Column(
      children: values.entries.map((entry) {
        return SwitchListTile(
          contentPadding: EdgeInsets.zero,
          activeThumbColor: AppColors.primaryPurple,
          title: Text(
            _labels[entry.key] ?? entry.key.replaceAll('_', ' '),
            style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600),
          ),
          subtitle: const Text(
            'Only keep the updates you want to hear about.',
            style: AppTextStyles.bodyMuted,
          ),
          value: entry.value,
          onChanged: (value) => onChanged(MapEntry(entry.key, value)),
        );
      }).toList(),
    );
  }
}
