import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';

enum AppCardVariant {
  defaultCard,
  service,
  marketplace,
  job,
  dashboard,
  emergency,
}

class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color,
    this.variant = AppCardVariant.defaultCard,
  });

  final Widget child;
  final EdgeInsets padding;
  final Color? color;
  final AppCardVariant variant;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final baseSurface = color ??
        switch (variant) {
          AppCardVariant.defaultCard => theme.cardColor.withValues(alpha: 0.84),
          AppCardVariant.service => theme.cardColor.withValues(alpha: 0.86),
          AppCardVariant.marketplace => theme.cardColor.withValues(alpha: 0.82),
          AppCardVariant.job => theme.cardColor.withValues(alpha: 0.84),
          AppCardVariant.dashboard => theme.cardColor.withValues(alpha: 0.84),
          AppCardVariant.emergency => const Color(0xCCFFF1F2),
        };
    final borderColor = switch (variant) {
      AppCardVariant.service => theme.colorScheme.primary.withValues(alpha: 0.18),
      AppCardVariant.marketplace => theme.colorScheme.secondary.withValues(alpha: 0.24),
      AppCardVariant.emergency => AppColors.danger.withValues(alpha: 0.22),
      _ => theme.dividerColor.withValues(alpha: isDark ? 0.8 : 1),
    };
    final shadowColor = switch (variant) {
      AppCardVariant.service => theme.colorScheme.primary.withValues(alpha: 0.16),
      AppCardVariant.marketplace => AppColors.deepPurple.withValues(alpha: 0.14),
      AppCardVariant.emergency => AppColors.danger.withValues(alpha: 0.16),
      _ => AppColors.deepPurple.withValues(alpha: isDark ? 0.26 : 0.10),
    };

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        decoration: BoxDecoration(
          color: baseSurface.withValues(alpha: variant == AppCardVariant.emergency ? 1 : 0.98),
          borderRadius: BorderRadius.circular(AppRadius.xl),
          border: Border.all(color: borderColor),
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}
