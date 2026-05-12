import 'package:flutter/material.dart';

import '../../../src/core/models.dart';
import '../../../src/core/experience_helpers.dart';
import '../app_card.dart';
import 'contact_actions.dart';
import 'trust_row.dart';

class NearbyServiceCard extends StatelessWidget {
  const NearbyServiceCard({super.key, required this.provider});

  final ProviderModel provider;

  @override
  Widget build(BuildContext context) {
    final fromPrice =
        provider.services.isNotEmpty ? provider.services.first.price : null;
    final locationLabel = provider.area ??
        provider.town ??
        getDisplayDistance(provider.distanceKm, provider.location);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (provider.subcategory ?? provider.category).toUpperCase(),
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      provider.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, height: 1.2),
                    ),
                  ],
                ),
              ),
              Text(
                fromPrice == null ? 'Book now' : 'From ${getDisplayPrice(fromPrice)}',
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            provider.description ?? 'Trusted provider with quick local availability.',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          TrustRow(
            verified: provider.isVerified,
            ratingLabel: getDisplayRating(verified: provider.isVerified),
            distanceLabel: locationLabel,
            completedLabel: getCompletedLabel(count: provider.services.length * 6),
            responseLabel: getResponseTimeLabel(),
            compact: true,
          ),
          const SizedBox(height: 12),
          ContactActions(name: provider.name, phone: provider.phone, compact: true),
        ],
      ),
    );
  }
}
