import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'request_success_state.dart';
import '../../../shared/widgets/location_picker_map.dart';
import '../../../shared/widgets/location_preview_map.dart';
import '../../../shared/widgets/transport_surface.dart';

class DeliveryRequestScreen extends ConsumerStatefulWidget {
  const DeliveryRequestScreen({super.key});

  @override
  ConsumerState<DeliveryRequestScreen> createState() => _DeliveryRequestScreenState();
}

class _DeliveryRequestScreenState extends ConsumerState<DeliveryRequestScreen> {
  static const List<String> _locations = [
    'Home',
    'Work',
    'Okahandja taxi rank',
    'Okahandja State Clinic',
    'Okahandja Town Council',
    'Nau-Aib community hall',
  ];

  static const List<({String value, String label, String detail, int estimate})> _parcelSizes = [
    (value: 'small', label: 'Small envelope', detail: 'Light documents or medicine', estimate: 45),
    (value: 'medium', label: 'Medium parcel', detail: 'Groceries, gifts, or boxed goods', estimate: 75),
    (value: 'large', label: 'Large box', detail: 'Bulkier items needing extra care', estimate: 120),
  ];

  LocationPointModel? _pickupPoint;
  LocationPointModel? _dropoffPoint;
  String _urgency = 'standard';
  final _pickupController = TextEditingController(text: _locations.first);
  final _dropoffController = TextEditingController(text: _locations.last);
  final _weightController = TextEditingController(text: '2');
  final _itemController = TextEditingController();
  final _notesController = TextEditingController();
  String _parcelSize = 'medium';
  String _activeTab = 'request';
  String _mapTarget = 'pickup';
  XFile? _photo;
  bool _isBusy = false;
  String? _error;
  DeliveryModel? _successItem;

  int get _estimate => _parcelSizes.firstWhere((item) => item.value == _parcelSize).estimate;
  int get _estimatedTotal {
    final urgencyBonus = switch (_urgency) {
      'express' => 25,
      'priority' => 40,
      _ => 0,
    };
    final weight = double.tryParse(_weightController.text.trim()) ?? 0;
    final weightBonus = weight > 5 ? 18 : weight > 2 ? 10 : 0;
    return _estimate + urgencyBonus + weightBonus;
  }

  @override
  void dispose() {
    _weightController.dispose();
    _pickupController.dispose();
    _dropoffController.dispose();
    _itemController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final deliveries = ref.watch(deliveriesProvider);
    final activeDelivery = deliveries.asData?.value
        .where((item) => !['delivered', 'cancelled'].contains((item.status ?? '').toLowerCase()))
        .cast<DeliveryModel?>()
        .firstWhere((item) => item != null, orElse: () => null);

    return LokalsShell(
      title: 'Delivery',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const TransportHeroBanner(
            title: 'Delivery',
            subtitle: 'Request parcel delivery, keep one route preview visible, and jump back into active work quickly.',
            icon: Icons.local_shipping_outlined,
            colors: [Color(0xFFF59E0B), Color(0xFFF97316)],
          ),
          const SizedBox(height: 16),
          TransportSegmentTabs(
            items: const [
              (value: 'request', label: 'Request'),
              (value: 'recent', label: 'Recent'),
              (value: 'active', label: 'Active'),
            ],
            value: _activeTab,
            onChanged: (value) => setState(() => _activeTab = value),
          ),
          const SizedBox(height: 16),
          if (_successItem != null)
            RequestSuccessState(
              title: 'Delivery requested',
              body: 'Your parcel request is live. A nearby driver can confirm shortly.',
              meta: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${_successItem!.pickupAddress} to ${_successItem!.dropoffAddress}', style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text('Estimate: N\$ ${_successItem!.price ?? _estimatedTotal}', style: const TextStyle(color: AppColors.mutedText)),
                ],
              ),
              primaryLabel: 'View status',
              onPrimary: () => context.push('/delivery/${_successItem!.id}'),
              secondaryLabel: 'Back home',
              onSecondary: () => context.go('/'),
            )
          else if (_activeTab == 'recent')
            deliveries.when(
              data: (items) => items.isEmpty
                  ? const EmptyState(
                      title: 'No delivery requests yet',
                      body: 'Your recent Okahandja parcel requests will appear here.',
                    )
                  : Column(
                      children: items.take(5).map((item) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(20),
                            onTap: () => context.push('/delivery/${item.id}'),
                            child: LokalsCard(
                              child: ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text(item.itemDescription),
                                subtitle: Text('${item.pickupAddress} -> ${item.dropoffAddress}'),
                                trailing: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(item.price == null ? 'Open' : 'N\$ ${item.price}'),
                                    const SizedBox(height: 4),
                                    AppBadge(label: item.statusLabel ?? item.status ?? 'requested'),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
              loading: () => const AppCard(child: LoadingSkeleton(height: 120)),
              error: (error, _) => EmptyState(
                title: 'Unable to load deliveries',
                body: 'Please try again in a moment.',
                actionLabel: 'Retry',
                onAction: () => ref.invalidate(deliveriesProvider),
              ),
            )
          else if (_activeTab == 'active')
            activeDelivery != null
                ? TransportPanel(
                    title: 'Active delivery',
                    subtitle: 'The parcel request that currently needs attention first.',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${activeDelivery.pickupAddress} -> ${activeDelivery.dropoffAddress}',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${activeDelivery.parcelSize ?? 'Parcel'} | ${activeDelivery.statusLabel ?? activeDelivery.status ?? 'requested'}',
                          style: const TextStyle(color: AppColors.mutedText),
                        ),
                        const SizedBox(height: 16),
                        AppButton(
                          label: 'Open delivery workspace',
                          expanded: false,
                          onPressed: () => context.push('/delivery/${activeDelivery.id}'),
                        ),
                      ],
                    ),
                  )
                : const EmptyState(
                    title: 'No active delivery',
                    body: 'When a delivery is searching, accepted, or in transit, it will appear here.',
                  )
          else
            Column(
              children: [
                TransportPanel(
                  title: 'Request details',
                  subtitle: 'Keep pickup, parcel details, and the main route preview in one cleaner flow.',
                  child: Column(
                    children: [
                      LokalsTextField(
                        controller: _pickupController,
                        label: 'Pickup location',
                        hint: 'Enter pickup address or landmark',
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(
                        controller: _dropoffController,
                        label: 'Drop-off location',
                        hint: 'Enter drop-off address or landmark',
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          ActionChip(
                            avatar: const Icon(Icons.my_location_rounded, size: 18),
                            label: const Text('Use current location'),
                            onPressed: () => setState(() => _pickupController.text = 'Current location (near me)'),
                          ),
                          ..._locations.take(4).map((location) {
                            return ActionChip(
                              label: Text(location),
                              onPressed: () => setState(() => _dropoffController.text = location),
                            );
                          }),
                        ],
                      ),
                      const SizedBox(height: 12),
                      LocationPreviewMap(primary: _pickupPoint, secondary: _dropoffPoint),
                      const SizedBox(height: 12),
                      ExpansionTile(
                        tilePadding: EdgeInsets.zero,
                        title: const Text('Advanced map options', style: TextStyle(fontWeight: FontWeight.w700)),
                        subtitle: const Text('Use one map surface to refine pickup or drop-off pins only when needed.'),
                        children: [
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                ChoiceChip(
                                  label: const Text('Pickup pin'),
                                  selected: _mapTarget == 'pickup',
                                  onSelected: (_) => setState(() => _mapTarget = 'pickup'),
                                ),
                                ChoiceChip(
                                  label: const Text('Drop-off pin'),
                                  selected: _mapTarget == 'dropoff',
                                  onSelected: (_) => setState(() => _mapTarget = 'dropoff'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          LocationPickerMap(
                            label: _mapTarget == 'pickup' ? 'Pickup map pin' : 'Drop-off map pin',
                            value: _mapTarget == 'pickup' ? _pickupPoint : _dropoffPoint,
                            onChanged: (value) => setState(() {
                              if (_mapTarget == 'pickup') {
                                _pickupPoint = value;
                              } else {
                                _dropoffPoint = value;
                              }
                            }),
                            helpText: _mapTarget == 'pickup'
                                ? 'Tap to place the pickup pin. Manual address entry still works if you skip the map.'
                                : 'Tap to place the drop-off pin. This improves the estimated delivery distance and time.',
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Parcel size', style: Theme.of(context).textTheme.titleMedium),
                      ),
                      const SizedBox(height: 12),
                      ..._parcelSizes.map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () => setState(() => _parcelSize = item.value),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: _parcelSize == item.value ? AppColors.purpleSoftAlt : Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: _parcelSize == item.value ? AppColors.purpleBorder : AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(item.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                                          const SizedBox(height: 4),
                                          Text(item.detail, style: const TextStyle(color: AppColors.mutedText)),
                                        ],
                                      ),
                                    ),
                                    AppBadge(label: 'N\$ ${item.estimate}', tone: _parcelSize == item.value ? AppBadgeTone.info : AppBadgeTone.neutral),
                                  ],
                                ),
                              ),
                            ),
                          )),
                      LokalsTextField(
                        controller: _itemController,
                        label: 'Parcel description',
                        hint: 'What are you sending?',
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        initialValue: _urgency,
                        decoration: const InputDecoration(labelText: 'Urgency'),
                        items: const [
                          DropdownMenuItem(value: 'standard', child: Text('Standard')),
                          DropdownMenuItem(value: 'express', child: Text('Express')),
                          DropdownMenuItem(value: 'priority', child: Text('Priority')),
                        ],
                        onChanged: (value) => setState(() => _urgency = value ?? _urgency),
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(
                        controller: _weightController,
                        label: 'Weight (kg)',
                        hint: 'Approximate parcel weight',
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(
                        controller: _notesController,
                        label: 'Notes',
                        hint: 'Optional landmark or handoff detail',
                        maxLines: 2,
                      ),
                      const SizedBox(height: 12),
                      AppButton(
                        label: _photo == null ? 'Add parcel photo' : 'Change parcel photo',
                        expanded: false,
                        variant: AppButtonVariant.secondary,
                        onPressed: () async {
                          final file = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 82);
                          if (file == null) return;
                          setState(() => _photo = file);
                        },
                      ),
                      const SizedBox(height: 16),
                      if (_error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(_error!, style: const TextStyle(color: AppColors.danger)),
                        ),
                      PrimaryAction(
                        label: AppConfig.isDemoMode ? 'Simulate request' : 'Request delivery',
                        isBusy: _isBusy,
                        onPressed: () async {
                          final pickupAddress = _pickupController.text.trim();
                          final dropoffAddress = _dropoffController.text.trim();
                          if (_itemController.text.trim().isEmpty) {
                            setState(() => _error = 'Add a parcel description first.');
                            return;
                          }
                          if (AppConfig.isDemoMode) {
                            setState(() {
                              _successItem = DeliveryModel(
                                id: DateTime.now().millisecondsSinceEpoch,
                                pickupAddress: pickupAddress,
                                dropoffAddress: dropoffAddress,
                                itemDescription: _itemController.text.trim(),
                                price: _estimatedTotal.toString(),
                                parcelSize: _parcelSize,
                                urgency: _urgency,
                                weightKg: _weightController.text.trim(),
                                status: 'requested',
                              );
                            });
                            return;
                          }
                          setState(() {
                            _isBusy = true;
                            _error = null;
                          });
                          try {
                            final created = await ref.read(discoveryRepositoryProvider).createDelivery(
                                  pickupAddress: pickupAddress,
                                  dropoffAddress: dropoffAddress,
                                  itemDescription: _itemController.text.trim(),
                                  parcelSize: _parcelSize,
                                  urgency: _urgency,
                                  weightKg: _weightController.text.trim(),
                                  notes: _notesController.text.trim(),
                                  photo: _photo,
                                  price: _estimatedTotal.toString(),
                                  pickupCoordinates: _pickupPoint,
                                  dropoffCoordinates: _dropoffPoint,
                                );
                            ref.invalidate(deliveriesProvider);
                            if (!mounted) return;
                            setState(() {
                              _isBusy = false;
                              _successItem = created;
                            });
                          } catch (_) {
                            if (!mounted) return;
                            setState(() {
                              _isBusy = false;
                              _error = 'Unable to request delivery right now.';
                            });
                          }
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TransportPanel(
                  title: 'Delivery estimate',
                  subtitle: 'A compact summary of the current route and pricing assumptions.',
                  child: Row(
                    children: [
                      Expanded(child: TransportMiniStat(label: 'Estimated total', value: 'N\$ $_estimatedTotal')),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TransportMiniStat(
                          label: 'Urgency',
                          value: _urgency.replaceAll('_', ' '),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
