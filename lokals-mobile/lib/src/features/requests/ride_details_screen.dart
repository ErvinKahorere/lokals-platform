import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/discovery/discovery_repository.dart';
import '../../../core/theme/app_colors.dart';
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
    const steps = ['searching', 'driver_assigned', 'arrived', 'in_progress', 'completed', 'cancelled'];

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
                                Text(_rideTypeLabel(item.rideType), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                                const SizedBox(height: 4),
                                AppBadge(label: item.statusLabel ?? _statusLabel(item.trackingStatus ?? item.status)),
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
                      if ((item.referenceCode ?? '').isNotEmpty) _InfoRow(label: 'Reference', value: item.referenceCode!),
                      if (item.estimatedEtaMinutes != null) _InfoRow(label: 'ETA', value: '${item.estimatedEtaMinutes} min'),
                      if ((item.notes ?? '').isNotEmpty) _InfoRow(label: 'Notes', value: item.notes!),
                      const SizedBox(height: 14),
                      AppCard(
                        color: AppColors.neutralSoftAlt,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const CircleAvatar(
                                  backgroundColor: Color(0xFFEDE9FE),
                                  child: Icon(Icons.local_taxi_outlined, color: AppColors.primaryPurple),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.driverName?.trim().isNotEmpty == true ? item.driverName! : 'Verified taxi operator pending',
                                        style: const TextStyle(fontWeight: FontWeight.w700),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        (item.driverPhone ?? '').isNotEmpty
                                            ? item.driverPhone!
                                            : 'A driver contact will appear once a nearby taxi accepts your ride.',
                                        style: const TextStyle(color: AppColors.mutedText),
                                      ),
                                      if ((item.vehicleLabel ?? '').isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text('Vehicle: ${item.vehicleLabel}', style: const TextStyle(color: AppColors.mutedText)),
                                      ],
                                      if ((item.driverVehicleRegistration ?? '').isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text('Plate: ${item.driverVehicleRegistration}', style: const TextStyle(color: AppColors.mutedText)),
                                      ],
                                      if (item.driverRating != null) ...[
                                        const SizedBox(height: 4),
                                        Text('Driver rating: ${item.driverRating!.toStringAsFixed(1)}/5', style: const TextStyle(color: AppColors.mutedText)),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            if ((item.driverPhone ?? '').isNotEmpty) ...[
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  AppButton(
                                    label: 'Call',
                                    expanded: false,
                                    variant: AppButtonVariant.secondary,
                                    onPressed: () => const ContactActionService().call(context, item.driverPhone!),
                                  ),
                                  AppButton(
                                    label: 'WhatsApp',
                                    expanded: false,
                                    onPressed: () => const ContactActionService().openWhatsApp(
                                      context,
                                      phone: item.driverPhone!,
                                      name: item.driverName,
                                      message: 'Hi, I am tracking my LOKALS ride and need an update.',
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                StatusStepper(
                  steps: steps,
                  current: _rideStepperStatus(item.trackingStatus ?? item.status),
                  updatedAt: item.updatedAt,
                ),
              ],
            ),
            loading: () => const AppCard(child: LoadingSkeleton(height: 120)),
            error: (error, _) => EmptyState(
              title: 'Ride details unavailable',
              body: 'We could not refresh this ride right now. Check your connection and try again.',
              actionLabel: 'Retry',
              onAction: () => ref.invalidate(rideDetailsProvider(rideId)),
            ),
          ),
        ],
      ),
    );
  }
}

String _rideStepperStatus(String? status) {
  switch (status) {
    case 'accepted':
      return 'driver_assigned';
    default:
      return status ?? 'searching';
  }
}

String _statusLabel(String? status) {
  switch (status) {
    case 'searching':
      return 'Searching for driver';
    case 'driver_assigned':
    case 'accepted':
      return 'Driver assigned';
    case 'arrived':
      return 'Driver arrived';
    case 'in_progress':
      return 'Trip in progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return (status ?? 'searching').replaceAll('_', ' ');
  }
}

String _rideTypeLabel(String? rideType) {
  switch (rideType) {
    case null:
    case '':
      return 'Standard ride';
    case 'local_taxi':
      return 'Standard local taxi';
    default:
      return '$rideType ride';
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
