import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class RideRequestScreen extends ConsumerStatefulWidget {
  const RideRequestScreen({super.key});

  @override
  ConsumerState<RideRequestScreen> createState() => _RideRequestScreenState();
}

class _RideRequestScreenState extends ConsumerState<RideRequestScreen> {
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  final _fareController = TextEditingController();
  bool _isBusy = false;
  String? _message;

  @override
  Widget build(BuildContext context) {
    final rides = ref.watch(ridesProvider);

    return LokalsShell(
      title: 'Ride',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Ride across your city',
            subtitle: 'Pickup, dropoff, quick destinations, and clear fare options.',
          ),
          const SizedBox(height: 16),
          AppCard(
            child: Column(
              children: [
                LokalsTextField(
                  controller: _pickupController,
                  label: 'Pickup location',
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _dropoffController,
                  label: 'Dropoff location',
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ActionChip(label: const Text('Home'), onPressed: () => _dropoffController.text = 'Home'),
                    ActionChip(label: const Text('Work'), onPressed: () => _dropoffController.text = 'Work'),
                    ActionChip(label: const Text('Airport'), onPressed: () => _dropoffController.text = 'Airport'),
                  ],
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _fareController,
                  label: 'Fare estimate (optional)',
                  keyboardType: TextInputType.number,
                ),
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  AppBadge(label: _message!, tone: AppBadgeTone.success),
                ],
                const SizedBox(height: 16),
                AppButton(
                  label: 'Request ride',
                  isLoading: _isBusy,
                  onPressed: () async {
                    setState(() => _isBusy = true);
                    await ref.read(discoveryRepositoryProvider).createRide(
                          pickupLocation: _pickupController.text.trim(),
                          dropoffLocation: _dropoffController.text.trim(),
                          fareEstimate: _fareController.text.trim(),
                        );
                    ref.invalidate(ridesProvider);
                    if (!mounted) return;
                    setState(() {
                      _isBusy = false;
                      _message = 'Ride request submitted.';
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Ride options', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                _RideOption(title: 'Standard', eta: '3 min', fare: 'N\$ 25 - 35'),
                const SizedBox(height: 10),
                _RideOption(title: 'Comfort', eta: '5 min', fare: 'N\$ 35 - 50'),
                const SizedBox(height: 10),
                _RideOption(title: 'XL', eta: '7 min', fare: 'N\$ 55 - 75'),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
              gradient: const LinearGradient(colors: [Color(0xFFE0F2FE), Color(0xFFF8FAFC)]),
            ),
            child: const Center(child: Icon(Icons.map_outlined, size: 42, color: AppColors.info)),
          ),
          const SizedBox(height: 18),
          const SectionTitle(title: 'Recent ride requests'),
          const SizedBox(height: 12),
          rides.when(
            data: (items) => Column(
              children: items
                  .take(5)
                  .map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: LokalsCard(
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text('${item.pickupLocation} -> ${item.dropoffLocation}'),
                          trailing: Text(item.fareEstimate == null ? 'Open' : 'N\$ ${item.fareEstimate}'),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => Text('Failed to load rides: $error'),
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
  });

  final String title;
  final String eta;
  final String fare;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const CircleAvatar(child: Icon(Icons.directions_car_outlined)),
        const SizedBox(width: 12),
        Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700))),
        Text('$eta • $fare', style: const TextStyle(color: AppColors.mutedText)),
      ],
    );
  }
}
