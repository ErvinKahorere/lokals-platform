import 'package:flutter/material.dart';

import '../../src/core/experience_helpers.dart';
import '../../src/core/models.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import 'app_badge.dart';
import 'app_card.dart';
import 'experience/contact_actions.dart';
import 'experience/save_button.dart';

class ListingCard extends StatelessWidget {
  const ListingCard({super.key, required this.listing});

  final ListingModel listing;

  @override
  Widget build(BuildContext context) {
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
                child: ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(20)),
                  child: resolveMediaUrl(listing.imageUrl ?? listing.userAvatar) !=
                          null
                      ? Image.network(
                          resolveMediaUrl(listing.imageUrl ?? listing.userAvatar)!,
                          fit: BoxFit.cover,
                        )
                      : Container(
                          color: AppColors.neutralSoft,
                          child: const Center(
                            child: Icon(
                              Icons.storefront_rounded,
                              color: AppColors.mutedText,
                              size: 40,
                            ),
                          ),
                        ),
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
                const SizedBox(height: 8),
                Text(listing.description, style: AppTextStyles.bodyMuted, maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 8),
                Text(
                  listing.businessName ?? listing.userName ?? 'Local seller',
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
                const SizedBox(height: 12),
                ContactActions(name: listing.title),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
