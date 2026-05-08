import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../src/widgets/cards.dart';

class AlertFeedCard extends StatelessWidget {
  const AlertFeedCard({
    super.key,
    required this.title,
    required this.body,
    required this.sourceLabel,
    required this.severity,
    this.location,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String body;
  final String sourceLabel;
  final String severity;
  final String? location;
  final String? actionLabel;
  final VoidCallback? onAction;

  bool get _isUrgent => ['critical', 'high', 'urgent'].contains(severity.toLowerCase());
  bool get _isPromotion => RegExp('promo|sale|discount', caseSensitive: false).hasMatch('$title $body $sourceLabel');

  Color get _accentColor {
    if (_isUrgent) return AppColors.danger;
    if (_isPromotion) return AppColors.warning;
    return AppColors.primaryPurple;
  }

  Color get _surfaceColor {
    if (_isUrgent) return const Color(0xFFFEF2F2);
    if (_isPromotion) return const Color(0xFFFFF7ED);
    return AppColors.purpleSoftAlt;
  }

  IconData get _icon {
    if (_isUrgent) return Icons.warning_amber_rounded;
    if (_isPromotion) return Icons.local_offer_outlined;
    return Icons.campaign_outlined;
  }

  String get _severityLabel {
    if (_isUrgent) return 'Urgent';
    if (_isPromotion) return 'Promotion';
    return sourceLabel;
  }

  @override
  Widget build(BuildContext context) {
    return LokalsCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: _surfaceColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(_icon, color: _accentColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _severityLabel,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _accentColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(title, style: AppTextStyles.h4),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(body, style: AppTextStyles.bodyMuted),
          const SizedBox(height: 10),
          Row(
            children: [
              if (location != null && location!.isNotEmpty) ...[
                const Icon(Icons.place_outlined, size: 14, color: AppColors.mutedText),
                const SizedBox(width: 4),
                Expanded(child: Text(location!, style: AppTextStyles.caption)),
              ] else
                Expanded(child: Text('Windhoek', style: AppTextStyles.caption)),
              if (actionLabel != null && onAction != null)
                TextButton(
                  onPressed: onAction,
                  child: Text(actionLabel!),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
