import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../config/app_config.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class DeliveryRequestScreen extends ConsumerStatefulWidget {
  const DeliveryRequestScreen({super.key});

  @override
  ConsumerState<DeliveryRequestScreen> createState() =>
      _DeliveryRequestScreenState();
}

class _DeliveryRequestScreenState extends ConsumerState<DeliveryRequestScreen> {
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  final _itemController = TextEditingController();
  final _priceController = TextEditingController();
  String _parcelSize = 'medium';
  XFile? _photo;
  bool _isBusy = false;
  String? _message;

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
            title: 'Request delivery',
            subtitle: 'Fast local dispatch for goods, errands, and small parcels.',
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              children: [
                LokalsTextField(
                  controller: _pickupController,
                  label: 'Pickup address',
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _dropoffController,
                  label: 'Dropoff address',
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _itemController,
                  label: 'Parcel description',
                  maxLines: 3,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _parcelSize,
                  decoration: const InputDecoration(labelText: 'Parcel size'),
                  items: const [
                    DropdownMenuItem(value: 'small', child: Text('Small envelope')),
                    DropdownMenuItem(value: 'medium', child: Text('Medium parcel')),
                    DropdownMenuItem(value: 'large', child: Text('Large box')),
                  ],
                  onChanged: (value) => setState(() => _parcelSize = value ?? 'medium'),
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _priceController,
                  label: 'Estimated price (optional)',
                  keyboardType: TextInputType.number,
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
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  Text(_message!, style: const TextStyle(color: Colors.green)),
                ],
                const SizedBox(height: 16),
                PrimaryAction(
                  label: AppConfig.isDemoMode ? 'Simulate request' : 'Send request',
                  isBusy: _isBusy,
                  onPressed: () async {
                    if (AppConfig.isDemoMode) {
                      setState(() {
                        _message = 'Demo Mode: delivery request simulated.';
                      });
                      return;
                    }
                    setState(() => _isBusy = true);
                    await ref.read(discoveryRepositoryProvider).createDelivery(
                          pickupAddress: _pickupController.text.trim(),
                          dropoffAddress: _dropoffController.text.trim(),
                          itemDescription: _itemController.text.trim(),
                          parcelSize: _parcelSize,
                          photo: _photo,
                          price: _priceController.text.trim(),
                        );
                    ref.invalidate(deliveriesProvider);
                    if (!mounted) return;
                    setState(() {
                      _isBusy = false;
                      _message = 'Delivery request submitted.';
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const SectionTitle(title: 'Recent delivery requests'),
          const SizedBox(height: 12),
          deliveries.when(
            data: (items) => Column(
              children: items
                  .take(5)
                  .map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: LokalsCard(
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(item.itemDescription),
                          subtitle: Text(
                            '${item.pickupAddress} -> ${item.dropoffAddress}',
                          ),
                          trailing: Text(item.price == null ? (item.status ?? 'Open') : 'N\$ ${item.price}'),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => Text('Failed to load deliveries: $error'),
          ),
        ],
      ),
    );
  }
}
