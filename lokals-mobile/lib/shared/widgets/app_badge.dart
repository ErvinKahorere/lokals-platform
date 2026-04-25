import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';

enum AppBadgeTone { success, warning, danger, info, neutral, accent }

class AppBadge extends StatelessWidget {
  const AppBadge({
    super.key,
    required this.label,
    this.tone = AppBadgeTone.neutral,
  });

  final String label;
  final AppBadgeTone tone;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (tone) {
      AppBadgeTone.success => (AppColors.greenSoft, AppColors.success),
      AppBadgeTone.warning => (const Color(0xFFFEF3C7), AppColors.warning),
      AppBadgeTone.danger => (AppColors.dangerSoft, AppColors.danger),
      AppBadgeTone.info => (AppColors.skySoft, AppColors.info),
      AppBadgeTone.accent => (AppColors.goldSoft, AppColors.deepCharcoal),
      AppBadgeTone.neutral => (const Color(0xFFF1F5F9), AppColors.mutedText),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.hero),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fg,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}
