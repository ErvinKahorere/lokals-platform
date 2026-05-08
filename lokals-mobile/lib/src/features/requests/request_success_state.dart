import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../widgets/cards.dart';

class RequestSuccessState extends StatelessWidget {
  const RequestSuccessState({
    super.key,
    required this.title,
    required this.body,
    this.meta,
    required this.primaryLabel,
    required this.onPrimary,
    required this.secondaryLabel,
    required this.onSecondary,
  });

  final String title;
  final String body;
  final Widget? meta;
  final String primaryLabel;
  final VoidCallback onPrimary;
  final String secondaryLabel;
  final VoidCallback onSecondary;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: const Color(0xFFF0FDF4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              color: Color(0xFFD1FAE5),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_rounded, color: AppColors.primaryGreen, size: 30),
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text(body, style: const TextStyle(color: AppColors.mutedText, height: 1.45)),
          if (meta != null) ...[
            const SizedBox(height: 16),
            AppCard(child: meta!),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: AppButton(label: primaryLabel, onPressed: onPrimary)),
              const SizedBox(width: 12),
              Expanded(
                child: AppButton(
                  label: secondaryLabel,
                  variant: AppButtonVariant.secondary,
                  onPressed: onSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
