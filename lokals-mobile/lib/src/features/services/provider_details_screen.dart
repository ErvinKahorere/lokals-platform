import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../../shared/widgets/experience/quick_call_button.dart';
import '../../../shared/widgets/experience/trust_row.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/shell.dart';
import 'services_repository.dart';

class ProviderDetailsScreen extends ConsumerWidget {
  const ProviderDetailsScreen({super.key, required this.providerId});

  final String providerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final provider = ref.watch(providerDetailsProvider(providerId));

    return LokalsShell(
      title: 'Provider',
      showBack: true,
      child: provider.when(
        data: (item) => Stack(
          children: [
            ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 130),
              children: [
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 34,
                            child: Text(item.name.characters.first.toUpperCase()),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.category.toUpperCase(),
                                  style: const TextStyle(
                                    color: Color(0xFF0F766E),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  item.name,
                                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
                          AppBadge(
                            label: item.isVerified ? 'Verified' : item.status,
                            tone: item.isVerified ? AppBadgeTone.success : AppBadgeTone.neutral,
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(item.description ?? ''),
                      const SizedBox(height: 12),
                      TrustRow(
                        verified: item.isVerified,
                        ratingLabel: getDisplayRating(verified: item.isVerified),
                        distanceLabel: getDisplayDistance(item.distanceKm, item.location),
                        completedLabel: getCompletedLabel(count: item.services.length * 6),
                        responseLabel: getResponseTimeLabel(),
                      ),
                      const SizedBox(height: 16),
                      ContactActions(name: item.name, phone: item.phone),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Services',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                ...item.services.map(
                  (service) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(service.name),
                        subtitle: Text('${service.durationMinutes} min • Available today'),
                        trailing: Text(getDisplayPrice(service.price)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Availability',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                ...item.availabilitySlots.map(
                  (slot) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text('Day ${slot.dayOfWeek}'),
                        subtitle: Text('${slot.startTime} - ${slot.endTime}'),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Positioned(
              left: 20,
              right: 20,
              bottom: 18,
              child: Row(
                children: [
                  QuickCallButton(phone: item.phone),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppButton(
                      label: 'Book Appointment',
                      onPressed: () => context.push('/book/${item.id}'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) =>
            Center(child: Text('Failed to load provider: $error')),
      ),
    );
  }
}
