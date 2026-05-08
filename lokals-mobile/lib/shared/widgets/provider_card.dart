import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../src/core/experience_helpers.dart';
import '../../src/core/models.dart';
import 'app_badge.dart';
import 'app_button.dart';
import 'app_card.dart';
import 'experience/quick_call_button.dart';
import 'experience/trust_row.dart';

class ProviderCard extends StatelessWidget {
  const ProviderCard({super.key, required this.provider});

  final ProviderModel provider;

  @override
  Widget build(BuildContext context) {
    final activeServices = provider.services.where((service) => service.isActive).toList();
    final fromPrice = activeServices.fold<num?>(
      null,
      (lowest, service) {
        final nextPrice = num.tryParse(service.price) ?? 0;
        if (nextPrice <= 0) {
          return lowest;
        }
        if (lowest == null || nextPrice < lowest) {
          return nextPrice;
        }
        return lowest;
      },
    );
    final ratingLabel =
        '${getDisplayRating(verified: provider.isVerified, rating: provider.rating)}${provider.reviewCount != null ? ' | ${provider.reviewCount} reviews' : ''}';
    final availabilityLabel = provider.openNow
        ? 'Open now'
        : provider.availabilityStatus ??
            (provider.availabilitySlots.isNotEmpty ? 'Available today' : getResponseTimeLabel(provider.responseTimeLabel));

    return AppCard(
      variant: AppCardVariant.service,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.primaryPurple.withValues(alpha: 0.12),
                child: Text(
                  provider.name.characters.first.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.primaryPurple,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.primaryPurple.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        (provider.subcategory ?? provider.category).toUpperCase(),
                        style: AppTextStyles.caption.copyWith(color: AppColors.primaryPurple),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(provider.name, style: AppTextStyles.h3),
                  ],
                ),
              ),
              AppBadge(
                label: availabilityLabel,
                tone: provider.openNow ? AppBadgeTone.success : AppBadgeTone.info,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _MiniInfo(
                icon: Icons.star_rounded,
                iconColor: AppColors.accentGold,
                label: ratingLabel,
              ),
              _MiniInfo(
                icon: Icons.place_outlined,
                iconColor: AppColors.primaryPurple,
                label: provider.area ?? provider.town ?? getDisplayDistance(provider.distanceKm, provider.location),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            provider.description ?? 'Trusted local provider ready for bookings.',
            style: AppTextStyles.bodyMuted,
          ),
          const SizedBox(height: 12),
          TrustRow(
            verified: provider.isVerified,
            ratingLabel: ratingLabel,
            distanceLabel: getDisplayDistance(provider.distanceKm, provider.location),
            completedLabel: provider.followersCount != null ? '${provider.followersCount} followers' : getCompletedLabel(count: provider.services.length * 6),
            responseLabel: getResponseTimeLabel(provider.responseTimeLabel),
          ),
          const SizedBox(height: 14),
          Text(
            fromPrice == null ? 'Price on request' : 'From ${getDisplayPrice(fromPrice.toString())}',
            style: AppTextStyles.h3.copyWith(fontSize: 15),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Book',
                  onPressed: () => context.push('/book/${provider.id}'),
                ),
              ),
              const SizedBox(width: 10),
              QuickCallButton(phone: provider.phone),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniInfo extends StatelessWidget {
  const _MiniInfo({
    required this.icon,
    required this.iconColor,
    required this.label,
  });

  final IconData icon;
  final Color iconColor;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: iconColor),
          const SizedBox(width: 6),
          Text(label, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
