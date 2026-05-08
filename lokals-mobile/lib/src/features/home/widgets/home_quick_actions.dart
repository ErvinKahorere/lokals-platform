import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/category_tile.dart';

class HomeQuickActions extends StatelessWidget {
  const HomeQuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 0.96,
      children: [
        CategoryTile(icon: Icons.home_repair_service_outlined, label: 'Services', onTap: () => context.go('/services'), color: AppColors.infoSoft, iconColor: AppColors.softBlue),
        CategoryTile(icon: Icons.work_outline_rounded, label: 'Jobs', onTap: () => context.go('/jobs'), color: AppColors.purpleSoftAlt, iconColor: AppColors.primaryPurple),
        CategoryTile(icon: Icons.storefront_outlined, label: 'Store', onTap: () => context.go('/store'), color: AppColors.warningSoft, iconColor: AppColors.warning),
        CategoryTile(icon: Icons.local_shipping_outlined, label: 'Delivery', onTap: () => context.go('/delivery'), color: AppColors.successSoft, iconColor: AppColors.primaryGreen),
        CategoryTile(icon: Icons.local_taxi_outlined, label: 'Taxi', onTap: () => context.go('/ride'), color: const Color(0xFFFFF1D9), iconColor: const Color(0xFFD97706)),
        CategoryTile(icon: Icons.shield_rounded, label: 'SOS', onTap: () => context.go('/sos'), color: AppColors.dangerSoft, iconColor: AppColors.danger),
      ],
    );
  }
}
