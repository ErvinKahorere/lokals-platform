import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';

class AccommodationOwnerCard extends StatelessWidget {
  const AccommodationOwnerCard({
    super.key,
    required this.item,
  });

  final AccommodationItemModel item;

  @override
  Widget build(BuildContext context) {
    final ownerName = item.ownerName ?? item.businessName ?? item.userName ?? 'Local owner';
    final ownerLocation = item.ownerLocation ?? [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
    final avatarUrl = resolveMediaUrl(item.ownerAvatar ?? item.businessLogoUrl ?? item.userAvatar);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: AppColors.purpleSoftAlt,
                backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                child: avatarUrl == null
                    ? Text(
                        ownerName.characters.first.toUpperCase(),
                        style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(ownerName, style: AppTextStyles.h4)),
                        if (item.ownerVerified || item.businessVerified) const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(ownerLocation.isEmpty ? 'Okahandja' : ownerLocation, style: AppTextStyles.bodyMuted),
                    const SizedBox(height: 4),
                    const Text('Call or WhatsApp for viewings and availability.', style: AppTextStyles.caption),
                  ],
                ),
              ),
            ],
          ),
          if (item.businessId != null) ...[
            const SizedBox(height: 14),
            AppButton(
              label: 'View profile / business',
              variant: AppButtonVariant.secondary,
              onPressed: () => context.push('/directory/${item.businessId}'),
            ),
          ],
        ],
      ),
    );
  }
}
