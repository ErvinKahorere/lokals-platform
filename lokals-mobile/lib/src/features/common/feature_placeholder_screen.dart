import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';

class FeaturePlaceholderScreen extends StatelessWidget {
  const FeaturePlaceholderScreen({
    super.key,
    required this.title,
    required this.description,
    this.primaryLabel,
    this.primaryRoute,
    this.icon = Icons.auto_awesome_rounded,
  });

  final String title;
  final String description;
  final String? primaryLabel;
  final String? primaryRoute;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return LokalsShell(
      title: title,
      showBack: true,
      child: ListView(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          MediaQuery.viewPaddingOf(context).bottom + 88,
        ),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.purpleSoftAlt,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Icon(icon, color: AppColors.primaryPurple),
                ),
                const SizedBox(height: 18),
                SectionTitle(
                  eyebrow: 'Feature in progress',
                  title: title,
                  subtitle: description,
                ),
                const SizedBox(height: 18),
                if (primaryLabel != null && primaryRoute != null)
                  AppButton(
                    label: primaryLabel!,
                    onPressed: () => context.go(primaryRoute!),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
