import 'dart:math' as dart_math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../features/auth/auth_controller.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'request_success_state.dart';
import '../../../shared/widgets/location_picker_map.dart';
import '../../../shared/widgets/location_preview_map.dart';
import '../../../shared/widgets/transport_surface.dart';

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
  ];

  static const List<String> _tripPurposes = [
    'Daily commute',
    'Clinic visit',
    'School pickup',
    'Town errand',
    'Late shift ride',
  ];

  static const List<_RideChoice> _rideChoices = [
    _RideChoice(
      title: 'Standard',
      eta: '3 min',
      baseFare: 35,
      icon: Icons.local_taxi_outlined,
    ),
    _RideChoice(
      title: 'Comfort',
      eta: '5 min',
      baseFare: 48,
      icon: Icons.directions_car_outlined,
    ),
    _RideChoice(
      title: 'XL',
      eta: '7 min',
      baseFare: 70,
      icon: Icons.airport_shuttle_outlined,
    ),
  ];

  LocationPointModel? _pickupPoint;
  LocationPointModel? _dropoffPoint;
  String _tripPurpose = _tripPurposes.first;
  String _rideType = _rideChoices.first.title;
  String _activeTab = 'request';
  String _mapTarget = 'pickup';
  final _notesController = TextEditingController();
  final _pickupController = TextEditingController(text: _stops.first);
  final _dropoffController = TextEditingController(
    text: 'Okahandja Town Council',
  );
  bool _isBusy = false;
  String? _error;
  RideModel? _successItem;

  @override
  void initState() {
    super.initState();
    _pickupController.addListener(_refresh);
    _dropoffController.addListener(_refresh);
  }

  void _refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  int get _estimatedFare {
    final ride = _rideChoices.firstWhere((item) => item.title == _rideType);
    final routeBonus =
        _pickupController.text.trim() == _dropoffController.text.trim()
        ? 0
        : 12;
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
    final a =
        (dart_math.sin(latDelta / 2) * dart_math.sin(latDelta / 2)) +
        (dart_math.cos(_toRadians(fromLat)) *
            dart_math.cos(_toRadians(toLat)) *
            dart_math.sin(lngDelta / 2) *
            dart_math.sin(lngDelta / 2));
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
    _pickupController.removeListener(_refresh);
    _dropoffController.removeListener(_refresh);
    _notesController.dispose();
    _pickupController.dispose();
    _dropoffController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final rides = ref.watch(ridesProvider);
    final auth = ref.watch(authControllerProvider);
    final unreadCount =
        (ref.watch(notificationsProvider).asData?.value ?? const [])
            .where((item) => item.readAt == null)
            .length;
    final activeRide = rides.asData?.value
        .where(
          (item) => ![
            'completed',
            'cancelled',
          ].contains((item.status ?? '').toLowerCase()),
        )
        .cast<RideModel?>()
        .firstWhere((item) => item != null, orElse: () => null);
    final area = auth.user?.defaultArea ?? 'Nau-Aib';
    final town = auth.user?.defaultTown ?? AppConfig.pilotTown;

    return LokalsShell(
      title: 'Ride',
      showBack: true,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 240),
        child: _successItem != null
            ? _buildSuccessState(context)
            : _activeTab == 'request'
            ? _buildRequestWorkspace(
                context,
                area: area,
                town: town,
                unreadCount: unreadCount,
                profileInitial: auth.user?.name.characters.first.toUpperCase(),
              )
            : _buildLibraryView(context, rides: rides, activeRide: activeRide),
      ),
    );
  }

  Widget _buildSuccessState(BuildContext context) {
    return ListView(
      key: const ValueKey('ride-success'),
      padding: const EdgeInsets.all(20),
      children: [
        RequestSuccessState(
          title: 'Ride requested',
          body:
              'Your taxi request is live. A nearby driver can accept and update the trip shortly.',
          meta: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${_successItem!.pickupLocation} to ${_successItem!.dropoffLocation}',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              Text(
                'Estimate: N\$ ${_successItem!.fareEstimate ?? _estimatedFare}',
                style: const TextStyle(color: AppColors.mutedText),
              ),
            ],
          ),
          primaryLabel: 'View ride status',
          onPrimary: () => context.push('/ride/${_successItem!.id}'),
          secondaryLabel: 'Request another ride',
          onSecondary: () => setState(() => _successItem = null),
        ),
      ],
    );
  }

  Widget _buildRequestWorkspace(
    BuildContext context, {
    required String area,
    required String town,
    required int unreadCount,
    required String? profileInitial,
  }) {
    return LayoutBuilder(
      key: const ValueKey('ride-request'),
      builder: (context, constraints) {
        final sheetHeight = dart_math.min(constraints.maxHeight * 0.56, 430.0);

        return Stack(
          children: [
            Positioned.fill(
              child: DecoratedBox(
                decoration: const BoxDecoration(
                  color: AppColors.softBackground,
                ),
                child: LocationPreviewMap(
                  primary: _pickupPoint,
                  secondary: _dropoffPoint,
                  height: constraints.maxHeight,
                  showFrame: false,
                  showOpenAction: false,
                  emptyMessage:
                      'Use manual addresses if the map is unavailable. You can still request a ride.',
                ),
              ),
            ),
            Positioned.fill(
              child: IgnorePointer(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withValues(alpha: 0.1),
                        Colors.white.withValues(alpha: 0.0),
                        Colors.black.withValues(alpha: 0.08),
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Column(
                children: [
                  TransportFloatingHeader(
                    title: 'Ride',
                    subtitle: '$area, $town',
                    onBack: () => context.pop(),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TransportFloatingIconButton(
                          icon: Icons.notifications_none_rounded,
                          badge: unreadCount > 0
                              ? unreadCount.toString()
                              : null,
                          onPressed: () => context.push('/activity'),
                        ),
                        if (profileInitial != null) ...[
                          const SizedBox(width: 8),
                          TransportProfileShortcut(
                            label: profileInitial,
                            onPressed: () => context.push('/profile'),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  TransportRouteCard(
                    pickupController: _pickupController,
                    destinationController: _dropoffController,
                    pickupLabel: 'Pickup',
                    destinationLabel: 'Destination',
                    onAddStop: () => setState(
                      () => _dropoffController.text = 'Okahandja taxi rank',
                    ),
                    quickChips: [
                      _QuickStopChip(
                        label: 'Home',
                        onTap: () =>
                            setState(() => _dropoffController.text = 'Home'),
                      ),
                      _QuickStopChip(
                        label: 'Work',
                        onTap: () =>
                            setState(() => _dropoffController.text = 'Work'),
                      ),
                      _QuickStopChip(
                        label: 'Clinic',
                        onTap: () => setState(
                          () => _dropoffController.text =
                              'Okahandja State Clinic',
                        ),
                      ),
                      _QuickStopChip(
                        label: 'Taxi rank',
                        onTap: () => setState(
                          () => _dropoffController.text = 'Okahandja taxi rank',
                        ),
                      ),
                    ],
                  ),
                ],
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
                      TransportSegmentTabs(
                        items: const [
                          (value: 'request', label: 'Request'),
                          (value: 'recent', label: 'Recent'),
                          (value: 'active', label: 'Active'),
                        ],
                        value: _activeTab,
                        onChanged: (value) =>
                            setState(() => _activeTab = value),
                      ),
                      const SizedBox(height: 12),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Expanded(
                                    child: Text(
                                      'Choose a ride',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ),
                                  AppBadge(
                                    label: _distanceKm == null
                                        ? 'Estimate pending'
                                        : '${_distanceKm!.toStringAsFixed(1)} km',
                                    tone: AppBadgeTone.info,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Row(
                                  children: _rideChoices.map((choice) {
                                    return Padding(
                                      padding: const EdgeInsets.only(right: 10),
                                      child: TransportOptionCard(
                                        title: choice.title,
                                        subtitle: choice.eta,
                                        price: 'N\$ ${choice.baseFare}+',
                                        icon: choice.icon,
                                        isSelected: _rideType == choice.title,
                                        onTap: () => setState(
                                          () => _rideType = choice.title,
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                              const SizedBox(height: 14),
                              TransportSummaryRow(
                                primaryLabel: 'ETA',
                                primaryValue: '$_estimatedMinutes min',
                                secondaryLabel: 'Estimated fare',
                                secondaryValue: 'N\$ $_estimatedFare',
                              ),
                              const SizedBox(height: 14),
                              const Text(
                                'Trip purpose',
                                style: TextStyle(fontWeight: FontWeight.w800),
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: _tripPurposes.map((purpose) {
                                  final selected = _tripPurpose == purpose;
                                  return ChoiceChip(
                                    label: Text(purpose),
                                    selected: selected,
                                    onSelected: (_) =>
                                        setState(() => _tripPurpose = purpose),
                                    backgroundColor: AppColors.neutralSoftAlt,
                                    selectedColor: AppColors.purpleSoftAlt,
                                    labelStyle: TextStyle(
                                      color: selected
                                          ? AppColors.primaryPurple
                                          : AppColors.deepCharcoal,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 12),
                              ExpansionTile(
                                tilePadding: EdgeInsets.zero,
                                childrenPadding: EdgeInsets.zero,
                                title: const Text(
                                  'Advanced map options',
                                  style: TextStyle(fontWeight: FontWeight.w800),
                                ),
                                subtitle: const Text(
                                  'Only open this when you need to refine pickup or destination pins.',
                                  style: TextStyle(
                                    color: AppColors.mutedText,
                                    fontSize: 12,
                                  ),
                                ),
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
                                          onSelected: (_) => setState(
                                            () => _mapTarget = 'pickup',
                                          ),
                                        ),
                                        ChoiceChip(
                                          label: const Text('Destination pin'),
                                          selected: _mapTarget == 'dropoff',
                                          onSelected: (_) => setState(
                                            () => _mapTarget = 'dropoff',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  LocationPickerMap(
                                    label: _mapTarget == 'pickup'
                                        ? 'Pickup pin'
                                        : 'Destination pin',
                                    value: _mapTarget == 'pickup'
                                        ? _pickupPoint
                                        : _dropoffPoint,
                                    onChanged: (value) => setState(() {
                                      if (_mapTarget == 'pickup') {
                                        _pickupPoint = value;
                                      } else {
                                        _dropoffPoint = value;
                                      }
                                    }),
                                    helpText: _mapTarget == 'pickup'
                                        ? 'Tap to place the pickup pin. Manual entry still works if location access is denied.'
                                        : 'Tap to place the destination pin. Manual entry still works if the map is unavailable.',
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              ExpansionTile(
                                tilePadding: EdgeInsets.zero,
                                childrenPadding: EdgeInsets.zero,
                                title: const Text(
                                  'Notes and access details',
                                  style: TextStyle(fontWeight: FontWeight.w800),
                                ),
                                subtitle: const Text(
                                  'Optional gate, landmark, or timing note for the driver.',
                                  style: TextStyle(
                                    color: AppColors.mutedText,
                                    fontSize: 12,
                                  ),
                                ),
                                children: [
                                  LokalsTextField(
                                    controller: _notesController,
                                    label: 'Notes',
                                    hint:
                                        'Gate number, landmark, or timing note',
                                    maxLines: 2,
                                  ),
                                ],
                              ),
                              if (_error != null) ...[
                                const SizedBox(height: 12),
                                Text(
                                  _error!,
                                  style: const TextStyle(
                                    color: AppColors.danger,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              label: _isBusy
                                  ? 'Requesting taxi...'
                                  : 'Request taxi',
                              isLoading: _isBusy,
                              onPressed: _submitRideRequest,
                            ),
                          ),
                          const SizedBox(width: 12),
                          SizedBox(
                            width: 88,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'N\$ $_estimatedFare',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primaryPurple,
                                  ),
                                ),
                                const Text(
                                  'Est. fare',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.mutedText,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
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
  }

  Widget _buildLibraryView(
    BuildContext context, {
    required AsyncValue<List<RideModel>> rides,
    required RideModel? activeRide,
  }) {
    return ListView(
      key: ValueKey('ride-$_activeTab'),
      padding: const EdgeInsets.all(20),
      children: [
        TransportSegmentTabs(
          items: const [
            (value: 'request', label: 'Request'),
            (value: 'recent', label: 'Recent rides'),
            (value: 'active', label: 'Active ride'),
          ],
          value: _activeTab,
          onChanged: (value) => setState(() => _activeTab = value),
        ),
        const SizedBox(height: 16),
        if (_activeTab == 'recent')
          rides.when(
            data: (items) => items.isEmpty
                ? const EmptyState(
                    title: 'No ride requests yet',
                    body:
                        'Your recent Okahandja ride requests will appear here.',
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
                              title: Text(
                                '${item.pickupLocation} -> ${item.dropoffLocation}',
                              ),
                              subtitle: Text(
                                '${item.rideType ?? 'Standard'} - ${item.tripPurpose ?? 'General trip'}',
                              ),
                              trailing: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    item.fareEstimate == null
                                        ? 'Open'
                                        : 'N\$ ${item.fareEstimate}',
                                  ),
                                  const SizedBox(height: 4),
                                  AppBadge(
                                    label:
                                        item.statusLabel ??
                                        item.status ??
                                        'requested',
                                  ),
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
          ),
        if (_activeTab == 'active')
          activeRide != null
              ? TransportPanel(
                  title: 'Active ride',
                  subtitle: 'The ride that currently needs attention first.',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${activeRide.pickupLocation} -> ${activeRide.dropoffLocation}',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${activeRide.rideType ?? 'Standard'} | ${activeRide.statusLabel ?? activeRide.status ?? 'requested'}',
                        style: const TextStyle(color: AppColors.mutedText),
                      ),
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
                  body:
                      'When a ride is searching, accepted, or in progress, it will appear here.',
                ),
      ],
    );
  }

  Future<void> _submitRideRequest() async {
    setState(() {
      _isBusy = true;
      _error = null;
    });
    try {
      final created = await ref
          .read(discoveryRepositoryProvider)
          .createRide(
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
        _error =
            'Unable to request a ride right now. You can still adjust the address manually and try again.';
      });
    }
  }
}

class _QuickStopChip extends StatelessWidget {
  const _QuickStopChip({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      label: Text(label),
      backgroundColor: AppColors.neutralSoftAlt,
      labelStyle: const TextStyle(
        color: AppColors.deepCharcoal,
        fontWeight: FontWeight.w700,
      ),
      onPressed: onTap,
    );
  }
}

class _RideChoice {
  const _RideChoice({
    required this.title,
    required this.eta,
    required this.baseFare,
    required this.icon,
  });

  final String title;
  final String eta;
  final int baseFare;
  final IconData icon;
}

double _toRadians(double value) => value * 3.1415926535897932 / 180.0;
