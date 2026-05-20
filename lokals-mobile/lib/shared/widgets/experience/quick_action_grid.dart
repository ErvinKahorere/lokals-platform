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
      childAspectRatio: 1.2,
      children: [
        CategoryTile(
          icon: Icons.local_taxi_outlined,
          label: 'Taxi Request',
          onTap: () => context.go('/ride'),
          color: AppColors.skySoft,
          iconColor: AppColors.info,
        ),
        CategoryTile(
          icon: Icons.local_shipping_outlined,
          label: 'Delivery',
          onTap: () => context.go('/delivery'),
          color: AppColors.successSoft,
          iconColor: AppColors.success,
        ),
        CategoryTile(
          icon: Icons.sos_outlined,
          label: 'SOS',
          onTap: () => context.go('/sos'),
          color: AppColors.dangerSoft,
          iconColor: AppColors.danger,
        ),
        CategoryTile(
          icon: Icons.storefront_outlined,
          label: 'Marketplace',
          onTap: () => context.go('/marketplace'),
          color: AppColors.goldSoft,
          iconColor: AppColors.deepCharcoal,
        ),
        CategoryTile(
          icon: Icons.warehouse_outlined,
          label: 'Hire',
          onTap: () => context.go('/hire'),
          color: AppColors.purpleSoftAlt,
          iconColor: AppColors.primaryPurple,
        ),
        CategoryTile(
          icon: Icons.event_outlined,
          label: 'Events',
          onTap: () => context.go('/events'),
          color: AppColors.infoSoft,
          iconColor: AppColors.info,
        ),
        CategoryTile(
          icon: Icons.newspaper_outlined,
          label: 'News',
          onTap: () => context.go('/news'),
          color: const Color(0xFFF1F5F9),
          iconColor: AppColors.deepCharcoal,
        ),
      ],
    );
  }
}
