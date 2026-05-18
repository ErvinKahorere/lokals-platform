import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/discovery/discovery_repository.dart';
import '../../../core/theme/app_colors.dart';
import '../../core/models.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../../../shared/widgets/location_preview_map.dart';
import '../../../shared/widgets/transport_surface.dart';
import 'status_stepper.dart';

class RideDetailsScreen extends ConsumerStatefulWidget {
  const RideDetailsScreen({super.key, required this.rideId});

  final String rideId;

  @override
  ConsumerState<RideDetailsScreen> createState() => _RideDetailsScreenState();
}

class _RideDetailsScreenState extends ConsumerState<RideDetailsScreen> {
  String _activeTab = 'overview';

  @override
  Widget build(BuildContext context) {
    final ride = ref.watch(rideDetailsProvider(widget.rideId));
    const steps = ['searching', 'driver_assigned', 'arrived', 'in_progress', 'completed', 'cancelled'];

    return LokalsShell(
      title: 'Ride status',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const TransportHeroBanner(
            title: 'Ride workspace',
            subtitle: 'Keep route, status, contact, and next steps separated into cleaner tabs.',
            icon: Icons.local_taxi_outlined,
          ),
          const SizedBox(height: 16),
          TransportSegmentTabs(
            items: const [
              (value: 'overview', label: 'Overview'),
              (value: 'route', label: 'Route'),
              (value: 'timeline', label: 'Timeline'),
              (value: 'contact', label: 'Contact'),
            ],
            value: _activeTab,
            onChanged: (value) => setState(() => _activeTab = value),
          ),
          const SizedBox(height: 16),
          ride.when(
            data: (item) {
              final pickupPoint = item.pickupLatitude != null && item.pickupLongitude != null
                  ? LocationPointModel(latitude: item.pickupLatitude!, longitude: item.pickupLongitude!)
                  : null;
              final dropoffPoint = item.dropoffLatitude != null && item.dropoffLongitude != null
                  ? LocationPointModel(latitude: item.dropoffLatitude!, longitude: item.dropoffLongitude!)
                  : null;

              return Column(
                children: [
                  if (_activeTab == 'overview')
                    TransportPanel(
                      title: 'Ride overview',
                      subtitle: 'A simpler view of the ride, fare, and trip context.',
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
                          Row(
                            children: [
                              Expanded(child: TransportMiniStat(label: 'Fare estimate', value: item.fareEstimate == null ? 'Open fare' : 'N\$ ${item.fareEstimate}')),
                              const SizedBox(width: 10),
                              Expanded(child: TransportMiniStat(label: 'ETA', value: item.estimatedEtaMinutes == null ? 'Pending' : '${item.estimatedEtaMinutes} min')),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(child: TransportMiniStat(label: 'Pickup', value: item.pickupLocation)),
                              const SizedBox(width: 10),
                              Expanded(child: TransportMiniStat(label: 'Destination', value: item.dropoffLocation)),
                            ],
                          ),
                          if ((item.notes ?? '').isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Text(item.notes!, style: const TextStyle(color: AppColors.mutedText)),
                          ],
                        ],
                      ),
                    ),
                  if (_activeTab == 'route')
                    Column(
                      children: [
                        TransportPanel(
                          title: 'Route preview',
                          subtitle: 'A single dominant route preview with pickup and destination context.',
                          child: Column(
                            children: [
                              LocationPreviewMap(primary: pickupPoint, secondary: dropoffPoint),
                              const SizedBox(height: 12),
                              _InfoRow(label: 'Pickup', value: item.pickupLocation),
                              _InfoRow(label: 'Destination', value: item.dropoffLocation),
                              _InfoRow(label: 'Trip purpose', value: item.tripPurpose ?? 'General trip'),
                              if (item.estimatedDistanceKm != null) _InfoRow(label: 'Estimated distance', value: '${item.estimatedDistanceKm!.toStringAsFixed(1)} km'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  if (_activeTab == 'timeline')
                    TransportPanel(
                      title: 'Status timeline',
                      subtitle: 'Follow the current stage without reading through the whole detail page.',
                      child: StatusStepper(
                        steps: steps,
                        current: _rideStepperStatus(item.trackingStatus ?? item.status),
                        updatedAt: item.updatedAt,
                      ),
                    ),
                  if (_activeTab == 'contact')
                    TransportPanel(
                      title: 'Driver contact',
                      subtitle: 'Reach the assigned operator quickly when contact details are available.',
                      child: AppCard(
                        color: AppColors.neutralSoftAlt,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.driverName?.trim().isNotEmpty == true ? item.driverName! : 'Verified taxi operator pending',
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              (item.driverPhone ?? '').isNotEmpty
                                  ? item.driverPhone!
                                  : 'A driver contact will appear once a nearby taxi accepts your ride.',
                              style: const TextStyle(color: AppColors.mutedText),
                            ),
                            if ((item.vehicleLabel ?? '').isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text('Vehicle: ${item.vehicleLabel}', style: const TextStyle(color: AppColors.mutedText)),
                            ],
                            if ((item.driverVehicleRegistration ?? '').isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text('Plate: ${item.driverVehicleRegistration}', style: const TextStyle(color: AppColors.mutedText)),
                            ],
                            if (item.driverRating != null) ...[
                              const SizedBox(height: 6),
                              Text('Driver rating: ${item.driverRating!.toStringAsFixed(1)}/5', style: const TextStyle(color: AppColors.mutedText)),
                            ],
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
                    ),
                ],
              );
            },
            loading: () => const AppCard(child: LoadingSkeleton(height: 120)),
            error: (error, _) => EmptyState(
              title: 'Ride details unavailable',
              body: 'We could not refresh this ride right now. Check your connection and try again.',
              actionLabel: 'Retry',
              onAction: () => ref.invalidate(rideDetailsProvider(widget.rideId)),
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
