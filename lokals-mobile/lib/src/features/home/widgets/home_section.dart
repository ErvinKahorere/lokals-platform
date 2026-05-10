import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../widgets/cards.dart';

class HomeSection extends StatelessWidget {
  const HomeSection({
    super.key,
    required this.title,
    this.eyebrow,
    this.actionLabel,
    this.onAction,
    this.isLoading = false,
    this.errorText,
    this.emptyTitle,
    this.emptyBody,
    this.onRetry,
    required this.child,
  });

  final String title;
  final String? eyebrow;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool isLoading;
  final String? errorText;
  final String? emptyTitle;
  final String? emptyBody;
  final VoidCallback? onRetry;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    Widget body = child;

    if (isLoading) {
      body = Column(
        children: const [
          LoadingSkeleton(height: 120),
          SizedBox(height: 12),
          LoadingSkeleton(height: 120),
        ],
      );
    } else if (errorText != null) {
      body = EmptyStateView(
        title: 'Could not load this section',
        body: errorText!,
        action: onRetry == null
            ? null
            : AppButton(
                label: 'Retry',
                expanded: false,
                variant: AppButtonVariant.secondary,
                onPressed: onRetry,
              ),
      );
    } else if (emptyTitle != null) {
      body = EmptyStateView(title: emptyTitle!, body: emptyBody ?? 'Nothing here yet.');
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (eyebrow != null)
                    Text(
                      eyebrow!,
                      style: const TextStyle(
                        color: AppColors.lokalsGreen,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            if (actionLabel != null && onAction != null)
              TextButton(
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
          ],
        ),
        const SizedBox(height: 12),
        body,
      ],
    );
  }
}
