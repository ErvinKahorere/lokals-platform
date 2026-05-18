import 'dart:math' as dart_math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';
import '../../core/models.dart';
import '../../config/app_config.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'request_success_state.dart';
import '../../../shared/widgets/location_picker_map.dart';
import '../../../shared/widgets/location_preview_map.dart';

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

  String _pickupAddress = _locations.first;
  String _dropoffAddress = _locations.last;
  LocationPointModel? _pickupPoint;
  LocationPointModel? _dropoffPoint;
  String _urgency = 'standard';
  final _pickupController = TextEditingController(text: _locations.first);
  final _dropoffController = TextEditingController(text: _locations.last);
  final _weightController = TextEditingController(text: '2');
  final _itemController = TextEditingController();
  final _notesController = TextEditingController();
  String _parcelSize = 'medium';
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

    return LokalsShell(
      title: 'Delivery',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Send a parcel fast',
            subtitle: 'Pick the route, choose parcel size, and request delivery in a few steps.',
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
          else
            AppCard(
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
                  LocationPickerMap(
                    label: 'Pickup map pin',
                    value: _pickupPoint,
                    onChanged: (value) => setState(() => _pickupPoint = value),
                    helpText: 'Tap to place the pickup pin. Manual address entry still works if you skip the map.',
                  ),
                  const SizedBox(height: 12),
                  LocationPickerMap(
                    label: 'Drop-off map pin',
                    value: _dropoffPoint,
                    onChanged: (value) => setState(() => _dropoffPoint = value),
                    helpText: 'Tap to place the drop-off pin. This improves the estimated delivery distance and time.',
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
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: AppColors.danger)),
                  ],
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.neutralSoftAlt,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Estimate', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryPurple)),
                        const SizedBox(height: 6),
                        Text('N\$ $_estimatedTotal', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 6),
                        Text('${_pickupController.text} to ${_dropoffController.text}', style: const TextStyle(color: AppColors.mutedText)),
                        const SizedBox(height: 6),
                        Text(
                          _pickupPoint != null && _dropoffPoint != null
                              ? 'Estimated distance ${_estimateDistanceKm(_pickupPoint!, _dropoffPoint!).toStringAsFixed(1)} km • about ${_estimateDeliveryMinutes(_pickupPoint!, _dropoffPoint!)} min'
                              : 'Add map pins for a better estimated distance and time.',
                          style: const TextStyle(color: AppColors.mutedText),
                        ),
                        const SizedBox(height: 6),
                        Text('Urgency: ${_urgency[0].toUpperCase()}${_urgency.substring(1)} | Weight: ${_weightController.text.trim()} kg', style: const TextStyle(color: AppColors.mutedText)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  LocationPreviewMap(primary: _pickupPoint, secondary: _dropoffPoint),
                  const SizedBox(height: 16),
                  PrimaryAction(
                    label: AppConfig.isDemoMode ? 'Simulate request' : 'Request delivery',
                    isBusy: _isBusy,
                    onPressed: () async {
                      if (_itemController.text.trim().isEmpty) {
                        setState(() => _error = 'Add a parcel description first.');
                        return;
                      }
                      if (AppConfig.isDemoMode) {
                        setState(() {
                          _successItem = DeliveryModel(
                            id: DateTime.now().millisecondsSinceEpoch,
                            pickupAddress: _pickupAddress,
                            dropoffAddress: _dropoffAddress,
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
                        _pickupAddress = _pickupController.text.trim();
                        _dropoffAddress = _dropoffController.text.trim();
                        final created = await ref.read(discoveryRepositoryProvider).createDelivery(
                              pickupAddress: _pickupController.text.trim(),
                              dropoffAddress: _dropoffController.text.trim(),
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
          const SizedBox(height: 18),
          const SectionTitle(title: 'Recent delivery requests'),
          const SizedBox(height: 12),
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
          ),
        ],
      ),
    );
  }
}

double _estimateDistanceKm(LocationPointModel start, LocationPointModel end) {
  const earthRadius = 6371;
  final latDelta = _toRadians(end.latitude - start.latitude);
  final lngDelta = _toRadians(end.longitude - start.longitude);
  final a = (dart_math.sin(latDelta / 2) * dart_math.sin(latDelta / 2))
      + (dart_math.cos(_toRadians(start.latitude)) *
          dart_math.cos(_toRadians(end.latitude)) *
          dart_math.sin(lngDelta / 2) *
          dart_math.sin(lngDelta / 2));
  final c = 2 * dart_math.atan2(dart_math.sqrt(a), dart_math.sqrt(1 - a));
  return double.parse((earthRadius * c).toStringAsFixed(1));
}

int _estimateDeliveryMinutes(LocationPointModel start, LocationPointModel end) {
  return (_estimateDistanceKm(start, end) * 3.1).round().clamp(8, 240);
}

double _toRadians(double value) => value * 3.1415926535897932 / 180.0;
