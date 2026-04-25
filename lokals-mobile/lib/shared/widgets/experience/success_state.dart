import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../app_button.dart';
import '../app_card.dart';

class SuccessState extends StatelessWidget {
  const SuccessState({
    super.key,
    required this.title,
    required this.body,
    this.primaryLabel,
    this.onPrimary,
    this.secondaryLabel,
    this.onSecondary,
  });

  final String title;
  final String body;
  final String? primaryLabel;
  final VoidCallback? onPrimary;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: const Color(0xFFECFDF5),
      child: Column(
        children: [
          Container(
            height: 64,
            width: 64,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline, color: AppColors.success, size: 36),
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(body, textAlign: TextAlign.center),
          if (primaryLabel != null || secondaryLabel != null) ...[
            const SizedBox(height: 16),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              alignment: WrapAlignment.center,
              children: [
                if (primaryLabel != null)
                  AppButton(label: primaryLabel!, expanded: false, onPressed: onPrimary),
                if (secondaryLabel != null)
                  AppButton(label: secondaryLabel!, variant: AppButtonVariant.secondary, expanded: false, onPressed: onSecondary),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

