import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/discovery/discovery_repository.dart';
import '../../core/models.dart';
import '../../../core/theme/app_colors.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../../../shared/widgets/location_preview_map.dart';
import '../../../shared/widgets/transport_surface.dart';
import 'status_stepper.dart';

class DeliveryDetailsScreen extends ConsumerStatefulWidget {
  const DeliveryDetailsScreen({super.key, required this.deliveryId});

  final String deliveryId;

  @override
  ConsumerState<DeliveryDetailsScreen> createState() =>
      _DeliveryDetailsScreenState();
}

class _DeliveryDetailsScreenState extends ConsumerState<DeliveryDetailsScreen> {
  String _activeTab = 'overview';

  @override
  Widget build(BuildContext context) {
    final delivery = ref.watch(deliveryDetailsProvider(widget.deliveryId));
    const steps = [
      'searching',
      'courier_assigned',
      'pickup_confirmed',
      'in_transit',
      'delivered',
      'cancelled',
    ];

    return LokalsShell(
      title: 'Delivery details',
      showBack: true,
      child: delivery.when(
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
                330.0,
                450.0,
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
                                  _deliveryStatusLabel(
                                    item.trackingStatus ?? item.status,
                                  ),
                              tone: AppBadgeTone.success,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _deliveryTitle(item),
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item.status == 'in_transit'
                                  ? 'The courier is moving this parcel now.'
                                  : 'Follow each handoff step in one place.',
                              style: const TextStyle(
                                color: AppColors.mutedText,
                                fontWeight: FontWeight.w600,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 12),
                            TransportSegmentTabs(
                              items: const [
                                (value: 'overview', label: 'Overview'),
                                (value: 'route', label: 'Route'),
                                (value: 'timeline', label: 'Timeline'),
                                (value: 'contact', label: 'Contact'),
                                (value: 'proof', label: 'Proof'),
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
                                            primaryValue: item.price == null
                                                ? 'Open'
                                                : 'N\$ ${item.price}',
                                            secondaryLabel: 'Parcel',
                                            secondaryValue:
                                                item.parcelSize ?? 'Medium',
                                          ),
                                          const SizedBox(height: 12),
                                          _SheetInfoCard(
                                            children: [
                                              _InfoRow(
                                                label: 'Pickup',
                                                value: item.pickupAddress,
                                              ),
                                              _InfoRow(
                                                label: 'Drop-off',
                                                value: item.dropoffAddress,
                                              ),
                                              _InfoRow(
                                                label: 'Urgency',
                                                value:
                                                    item.urgency ?? 'Standard',
                                              ),
                                              _InfoRow(
                                                label: 'Weight',
                                                value:
                                                    (item.weightKg ?? '')
                                                        .isEmpty
                                                    ? 'Pending'
                                                    : '${item.weightKg} kg',
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
                                            value: item.pickupAddress,
                                          ),
                                          _InfoRow(
                                            label: 'Drop-off',
                                            value: item.dropoffAddress,
                                          ),
                                          if (item.estimatedDistanceKm != null)
                                            _InfoRow(
                                              label: 'Estimated distance',
                                              value:
                                                  '${item.estimatedDistanceKm!.toStringAsFixed(1)} km',
                                            ),
                                          if ((item.notes ?? '').isNotEmpty)
                                            _InfoRow(
                                              label: 'Notes',
                                              value: item.notes!,
                                            ),
                                        ],
                                      ),
                                    if (_activeTab == 'timeline')
                                      _SheetInfoCard(
                                        children: [
                                          StatusStepper(
                                            steps: steps,
                                            current: _deliveryStepperStatus(
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
                                          Wrap(
                                            spacing: 8,
                                            runSpacing: 8,
                                            children: const [
                                              AppBadge(
                                                label:
                                                    'Verified courier when available',
                                                tone: AppBadgeTone.success,
                                              ),
                                              AppBadge(
                                                label: 'Track parcel status',
                                                tone: AppBadgeTone.info,
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 10),
                                          Text(
                                            item.driverName
                                                        ?.trim()
                                                        .isNotEmpty ==
                                                    true
                                                ? item.driverName!
                                                : 'Courier operator pending',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 16,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            (item.driverPhone ?? '').isNotEmpty
                                                ? item.driverPhone!
                                                : 'A courier contact will appear here once the request is accepted.',
                                            style: const TextStyle(
                                              color: AppColors.mutedText,
                                            ),
                                          ),
                                          if ((item.driverVehicleType ?? '')
                                              .isNotEmpty) ...[
                                            const SizedBox(height: 10),
                                            _InfoRow(
                                              label: 'Vehicle',
                                              value: item.driverVehicleType!,
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
                                                                'Hi, I am tracking my LOKALS delivery and need an update.',
                                                          ),
                                                ),
                                              ],
                                            ),
                                          ],
                                          const SizedBox(height: 12),
                                          Container(
                                            width: double.infinity,
                                            padding: const EdgeInsets.all(14),
                                            decoration: BoxDecoration(
                                              color: AppColors.warningSoft,
                                              borderRadius:
                                                  BorderRadius.circular(18),
                                            ),
                                            child: const Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Safe handling note',
                                                  style: TextStyle(
                                                    fontWeight:
                                                        FontWeight.w800,
                                                  ),
                                                ),
                                                SizedBox(height: 4),
                                                Text(
                                                  'Confirm the courier, vehicle, and handoff before releasing the parcel.',
                                                  style: TextStyle(
                                                    color:
                                                        AppColors.mutedText,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(height: 12),
                                          AppButton(
                                            label: 'Emergency shortcut',
                                            expanded: false,
                                            variant:
                                                AppButtonVariant.danger,
                                            onPressed: () =>
                                                context.push('/sos'),
                                          ),
                                        ],
                                      ),
                                    if (_activeTab == 'proof')
                                      _SheetInfoCard(
                                        children: [
                                          Text(
                                            item.proofOfDeliveryLabel ??
                                                'Proof of delivery will appear here once the courier confirms handoff.',
                                            style: const TextStyle(
                                              color: AppColors.mutedText,
                                            ),
                                          ),
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
          title: 'Delivery details unavailable',
          body:
              'We could not refresh this delivery right now. Check your connection and try again.',
          actionLabel: 'Retry',
          onAction: () =>
              ref.invalidate(deliveryDetailsProvider(widget.deliveryId)),
        ),
      ),
    );
  }
}

String _deliveryStepperStatus(String? status) {
  switch (status) {
    case 'accepted':
    case 'assigned':
      return 'courier_assigned';
    default:
      return status ?? 'searching';
  }
}

String _deliveryStatusLabel(String? status) {
  switch (status) {
    case 'searching':
    case 'requested':
      return 'Searching for courier';
    case 'courier_assigned':
    case 'accepted':
    case 'assigned':
      return 'Courier assigned';
    case 'pickup_confirmed':
      return 'Pickup confirmed';
    case 'in_transit':
      return 'In transit';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return (status ?? 'searching').replaceAll('_', ' ');
  }
}

String _deliveryTitle(DeliveryModel item) {
  final driverName = item.driverName?.trim();
  if (driverName != null && driverName.isNotEmpty) {
    return '$driverName is on the way';
  }
  return 'Delivery details';
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
