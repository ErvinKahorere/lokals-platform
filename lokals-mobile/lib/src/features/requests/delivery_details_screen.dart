import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/discovery/discovery_repository.dart';
import '../../../core/theme/app_colors.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'status_stepper.dart';

class DeliveryDetailsScreen extends ConsumerWidget {
  const DeliveryDetailsScreen({super.key, required this.deliveryId});

  final String deliveryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final delivery = ref.watch(deliveryDetailsProvider(deliveryId));
    const steps = ['requested', 'accepted', 'picked_up', 'delivered', 'cancelled'];

    return LokalsShell(
      title: 'Delivery status',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Track your parcel request',
            subtitle: 'See the latest delivery status and contact details in one place.',
          ),
          const SizedBox(height: 16),
          delivery.when(
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
                                AppBadge(label: item.statusLabel ?? ((item.status == 'assigned' ? 'accepted' : item.status) ?? 'requested').replaceAll('_', ' ')),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _InfoRow(label: 'Pickup', value: item.pickupAddress),
                      _InfoRow(label: 'Drop-off', value: item.dropoffAddress),
                      _InfoRow(label: 'Parcel size', value: item.parcelSize ?? 'Medium'),
                      _InfoRow(label: 'Estimate', value: item.price == null ? 'Open estimate' : 'N\$ ${item.price}'),
                      if ((item.referenceCode ?? '').isNotEmpty) _InfoRow(label: 'Reference', value: item.referenceCode!),
                      if ((item.urgency ?? '').isNotEmpty) _InfoRow(label: 'Urgency', value: item.urgency!),
                      if ((item.weightKg ?? '').isNotEmpty) _InfoRow(label: 'Weight', value: '${item.weightKg} kg'),
                      if ((item.notes ?? '').isNotEmpty) _InfoRow(label: 'Notes', value: item.notes!),
                      const SizedBox(height: 14),
                      AppCard(
                        color: AppColors.neutralSoftAlt,
                        child: Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor: Color(0xFFE0F2FE),
                              child: Icon(Icons.local_shipping_outlined, color: AppColors.softBlue),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.driverName?.trim().isNotEmpty == true ? item.driverName! : 'Courier operator pending',
                                    style: const TextStyle(fontWeight: FontWeight.w700),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    (item.driverPhone ?? '').isNotEmpty
                                        ? item.driverPhone!
                                        : 'A courier contact will appear here once the request is accepted.',
                                    style: const TextStyle(color: AppColors.mutedText),
                                  ),
                                  if ((item.driverVehicleType ?? '').isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text('Vehicle: ${item.driverVehicleType}', style: const TextStyle(color: AppColors.mutedText)),
                                  ],
                                  if ((item.driverVehicleRegistration ?? '').isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text('Plate: ${item.driverVehicleRegistration}', style: const TextStyle(color: AppColors.mutedText)),
                                  ],
                                  if (item.driverRating != null) ...[
                                    const SizedBox(height: 4),
                                    Text('Courier rating: ${item.driverRating!.toStringAsFixed(1)}/5', style: const TextStyle(color: AppColors.mutedText)),
                                  ],
                                ],
                              ),
                            ),
                            if ((item.driverPhone ?? '').isNotEmpty)
                              AppButton(
                                label: 'Call',
                                expanded: false,
                                variant: AppButtonVariant.secondary,
                                onPressed: () => const ContactActionService().call(context, item.driverPhone!),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      AppCard(
                        color: AppColors.neutralSoftAlt,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Proof of delivery', style: TextStyle(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            Text(
                              item.proofOfDeliveryLabel ?? 'Proof of delivery will appear here once the courier confirms handoff.',
                              style: const TextStyle(color: AppColors.mutedText),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                StatusStepper(
                  steps: steps,
                  current: item.status == 'assigned' ? 'accepted' : item.status ?? 'requested',
                  updatedAt: item.updatedAt,
                ),
              ],
            ),
            loading: () => const AppCard(child: LoadingSkeleton(height: 120)),
            error: (error, _) => EmptyState(
              title: 'Unable to load delivery',
              body: 'Please try again in a moment.',
              actionLabel: 'Retry',
              onAction: () => ref.invalidate(deliveryDetailsProvider(deliveryId)),
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
