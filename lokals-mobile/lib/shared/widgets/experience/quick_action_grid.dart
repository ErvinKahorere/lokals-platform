import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../category_tile.dart';

class QuickActionGrid extends StatelessWidget {
  const QuickActionGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        CategoryTile(icon: Icons.home_repair_service_outlined, label: 'Find Service', onTap: () => context.go('/services')),
        CategoryTile(icon: Icons.work_outline, label: 'Find Work', onTap: () => context.go('/jobs'), color: AppColors.skySoft, iconColor: AppColors.info),
        CategoryTile(icon: Icons.storefront_outlined, label: 'Shop', onTap: () => context.go('/store'), color: AppColors.goldSoft, iconColor: AppColors.deepCharcoal),
        CategoryTile(icon: Icons.apartment_outlined, label: 'Stay', onTap: () => context.go('/accommodation')),
        CategoryTile(icon: Icons.local_shipping_outlined, label: 'Send Parcel', onTap: () => context.go('/delivery'), color: const Color(0xFFE7F8EF), iconColor: AppColors.success),
      ],
    );
  }
}
