import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class AccommodationDetailsScreen extends ConsumerWidget {
  const AccommodationDetailsScreen({super.key, required this.accommodationId});

  final String accommodationId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accommodation = ref.watch(accommodationDetailsProvider(accommodationId));

    return LokalsShell(
      title: 'Accommodation details',
      showBack: true,
      child: accommodation.when(
        data: (item) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            SectionTitle(
              title: item.title,
              subtitle: item.description ?? 'Local accommodation listing.',
            ),
            const SizedBox(height: 16),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(getDisplayPrice(item.price), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 6),
                  Text('per ${item.pricePeriod ?? 'month'}'),
                  const SizedBox(height: 12),
                  Text('${item.bedrooms ?? 0} bed • ${item.bathrooms ?? 0} bath'),
                  const SizedBox(height: 8),
                  Text(item.area ?? item.town ?? item.location ?? 'Windhoek', style: const TextStyle(color: Color(0xFF64748B))),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: PrimaryAction(label: 'Contact owner', onPressed: () {})),
                      const SizedBox(width: 10),
                      Expanded(child: AppButton(label: 'Save', variant: AppButtonVariant.secondary, onPressed: () {})),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Accommodation unavailable: $error')),
      ),
    );
  }
}
