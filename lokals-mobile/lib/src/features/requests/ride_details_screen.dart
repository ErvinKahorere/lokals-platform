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
    const steps = [
      'searching',
      'driver_assigned',
      'arrived',
      'in_progress',
      'completed',
      'cancelled',
    ];

    return LokalsShell(
      title: 'Ride details',
      showBack: true,
      child: ride.when(
        data: (item) {
          final pickupPoint =
              item.pickupLatitude != null && item.pickupLongitude != null
              ? LocationPointModel(
                  latitude: item.pickupLatitude!,
                  longitude: item.pickupLongitude!,
                )
              : null;
          final dropoffPoint =
              item.dropoffLatitude != null && item.dropoffLongitude != null
              ? LocationPointModel(
                  latitude: item.dropoffLatitude!,
                  longitude: item.dropoffLongitude!,
                )
              : null;

          return LayoutBuilder(
            builder: (context, constraints) {
              final sheetHeight = (constraints.maxHeight * 0.58).clamp(
                320.0,
                430.0,
              );
              return Stack(
                children: [
                  Positioned.fill(
                    child: LocationPreviewMap(
                      primary: pickupPoint,
                      secondary: dropoffPoint,
                      height: constraints.maxHeight,
                      showFrame: false,
                      showOpenAction: false,
                    ),
                  ),
                  Positioned.fill(
                    child: IgnorePointer(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withValues(alpha: 0.06),
                              Colors.white.withValues(alpha: 0.0),
                              Colors.black.withValues(alpha: 0.1),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: TransportBottomSheetCard(
                      maxHeight: sheetHeight,
                      child: SizedBox(
                        height: sheetHeight,
                        child: Column(
                          children: [
                            Container(
                              width: 42,
                              height: 4,
                              decoration: BoxDecoration(
                                color: AppColors.border,
                                borderRadius: BorderRadius.circular(999),
                              ),
                            ),
                            const SizedBox(height: 12),
                            AppBadge(
                              label:
                                  item.statusLabel ??
                                  _statusLabel(
                                    item.trackingStatus ?? item.status,
                                  ),
                              tone: AppBadgeTone.info,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _rideTitle(item),
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item.estimatedEtaMinutes == null
                                  ? 'Waiting for the next ride update'
                                  : 'Arriving in about ${item.estimatedEtaMinutes} min',
                              style: const TextStyle(
                                color: AppColors.mutedText,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 12),
                            TransportSegmentTabs(
                              items: const [
                                (value: 'overview', label: 'Overview'),
                                (value: 'route', label: 'Route'),
                                (value: 'timeline', label: 'Timeline'),
                                (value: 'contact', label: 'Contact'),
                              ],
                              value: _activeTab,
                              onChanged: (value) =>
                                  setState(() => _activeTab = value),
                            ),
                            const SizedBox(height: 12),
                            Expanded(
                              child: SingleChildScrollView(
                                child: Column(
                                  children: [
                                    if (_activeTab == 'overview')
                                      Column(
                                        children: [
                                          TransportSummaryRow(
                                            primaryLabel: 'Fare',
                                            primaryValue:
                                                item.fareEstimate == null
                                                ? 'Open fare'
                                                : 'N\$ ${item.fareEstimate}',
                                            secondaryLabel: 'ETA',
                                            secondaryValue:
                                                item.estimatedEtaMinutes == null
                                                ? 'Pending'
                                                : '${item.estimatedEtaMinutes} min',
                                          ),
                                          const SizedBox(height: 12),
                                          _SheetInfoCard(
                                            children: [
                                              _InfoRow(
                                                label: 'Pickup',
                                                value: item.pickupLocation,
                                              ),
                                              _InfoRow(
                                                label: 'Drop-off',
                                                value: item.dropoffLocation,
                                              ),
                                              _InfoRow(
                                                label: 'Trip purpose',
                                                value:
                                                    item.tripPurpose ??
                                                    'General trip',
                                              ),
                                              if ((item.notes ?? '').isNotEmpty)
                                                _InfoRow(
                                                  label: 'Notes',
                                                  value: item.notes!,
                                                ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    if (_activeTab == 'route')
                                      _SheetInfoCard(
                                        children: [
                                          _InfoRow(
                                            label: 'Pickup',
                                            value: item.pickupLocation,
                                          ),
                                          _InfoRow(
                                            label: 'Destination',
                                            value: item.dropoffLocation,
                                          ),
                                          if (item.estimatedDistanceKm != null)
                                            _InfoRow(
                                              label: 'Estimated distance',
                                              value:
                                                  '${item.estimatedDistanceKm!.toStringAsFixed(1)} km',
                                            ),
                                          _InfoRow(
                                            label: 'Ride type',
                                            value: _rideTypeLabel(
                                              item.rideType,
                                            ),
                                          ),
                                        ],
                                      ),
                                    if (_activeTab == 'timeline')
                                      _SheetInfoCard(
                                        children: [
                                          StatusStepper(
                                            steps: steps,
                                            current: _rideStepperStatus(
                                              item.trackingStatus ??
                                                  item.status,
                                            ),
                                            updatedAt: item.updatedAt,
                                          ),
                                        ],
                                      ),
                                    if (_activeTab == 'contact')
                                      _SheetInfoCard(
                                        children: [
                                          Text(
                                            item.driverName
                                                        ?.trim()
                                                        .isNotEmpty ==
                                                    true
                                                ? item.driverName!
                                                : 'Verified taxi operator pending',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 16,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            (item.driverPhone ?? '').isNotEmpty
                                                ? item.driverPhone!
                                                : 'A driver contact will appear once a nearby taxi accepts your ride.',
                                            style: const TextStyle(
                                              color: AppColors.mutedText,
                                            ),
                                          ),
                                          if ((item.vehicleLabel ?? '')
                                              .isNotEmpty) ...[
                                            const SizedBox(height: 10),
                                            _InfoRow(
                                              label: 'Vehicle',
                                              value: item.vehicleLabel!,
                                            ),
                                          ],
                                          if ((item.driverVehicleRegistration ??
                                                  '')
                                              .isNotEmpty)
                                            _InfoRow(
                                              label: 'Plate',
                                              value: item
                                                  .driverVehicleRegistration!,
                                            ),
                                          if ((item.driverPhone ?? '')
                                              .isNotEmpty) ...[
                                            const SizedBox(height: 12),
                                            Wrap(
                                              spacing: 8,
                                              runSpacing: 8,
                                              children: [
                                                AppButton(
                                                  label: 'Call',
                                                  expanded: false,
                                                  variant: AppButtonVariant
                                                      .secondary,
                                                  onPressed: () =>
                                                      const ContactActionService()
                                                          .call(
                                                            context,
                                                            item.driverPhone!,
                                                          ),
                                                ),
                                                AppButton(
                                                  label: 'WhatsApp',
                                                  expanded: false,
                                                  onPressed: () =>
                                                      const ContactActionService()
                                                          .openWhatsApp(
                                                            context,
                                                            phone: item
                                                                .driverPhone!,
                                                            name:
                                                                item.driverName,
                                                            message:
                                                                'Hi, I am tracking my LOKALS ride and need an update.',
                                                          ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ],
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        },
        loading: () => const AppCard(child: LoadingSkeleton(height: 120)),
        error: (error, _) => EmptyState(
          title: 'Ride details unavailable',
          body:
              'We could not refresh this ride right now. Check your connection and try again.',
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(rideDetailsProvider(widget.rideId)),
        ),
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

String _rideTitle(RideModel item) {
  final driverName = item.driverName?.trim();
  if (driverName != null && driverName.isNotEmpty) {
    return '$driverName is on the way';
  }
  return 'Ride details';
}

class _SheetInfoCard extends StatelessWidget {
  const _SheetInfoCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.neutralSoftAlt,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
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
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.mutedText,
            ),
          ),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
