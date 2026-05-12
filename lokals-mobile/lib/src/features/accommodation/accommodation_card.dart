import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/experience/save_button.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';

class AccommodationCard extends StatelessWidget {
  const AccommodationCard({
    super.key,
    required this.item,
    this.compact = false,
  });

  final AccommodationItemModel item;
  final bool compact;

  static const _typeLabels = {
    'rental': 'Rental',
    'property_sale': 'Property sale',
    'bnb': 'B&B',
    'short_stay': 'Short stay',
    'guesthouse': 'Guesthouse',
    'guest_room': 'Room',
  };

  @override
  Widget build(BuildContext context) {
    final imageUrl = resolveMediaUrl(item.imageUrl);
    final locationLabel =
        [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
    final phone = item.ownerPhone ?? item.businessPhone ?? item.userPhone;

    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: () => context.push('/accommodation/${item.id}'),
      child: AppCard(
        variant: AppCardVariant.marketplace,
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: AppNetworkImage(
                    imageUrl: imageUrl,
                    fallbackIcon: Icons.home_work_outlined,
                    width: double.infinity,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                ),
                Positioned(
                  left: 10,
                  top: 10,
                  child: Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      AppBadge(
                        label: _typeLabels[item.type] ?? item.type.replaceAll('_', ' '),
                        tone: AppBadgeTone.info,
                      ),
                      if (item.pricePeriod != null)
                        AppBadge(label: 'Per ${item.pricePeriod}', tone: AppBadgeTone.info),
                    ],
                  ),
                ),
                Positioned(
                  right: 8,
                  top: 8,
                  child: SaveButton(
                    storageId: 'accommodation:${item.id}',
                    itemType: 'accommodation',
                    itemId: item.id,
                    onChanged: (saved) {
                      final label = saved ? 'Saved' : 'Removed from saved';
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(label)));
                    },
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.h4,
                        ),
                      ),
                      if (item.ownerVerified || item.businessVerified)
                        const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(getDisplayPrice(item.price), style: AppTextStyles.h3.copyWith(fontSize: 20)),
                  const SizedBox(height: 4),
                  Text('per ${item.pricePeriod ?? 'month'}', style: AppTextStyles.caption),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined, size: 14, color: AppColors.mutedText),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          locationLabel.isEmpty ? (item.location ?? 'Okahandja') : locationLabel,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (item.bedrooms != null)
                        Flexible(
                          child: Text(
                            '${item.bedrooms} bed',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal),
                          ),
                        ),
                      if (item.bedrooms != null && item.bathrooms != null)
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6),
                          child: Text('|', style: AppTextStyles.caption),
                        ),
                      if (item.bathrooms != null)
                        Flexible(
                          child: Text(
                            '${item.bathrooms} bath',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal),
                          ),
                        ),
                    ],
                  ),
                  if (!compact) ...[
                    const SizedBox(height: 10),
                    Text(
                      item.description?.trim().isNotEmpty == true
                          ? item.description!
                          : 'Local stay or property listing with direct owner contact.',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodyMuted,
                    ),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          label: 'View',
                          expanded: true,
                          onPressed: () => context.push('/accommodation/${item.id}'),
                        ),
                      ),
                      if (phone != null && phone.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Expanded(
                          child: AppButton(
                            label: 'Contact',
                            expanded: true,
                            variant: AppButtonVariant.secondary,
                            onPressed: () => launchPhoneCall(context, phone),
                          ),
                        ),
                      ],
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

Future<void> launchPhoneCall(BuildContext context, String phone) async {
  final uri = Uri(scheme: 'tel', path: phone);
  final messenger = ScaffoldMessenger.of(context);
  try {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
      return;
    }
  } catch (_) {
    // Fallback message below.
  }
  messenger.showSnackBar(SnackBar(content: Text('Calling is not available right now. Please use $phone.')));
}
