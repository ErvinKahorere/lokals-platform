import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_search_bar.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_badge.dart';
import '../../shared/widgets/category_tile.dart';
import '../../shared/widgets/loading_skeleton.dart';
import '../../shared/widgets/mobile_bottom_nav.dart';

export '../../shared/widgets/app_badge.dart';
export '../../shared/widgets/app_button.dart';
export '../../shared/widgets/app_card.dart';
export '../../shared/widgets/app_search_bar.dart';
export '../../shared/widgets/app_text_field.dart';
export '../../shared/widgets/empty_state.dart';
export '../../shared/widgets/loading_skeleton.dart';
export '../../shared/widgets/mobile_bottom_nav.dart';

class MetricCard extends StatelessWidget {
  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    this.color = AppColors.lokalsGreen,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.hero),
        color: AppColors.surfaceWhite,
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption),
          const SizedBox(height: 10),
          Text(
            value,
            style: AppTextStyles.h2.copyWith(
              color: color,
              fontSize: 24,
            ),
          ),
        ],
      ),
    );
  }
}

typedef LokalsCard = AppCard;
typedef LokalsSearchBar = AppSearchBar;
typedef LokalsActionTile = CategoryTile;
typedef LokalsButton = AppButton;
typedef LokalsBadge = AppBadge;
typedef LokalsBottomNav = MobileBottomNav;
typedef LokalsEmptyState = EmptyStateView;
typedef LokalsSkeleton = LoadingSkeleton;

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.title,
    this.subtitle,
    this.eyebrow,
    this.action,
  });

  final String title;
  final String? subtitle;
  final String? eyebrow;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (eyebrow != null) ...[
                Text(eyebrow!.toUpperCase(), style: AppTextStyles.eyebrow),
                const SizedBox(height: 6),
              ],
              Text(title, style: AppTextStyles.h2),
              if (subtitle != null) ...[
                const SizedBox(height: 6),
                Text(subtitle!, style: AppTextStyles.bodyMuted),
              ],
            ],
          ),
        ),
        if (action != null) ...[
          const SizedBox(width: AppSpacing.sm),
          action!,
        ],
      ],
    );
  }
}

class LokalsSectionHeader extends StatelessWidget {
  const LokalsSectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.eyebrow,
    this.action,
  });

  final String title;
  final String? subtitle;
  final String? eyebrow;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return SectionTitle(
      title: title,
      subtitle: subtitle,
      eyebrow: eyebrow,
      action: action,
    );
  }
}

class LokalsAvatar extends StatelessWidget {
  const LokalsAvatar({
    super.key,
    required this.label,
    this.radius = 24,
    this.backgroundColor = AppColors.purpleSoftAlt,
    this.foregroundColor = AppColors.primaryPurple,
  });

  final String label;
  final double radius;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    final safeLabel = label.trim().isEmpty ? 'L' : label.trim().characters.first.toUpperCase();

    return CircleAvatar(
      radius: radius,
      backgroundColor: backgroundColor,
      child: Text(
        safeLabel,
        style: AppTextStyles.h3.copyWith(color: foregroundColor),
      ),
    );
  }
}

class LokalsStatusPill extends StatelessWidget {
  const LokalsStatusPill({
    super.key,
    required this.label,
    this.tone = AppBadgeTone.neutral,
  });

  final String label;
  final AppBadgeTone tone;

  @override
  Widget build(BuildContext context) {
    return AppBadge(label: label, tone: tone);
  }
}

class EmptyStateView extends StatelessWidget {
  const EmptyStateView({
    super.key,
    required this.title,
    required this.body,
    this.action,
  });

  final String title;
  final String body;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AppCard(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              height: 56,
              width: 56,
              decoration: BoxDecoration(
                color: AppColors.purpleSoft,
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: const Icon(Icons.inbox_outlined, color: AppColors.primaryPurple),
            ),
            const SizedBox(height: 16),
            Text(title, style: AppTextStyles.h3, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(body, style: AppTextStyles.bodyMuted, textAlign: TextAlign.center),
            if (action != null) ...[
              const SizedBox(height: 14),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

class LokalsSurfaceTile extends StatelessWidget {
  const LokalsSurfaceTile({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(AppSpacing.md),
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );

    if (onTap == null) {
      return content;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        onTap: onTap,
        child: content,
      ),
    );
  }
}

class LokalsTextField extends StatelessWidget {
  const LokalsTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.maxLines = 1,
    this.keyboardType,
    this.obscureText = false,
    this.readOnly = false,
    this.helperText,
    this.errorText,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final int maxLines;
  final TextInputType? keyboardType;
  final bool obscureText;
  final bool readOnly;
  final String? helperText;
  final String? errorText;

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      controller: controller,
      label: label,
      hint: hint,
      maxLines: maxLines,
      keyboardType: keyboardType,
      obscureText: obscureText,
      readOnly: readOnly,
      helperText: helperText,
      errorText: errorText,
    );
  }
}

class PrimaryAction extends StatelessWidget {
  const PrimaryAction({
    super.key,
    required this.label,
    required this.onPressed,
    this.isBusy = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isBusy;

  @override
  Widget build(BuildContext context) {
    return AppButton(label: label, onPressed: onPressed, isLoading: isBusy);
  }
}
