import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'request_success_state.dart';

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
  String _tripPurpose = _tripPurposes.first;
  String _rideType = _rideChoices.first.title;
  final _notesController = TextEditingController();
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
    return ride.baseFare + routeBonus + purposeBonus;
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final rides = ref.watch(ridesProvider);

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
                  'Choose your pickup, destination, and ride style in one place.',
                  style: TextStyle(color: Colors.white70, height: 1.4),
                ),
              ],
            ),
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
          else
            AppCard(
              child: Column(
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _pickupLocation,
                    decoration: const InputDecoration(labelText: 'Pickup location'),
                    items: _stops.map((stop) => DropdownMenuItem(value: stop, child: Text(stop))).toList(),
                    onChanged: (value) => setState(() => _pickupLocation = value ?? _pickupLocation),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _dropoffLocation,
                    decoration: const InputDecoration(labelText: 'Destination'),
                    items: _stops.where((stop) => stop != 'Current location').map((stop) => DropdownMenuItem(value: stop, child: Text(stop))).toList(),
                    onChanged: (value) => setState(() => _dropoffLocation = value ?? _dropoffLocation),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ActionChip(label: const Text('Home'), onPressed: () => setState(() => _dropoffLocation = 'Home')),
                      ActionChip(label: const Text('Work'), onPressed: () => setState(() => _dropoffLocation = 'Work')),
                      ActionChip(label: const Text('Clinic'), onPressed: () => setState(() => _dropoffLocation = 'Okahandja State Clinic')),
                    ],
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
                  DropdownButtonFormField<String>(
                    initialValue: _tripPurpose,
                    decoration: const InputDecoration(labelText: 'Trip purpose'),
                    items: _tripPurposes.map((purpose) => DropdownMenuItem(value: purpose, child: Text(purpose))).toList(),
                    onChanged: (value) => setState(() => _tripPurpose = value ?? _tripPurpose),
                  ),
                  const SizedBox(height: 12),
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
                  Container(
                    height: 170,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.neutralSoftAlt,
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                        ),
                        Positioned(
                          left: 28,
                          top: 36,
                          child: Container(
                            width: 16,
                            height: 16,
                            decoration: const BoxDecoration(color: AppColors.primaryGreen, shape: BoxShape.circle),
                          ),
                        ),
                        Positioned(
                          right: 30,
                          bottom: 38,
                          child: Container(
                            width: 16,
                            height: 16,
                            decoration: const BoxDecoration(color: AppColors.danger, shape: BoxShape.circle),
                          ),
                        ),
                        Positioned.fill(child: CustomPaint(painter: _RoutePainter())),
                        const Center(
                          child: CircleAvatar(
                            radius: 18,
                            backgroundColor: Colors.white,
                            child: Icon(Icons.local_taxi_rounded, color: AppColors.primaryPurple),
                          ),
                        ),
                      ],
                    ),
                  ),
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
                        Text('$_pickupLocation to $_dropoffLocation', style: const TextStyle(color: AppColors.mutedText)),
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
                        final created = await ref.read(discoveryRepositoryProvider).createRide(
                              pickupLocation: _pickupLocation,
                              dropoffLocation: _dropoffLocation,
                              rideType: _rideType,
                              tripPurpose: _tripPurpose,
                              notes: _notesController.text.trim(),
                              fareEstimate: _estimatedFare.toString(),
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
          const SizedBox(height: 18),
          const SectionTitle(title: 'Recent ride requests'),
          const SizedBox(height: 12),
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
                                  AppBadge(label: item.status ?? 'requested'),
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

class _RoutePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(34, 44)
      ..quadraticBezierTo(size.width * 0.34, size.height * 0.68, size.width * 0.6, size.height * 0.54)
      ..quadraticBezierTo(size.width * 0.72, size.height * 0.48, size.width - 34, size.height - 42);

    final paint = Paint()
      ..color = AppColors.primaryPurple
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
