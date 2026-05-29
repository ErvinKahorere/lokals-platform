import 'package:flutter/material.dart';

import '../../src/core/experience_helpers.dart';
import '../../src/core/models.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import 'app_badge.dart';
import 'app_card.dart';
import 'app_network_image.dart';
import 'experience/contact_actions.dart';
import 'experience/save_button.dart';

class ListingCard extends StatelessWidget {
  const ListingCard({super.key, required this.listing});

  final ListingModel listing;

  @override
  Widget build(BuildContext context) {
    final sellerName = listing.businessName ?? listing.userName ?? 'Local seller';
    return AppCard(
      variant: AppCardVariant.marketplace,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              SizedBox(
                height: 140,
                width: double.infinity,
                child: AppNetworkImage(
                  imageUrl: resolveMediaUrl(listing.imageUrl ?? listing.userAvatar),
                  fallbackIcon: Icons.storefront_rounded,
                  height: 140,
                  width: double.infinity,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
              ),
              Positioned(
                right: 8,
                top: 8,
                child: SaveButton(
                  storageId: 'listing:${listing.id}',
                  itemType: 'listing',
                  itemId: listing.id,
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppBadge(label: listing.type, tone: AppBadgeTone.accent),
                    Text(
                      listing.price == null ? 'Offer' : getDisplayPrice(listing.price),
                      style: AppTextStyles.h3.copyWith(fontSize: 18, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(listing.title, style: AppTextStyles.h3),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    AppBadge(
                      label: listing.status == 'published' ? 'Published' : listing.status,
                      tone: listing.status == 'published' ? AppBadgeTone.success : AppBadgeTone.neutral,
                    ),
                    const AppBadge(label: 'Meet safely', tone: AppBadgeTone.info),
                  ],
                ),
                const SizedBox(height: 8),
                Text(listing.description, style: AppTextStyles.bodyMuted, maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 8),
                Text(
                  sellerName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.deepCharcoal,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.only(top: 8),
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide(color: AppColors.border)),
                  ),
                  child: Text(
                    listing.location ?? 'Local',
                    style: const TextStyle(color: AppColors.mutedText, fontSize: 12),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Inspect the item and confirm pickup before payment.',
                  style: TextStyle(color: AppColors.mutedText, fontSize: 12),
                ),
                const SizedBox(height: 12),
                ContactActions(name: sellerName),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
