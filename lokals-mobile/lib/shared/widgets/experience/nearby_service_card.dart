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
                    Text(provider.category.toUpperCase(), style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(provider.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
              Text(
                fromPrice == null ? 'Book now' : 'From ${getDisplayPrice(fromPrice)}',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(provider.description ?? 'Trusted provider with quick local availability.'),
          const SizedBox(height: 14),
          TrustRow(
            verified: provider.isVerified,
            ratingLabel: getDisplayRating(verified: provider.isVerified),
            distanceLabel: getDisplayDistance(provider.distanceKm, provider.location),
            completedLabel: getCompletedLabel(count: provider.services.length * 6),
            responseLabel: getResponseTimeLabel(),
          ),
          const SizedBox(height: 14),
          ContactActions(name: provider.name, phone: provider.phone),
        ],
      ),
    );
  }
}

