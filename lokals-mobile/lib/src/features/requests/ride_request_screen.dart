import 'dart:math' as dart_math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'request_success_state.dart';
import '../../../shared/widgets/location_picker_map.dart';
import '../../../shared/widgets/location_preview_map.dart';

class RideRequestScreen extends ConsumerStatefulWidget {
  const RideRequestScreen({super.key});

  @override
  ConsumerState<RideRequestScreen> createState() => _RideRequestScreenState();
}

class _RideRequestScreenState extends ConsumerState<RideRequestScreen> {
  static const List<String> _stops = [
    'Current location',
    'Home',
    'Work',
    'Okahandja taxi rank',
    'Okahandja Town Council',
    'Okahandja State Clinic',
    'Okahandja Police Station',
    'Nau-Aib Community Hall',
    'Osona Village entrance',
  ];

  static const List<String> _tripPurposes = [
    'Daily commute',
    'Clinic visit',
    'School pickup',
    'Town errand',
    'Late shift ride',
  ];

  static const List<_RideChoice> _rideChoices = [
    _RideChoice(title: 'Standard', eta: '3 min', baseFare: 35),
    _RideChoice(title: 'Comfort', eta: '5 min', baseFare: 48),
    _RideChoice(title: 'XL', eta: '7 min', baseFare: 70),
  ];

  String _pickupLocation = _stops.first;
  String _dropoffLocation = 'Okahandja Town Council';
  LocationPointModel? _pickupPoint;
  LocationPointModel? _dropoffPoint;
  String _tripPurpose = _tripPurposes.first;
  String _rideType = _rideChoices.first.title;
  String _activeTab = 'request';
  String _mapTarget = 'pickup';
  final _notesController = TextEditingController();
  final _pickupController = TextEditingController(text: _stops.first);
  final _dropoffController = TextEditingController(text: 'Okahandja Town Council');
  bool _isBusy = false;
  String? _error;
  RideModel? _successItem;

  int get _estimatedFare {
    final ride = _rideChoices.firstWhere((item) => item.title == _rideType);
    final routeBonus = _pickupLocation == _dropoffLocation ? 0 : 12;
    final purposeBonus = switch (_tripPurpose) {
      'Town errand' => 18,
      'Late shift ride' => 20,
      _ => 0,
    };
    final distanceBonus = _distanceKm == null ? 0 : (_distanceKm! * 4).round();
    return ride.baseFare + routeBonus + purposeBonus + distanceBonus;
  }

  double? get _distanceKm {
    if (_pickupPoint == null || _dropoffPoint == null) {
      return null;
    }

    final fromLat = _pickupPoint!.latitude;
    final fromLng = _pickupPoint!.longitude;
    final toLat = _dropoffPoint!.latitude;
    final toLng = _dropoffPoint!.longitude;
    const earthRadius = 6371;
    final latDelta = _toRadians(toLat - fromLat);
    final lngDelta = _toRadians(toLng - fromLng);
    final a = (dart_math.sin(latDelta / 2) * dart_math.sin(latDelta / 2))
        + (dart_math.cos(_toRadians(fromLat)) * dart_math.cos(_toRadians(toLat)) * dart_math.sin(lngDelta / 2) * dart_math.sin(lngDelta / 2));
    final c = 2 * dart_math.atan2(dart_math.sqrt(a), dart_math.sqrt(1 - a));
    return double.parse((earthRadius * c).toStringAsFixed(1));
  }

  int get _estimatedMinutes {
    final distance = _distanceKm;
    if (distance == null) return 11;
    return (distance * 2.3).round().clamp(6, 180);
  }

  @override
  void dispose() {
    _notesController.dispose();
    _pickupController.dispose();
    _dropoffController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final rides = ref.watch(ridesProvider);
    final activeRide = rides.asData?.value.where((item) => !['completed', 'cancelled'].contains((item.status ?? '').toLowerCase())).cast<RideModel?>().firstWhere((item) => item != null, orElse: () => null);

    return LokalsShell(
      title: 'Ride',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryPurple, AppColors.deepPurple],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ride', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800)),
                SizedBox(height: 8),
                Text(
                  'Choose your pickup, destination, and ride style across Okahandja in one place.',
                  style: TextStyle(color: Colors.white70, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: const [
              ('request', 'Request'),
              ('recent', 'Recent rides'),
              ('active', 'Active ride'),
            ].map((item) {
              return item;
            }).map((item) {
              final value = item.$1;
              final label = item.$2;
              final isSelected = _activeTab == value;
              return ChoiceChip(
                label: Text(label),
                selected: isSelected,
                onSelected: (_) => setState(() => _activeTab = value),
                selectedColor: AppColors.primaryPurple,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.deepCharcoal,
                  fontWeight: FontWeight.w700,
                ),
                backgroundColor: AppColors.neutralSoftAlt,
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          if (_successItem != null)
            RequestSuccessState(
              title: 'Ride requested',
              body: 'Your taxi request is live. A nearby driver can accept and update the trip shortly.',
              meta: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${_successItem!.pickupLocation} to ${_successItem!.dropoffLocation}', style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text('Estimate: N\$ ${_successItem!.fareEstimate ?? _estimatedFare}', style: const TextStyle(color: AppColors.mutedText)),
                ],
              ),
              primaryLabel: 'View ride status',
              onPrimary: () => context.push('/ride/${_successItem!.id}'),
              secondaryLabel: 'Back home',
              onSecondary: () => context.go('/'),
            )
          else if (_activeTab == 'recent')
            rides.when(
              data: (items) => items.isEmpty
                  ? const EmptyState(
                      title: 'No ride requests yet',
                      body: 'Your recent Okahandja ride requests will appear here.',
                    )
                  : Column(
                      children: items.take(5).map((item) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(20),
                            onTap: () => context.push('/ride/${item.id}'),
                            child: LokalsCard(
                              child: ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text('${item.pickupLocation} -> ${item.dropoffLocation}'),
                                subtitle: Text('${item.rideType ?? 'Standard'} - ${item.tripPurpose ?? 'General trip'}'),
                                trailing: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(item.fareEstimate == null ? 'Open' : 'N\$ ${item.fareEstimate}'),
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
                title: 'Unable to load rides',
                body: 'Please try again in a moment.',
                actionLabel: 'Retry',
                onAction: () => ref.invalidate(ridesProvider),
              ),
            )
          else if (_activeTab == 'active')
            activeRide != null
                ? LokalsCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Active ride',
                          subtitle: 'The current ride that needs attention first.',
                        ),
                        const SizedBox(height: 12),
                        Text('${activeRide.pickupLocation} -> ${activeRide.dropoffLocation}', style: const TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 6),
                        Text('${activeRide.rideType ?? 'Standard'} | ${activeRide.statusLabel ?? activeRide.status ?? 'requested'}', style: const TextStyle(color: AppColors.mutedText)),
                        const SizedBox(height: 16),
                        AppButton(
                          label: 'Open ride workspace',
                          expanded: false,
                          onPressed: () => context.push('/ride/${activeRide.id}'),
                        ),
                      ],
                    ),
                  )
                : const EmptyState(
                    title: 'No active ride',
                    body: 'When a ride is searching, accepted, or in progress, it will appear here.',
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
                    label: 'Destination',
                    hint: 'Enter destination address or landmark',
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
                      ActionChip(label: const Text('Home'), onPressed: () => setState(() => _dropoffController.text = 'Home')),
                      ActionChip(label: const Text('Work'), onPressed: () => setState(() => _dropoffController.text = 'Work')),
                      ActionChip(label: const Text('Clinic'), onPressed: () => setState(() => _dropoffController.text = 'Okahandja State Clinic')),
                    ],
                  ),
                  const SizedBox(height: 12),
                  LocationPreviewMap(primary: _pickupPoint, secondary: _dropoffPoint),
                  const SizedBox(height: 12),
                  ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    title: const Text('Advanced map options', style: TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: const Text('Use one map surface to refine pickup or destination pins only when needed.'),
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
                              label: const Text('Destination pin'),
                              selected: _mapTarget == 'dropoff',
                              onSelected: (_) => setState(() => _mapTarget = 'dropoff'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      LocationPickerMap(
                        label: _mapTarget == 'pickup' ? 'Pickup map pin' : 'Destination map pin',
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
                            : 'Tap to place the destination pin. Manual address entry still works if you skip the map.',
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _tripPurpose,
                    decoration: const InputDecoration(labelText: 'Trip purpose'),
                    items: _tripPurposes.map((purpose) => DropdownMenuItem(value: purpose, child: Text(purpose))).toList(),
                    onChanged: (value) => setState(() => _tripPurpose = value ?? _tripPurpose),
                  ),
                  const SizedBox(height: 12),
                  AppCard(
                    color: AppColors.neutralSoftAlt,
                    child: Row(
                      children: [
                        const CircleAvatar(
                          backgroundColor: Color(0xFFEDE9FE),
                          child: Icon(Icons.verified_user_outlined, color: AppColors.primaryPurple),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Verified local taxi operator', style: TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              Text('Okahandja rides are prioritised for ${AppConfig.pilotTown}.', style: const TextStyle(color: AppColors.mutedText)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._rideChoices.map((option) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(18),
                          onTap: () => setState(() => _rideType = option.title),
                          child: _RideOption(
                            title: option.title,
                            eta: option.eta,
                            fare: 'N\$ ${option.baseFare}+',
                            isSelected: option.title == _rideType,
                          ),
                        ),
                      )),
                  LokalsTextField(
                    controller: _notesController,
                    label: 'Extra notes',
                    hint: 'Gate number, landmark, or timing note',
                    maxLines: 2,
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: AppColors.danger)),
                  ],
                  const SizedBox(height: 12),
                  LocationPreviewMap(primary: _pickupPoint, secondary: _dropoffPoint),
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Estimated fare', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.info)),
                        const SizedBox(height: 8),
                        Text('N\$ $_estimatedFare', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        Text('${_pickupController.text} to ${_dropoffController.text}', style: const TextStyle(color: AppColors.mutedText)),
                        const SizedBox(height: 6),
                        Text(
                          _distanceKm == null
                              ? 'Add map pins for a better estimated distance and time.'
                              : 'Estimated distance ${_distanceKm!.toStringAsFixed(1)} km • about $_estimatedMinutes min',
                          style: const TextStyle(color: AppColors.mutedText),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppButton(
                    label: 'Request taxi',
                    isLoading: _isBusy,
                    onPressed: () async {
                      setState(() {
                        _isBusy = true;
                        _error = null;
                      });
                      try {
                        _pickupLocation = _pickupController.text.trim();
                        _dropoffLocation = _dropoffController.text.trim();
                        final created = await ref.read(discoveryRepositoryProvider).createRide(
                              pickupLocation: _pickupController.text.trim(),
                              dropoffLocation: _dropoffController.text.trim(),
                              rideType: _rideType,
                              tripPurpose: _tripPurpose,
                              notes: _notesController.text.trim(),
                              fareEstimate: _estimatedFare.toString(),
                              estimatedDistanceKm: _distanceKm?.toStringAsFixed(1),
                              pickupCoordinates: _pickupPoint,
                              dropoffCoordinates: _dropoffPoint,
                            );
                        ref.invalidate(ridesProvider);
                        if (!mounted) return;
                        setState(() {
                          _isBusy = false;
                          _successItem = created;
                        });
                      } catch (_) {
                        if (!mounted) return;
                        setState(() {
                          _isBusy = false;
                          _error = 'Unable to request a ride right now.';
                        });
                      }
                    },
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _RideOption extends StatelessWidget {
  const _RideOption({
    required this.title,
    required this.eta,
    required this.fare,
    required this.isSelected,
  });

  final String title;
  final String eta;
  final String fare;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.purpleSoftAlt : Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isSelected ? AppColors.purpleBorder : AppColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: isSelected ? Colors.white : AppColors.neutralSoft,
            child: const Icon(Icons.directions_car_outlined, color: AppColors.primaryPurple),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700))),
          Text('$eta • $fare', style: const TextStyle(color: AppColors.mutedText)),
        ],
      ),
    );
  }
}

class _RideChoice {
  const _RideChoice({required this.title, required this.eta, required this.baseFare});

  final String title;
  final String eta;
  final int baseFare;
}

double _toRadians(double value) => value * 3.1415926535897932 / 180.0;
