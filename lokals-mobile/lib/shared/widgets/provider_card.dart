import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../src/core/experience_helpers.dart';
import '../../src/core/models.dart';
import '../../core/theme/app_text_styles.dart';
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
    final fromPrice =
        provider.services.isNotEmpty ? provider.services.first.price : null;

    return AppCard(
      variant: AppCardVariant.service,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: const Color(0xFFEDE9FE),
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
                        color: const Color(0xFFEDE9FE),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        provider.category.toUpperCase(),
                        style: AppTextStyles.caption.copyWith(color: AppColors.primaryPurple),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(provider.name, style: AppTextStyles.h3),
                  ],
                ),
              ),
              AppBadge(
                label: provider.availabilitySlots.isNotEmpty ? 'Available today' : 'Open',
                tone: AppBadgeTone.success,
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
                label: getDisplayRating(verified: provider.isVerified),
              ),
              _MiniInfo(
                icon: Icons.place_outlined,
                iconColor: AppColors.primaryPurple,
                label: getDisplayDistance(provider.distanceKm, provider.location),
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
            ratingLabel: getDisplayRating(verified: provider.isVerified),
            distanceLabel: getDisplayDistance(provider.distanceKm, provider.location),
            completedLabel: getCompletedLabel(count: provider.services.length * 6),
            responseLabel: provider.availabilitySlots.isNotEmpty ? 'Available today' : getResponseTimeLabel(),
          ),
          const SizedBox(height: 14),
          Text(
            fromPrice == null ? 'Price on request' : 'From ${getDisplayPrice(fromPrice)}',
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
        border: Border.all(color: const Color(0xFFE2E8F0)),
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
