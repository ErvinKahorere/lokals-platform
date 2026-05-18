import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
  ConsumerState<DeliveryDetailsScreen> createState() => _DeliveryDetailsScreenState();
}

class _DeliveryDetailsScreenState extends ConsumerState<DeliveryDetailsScreen> {
  String _activeTab = 'overview';

  @override
  Widget build(BuildContext context) {
    final delivery = ref.watch(deliveryDetailsProvider(widget.deliveryId));
    const steps = ['searching', 'courier_assigned', 'pickup_confirmed', 'in_transit', 'delivered', 'cancelled'];

    return LokalsShell(
      title: 'Delivery status',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const TransportHeroBanner(
            title: 'Delivery workspace',
            subtitle: 'Keep route, proof, contact, and status updates split into focused delivery tabs.',
            icon: Icons.inventory_2_outlined,
            colors: [Color(0xFFF59E0B), Color(0xFFF97316)],
          ),
          const SizedBox(height: 16),
          TransportSegmentTabs(
            items: const [
              (value: 'overview', label: 'Overview'),
              (value: 'route', label: 'Route'),
              (value: 'timeline', label: 'Timeline'),
              (value: 'contact', label: 'Contact'),
              (value: 'proof', label: 'Proof'),
            ],
            value: _activeTab,
            onChanged: (value) => setState(() => _activeTab = value),
          ),
          const SizedBox(height: 16),
          delivery.when(
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
                      title: 'Delivery overview',
                      subtitle: 'A simpler summary of the parcel, pricing, and current status.',
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const CircleAvatar(
                                radius: 24,
                                backgroundColor: Color(0xFFFEF3C7),
                                child: Icon(Icons.inventory_2_outlined, color: Colors.black87),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.itemDescription, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                                    const SizedBox(height: 4),
                                    AppBadge(label: item.statusLabel ?? _deliveryStatusLabel(item.trackingStatus ?? item.status)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(child: TransportMiniStat(label: 'Estimate', value: item.price == null ? 'Open' : 'N\$ ${item.price}')),
                              const SizedBox(width: 10),
                              Expanded(child: TransportMiniStat(label: 'Parcel size', value: item.parcelSize ?? 'Medium')),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(child: TransportMiniStat(label: 'Urgency', value: item.urgency ?? 'Standard')),
                              const SizedBox(width: 10),
                              Expanded(child: TransportMiniStat(label: 'Weight', value: (item.weightKg ?? '').isEmpty ? 'Pending' : '${item.weightKg} kg')),
                            ],
                          ),
                        ],
                      ),
                    ),
                  if (_activeTab == 'route')
                    TransportPanel(
                      title: 'Route preview',
                      subtitle: 'A single dominant route preview with pickup and drop-off context.',
                      child: Column(
                        children: [
                          LocationPreviewMap(primary: pickupPoint, secondary: dropoffPoint),
                          const SizedBox(height: 12),
                          _InfoRow(label: 'Pickup', value: item.pickupAddress),
                          _InfoRow(label: 'Drop-off', value: item.dropoffAddress),
                          if (item.estimatedDistanceKm != null) _InfoRow(label: 'Estimated distance', value: '${item.estimatedDistanceKm!.toStringAsFixed(1)} km'),
                          if ((item.notes ?? '').isNotEmpty) _InfoRow(label: 'Notes', value: item.notes!),
                        ],
                      ),
                    ),
                  if (_activeTab == 'timeline')
                    TransportPanel(
                      title: 'Status timeline',
                      subtitle: 'Follow the current delivery stage without scanning the whole detail screen.',
                      child: StatusStepper(
                        steps: steps,
                        current: _deliveryStepperStatus(item.trackingStatus ?? item.status),
                        updatedAt: item.updatedAt,
                      ),
                    ),
                  if (_activeTab == 'contact')
                    TransportPanel(
                      title: 'Courier contact',
                      subtitle: 'Reach the assigned courier quickly when contact details are available.',
                      child: AppCard(
                        color: AppColors.neutralSoftAlt,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.driverName?.trim().isNotEmpty == true ? item.driverName! : 'Courier operator pending',
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              (item.driverPhone ?? '').isNotEmpty
                                  ? item.driverPhone!
                                  : 'A courier contact will appear here once the request is accepted.',
                              style: const TextStyle(color: AppColors.mutedText),
                            ),
                            if ((item.driverVehicleType ?? '').isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text('Vehicle: ${item.driverVehicleType}', style: const TextStyle(color: AppColors.mutedText)),
                            ],
                            if ((item.driverVehicleRegistration ?? '').isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text('Plate: ${item.driverVehicleRegistration}', style: const TextStyle(color: AppColors.mutedText)),
                            ],
                            if (item.driverRating != null) ...[
                              const SizedBox(height: 6),
                              Text('Courier rating: ${item.driverRating!.toStringAsFixed(1)}/5', style: const TextStyle(color: AppColors.mutedText)),
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
                                      message: 'Hi, I am tracking my LOKALS delivery and need an update.',
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  if (_activeTab == 'proof')
                    TransportPanel(
                      title: 'Proof of delivery',
                      subtitle: 'Keep the handoff confirmation separate from route and contact details.',
                      child: AppCard(
                        color: AppColors.neutralSoftAlt,
                        child: Text(
                          item.proofOfDeliveryLabel ?? 'Proof of delivery will appear here once the courier confirms handoff.',
                          style: const TextStyle(color: AppColors.mutedText),
                        ),
                      ),
                    ),
                ],
              );
            },
            loading: () => const AppCard(child: LoadingSkeleton(height: 120)),
            error: (error, _) => EmptyState(
              title: 'Delivery details unavailable',
              body: 'We could not refresh this delivery right now. Check your connection and try again.',
              actionLabel: 'Retry',
              onAction: () => ref.invalidate(deliveryDetailsProvider(widget.deliveryId)),
            ),
          ),
        ],
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
