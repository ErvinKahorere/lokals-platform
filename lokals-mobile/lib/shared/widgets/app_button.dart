import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import 'loading_skeleton.dart';

enum AppButtonVariant { primary, secondary, accent, danger }

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.loadingLabel,
    this.variant = AppButtonVariant.primary,
    this.icon,
    this.expanded = true,
    this.compact = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final String? loadingLabel;
  final AppButtonVariant variant;
  final IconData? icon;
  final bool expanded;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final minimumHeight = compact ? 44.0 : 52.0;
    final horizontalPadding = compact ? 16.0 : 18.0;
    final verticalPadding = compact ? 10.0 : 14.0;
    final fontSize = compact ? 13.0 : 15.0;
    final radius = compact ? 18.0 : AppRadius.xl;

    final style = switch (variant) {
      AppButtonVariant.primary => FilledButton.styleFrom(
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      AppButtonVariant.secondary => FilledButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.primaryPurple,
        side: BorderSide(color: AppColors.primaryPurple.withValues(alpha: 0.18)),
        elevation: 0,
      ),
      AppButtonVariant.accent => FilledButton.styleFrom(
        backgroundColor: AppColors.primaryPurple,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      AppButtonVariant.danger => FilledButton.styleFrom(
        backgroundColor: AppColors.danger,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
    };

    final child = FilledButton(
      onPressed: isLoading ? null : onPressed,
      style: style.copyWith(
        minimumSize: WidgetStatePropertyAll(Size.fromHeight(minimumHeight)),
        padding: WidgetStatePropertyAll(
          EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: verticalPadding),
        ),
        overlayColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.pressed)) {
            return Colors.black.withValues(alpha: 0.06);
          }
          return null;
        }),
        textStyle: WidgetStatePropertyAll(
          TextStyle(fontSize: fontSize, fontWeight: FontWeight.w700),
        ),
        shape: WidgetStatePropertyAll(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
      ),
      child: isLoading
          ? LokalsButtonLoader(
              label: loadingLabel ?? 'Processing...',
              color: switch (variant) {
                AppButtonVariant.secondary => AppColors.primaryPurple,
                _ => Colors.white,
              },
            )
          : Row(
              mainAxisSize: expanded ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 18),
                  const SizedBox(width: 8),
                ],
                Text(label),
              ],
            ),
    );

    return expanded ? child : IntrinsicWidth(child: child);
  }
}
