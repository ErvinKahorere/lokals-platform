import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/discovery/discovery_repository.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'status_stepper.dart';

class RideDetailsScreen extends ConsumerWidget {
  const RideDetailsScreen({super.key, required this.rideId});

  final String rideId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ride = ref.watch(rideDetailsProvider(rideId));
    const steps = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];

    return LokalsShell(
      title: 'Ride status',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Track your ride request',
            subtitle: 'Watch ride progress and reach the driver quickly if needed.',
          ),
          const SizedBox(height: 16),
          ride.when(
            data: (item) => Column(
              children: [
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const CircleAvatar(
                            radius: 24,
                            backgroundColor: Color(0xFFEEF2FF),
                            child: Icon(Icons.local_taxi_outlined, color: Colors.deepPurple),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.rideType ?? 'Standard ride', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                                const SizedBox(height: 4),
                                AppBadge(label: (item.status ?? 'requested').replaceAll('_', ' ')),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _InfoRow(label: 'Pickup', value: item.pickupLocation),
                      _InfoRow(label: 'Destination', value: item.dropoffLocation),
                      _InfoRow(label: 'Trip purpose', value: item.tripPurpose ?? 'General trip'),
                      _InfoRow(label: 'Fare estimate', value: item.fareEstimate == null ? 'Open fare' : 'N\$ ${item.fareEstimate}'),
                      if ((item.notes ?? '').isNotEmpty) _InfoRow(label: 'Notes', value: item.notes!),
                      const SizedBox(height: 14),
                      if ((item.driverPhone ?? '').isNotEmpty)
                        AppButton(
                          label: 'Call driver',
                          expanded: false,
                          variant: AppButtonVariant.secondary,
                          onPressed: () => const ContactActionService().call(context, item.driverPhone!),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                StatusStepper(
                  steps: steps,
                  current: item.status ?? 'requested',
                  updatedAt: item.updatedAt,
                ),
              ],
            ),
            loading: () => const AppCard(child: LoadingSkeleton(height: 120)),
            error: (error, _) => EmptyState(
              title: 'Unable to load ride',
              body: 'Please try again in a moment.',
              actionLabel: 'Retry',
              onAction: () => ref.invalidate(rideDetailsProvider(rideId)),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.grey)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
