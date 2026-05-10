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
    final baseSurface = color ??
        switch (variant) {
          AppCardVariant.defaultCard => theme.cardColor,
          AppCardVariant.service => theme.cardColor,
          AppCardVariant.marketplace => theme.cardColor,
          AppCardVariant.job => theme.cardColor,
          AppCardVariant.dashboard => theme.cardColor,
          AppCardVariant.emergency => const Color(0xFFFFF5F5),
        };
    final borderColor = switch (variant) {
      AppCardVariant.service => AppColors.primaryPurple.withValues(alpha: 0.16),
      AppCardVariant.marketplace => theme.dividerColor,
      AppCardVariant.job => AppColors.info.withValues(alpha: 0.18),
      AppCardVariant.dashboard => AppColors.primaryPurple.withValues(alpha: 0.12),
      AppCardVariant.emergency => AppColors.danger.withValues(alpha: 0.22),
      _ => theme.dividerColor,
    };
    final shadowColor = switch (variant) {
      AppCardVariant.service => Colors.black.withValues(alpha: 0.08),
      AppCardVariant.marketplace => Colors.black.withValues(alpha: 0.06),
      AppCardVariant.job => Colors.black.withValues(alpha: 0.08),
      AppCardVariant.emergency => AppColors.danger.withValues(alpha: 0.16),
      _ => Colors.black.withValues(alpha: 0.06),
    };

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        decoration: BoxDecoration(
          color: baseSurface,
          borderRadius: BorderRadius.circular(AppRadius.xl),
          border: Border.all(color: borderColor),
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              blurRadius: 28,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}
