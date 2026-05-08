import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/app_card.dart';

class LocalUpdateCard extends StatelessWidget {
  const LocalUpdateCard({
    super.key,
    required this.title,
    required this.source,
    required this.type,
    required this.route,
    this.time,
    this.status,
  });

  final String title;
  final String source;
  final String type;
  final String route;
  final String? time;
  final String? status;

  @override
  Widget build(BuildContext context) {
    final (IconData icon, Color bgColor, Color iconColor) = switch (type) {
      'alert' => (Icons.warning_amber_rounded, const Color(0xFFFEF2F2), AppColors.danger),
      'followed' => (Icons.favorite_outline_rounded, const Color(0xFFFFFBEB), const Color(0xFFD97706)),
      'event' => (Icons.event_outlined, const Color(0xFFEEF2FF), const Color(0xFF7C3AED)),
      _ => (Icons.newspaper_outlined, AppColors.greenSoft, AppColors.lokalsGreen),
    };

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () => context.go(route),
      child: AppCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(14)),
              child: Icon(icon, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(source, style: const TextStyle(color: AppColors.mutedText)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          time ?? 'Recent',
                          style: const TextStyle(fontSize: 12, color: AppColors.mutedText),
                        ),
                      ),
                      if (status != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppColors.softBackground,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            status!,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
