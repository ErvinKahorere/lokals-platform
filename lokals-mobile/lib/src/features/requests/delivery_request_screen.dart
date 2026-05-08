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

class DeliveryRequestScreen extends ConsumerStatefulWidget {
  const DeliveryRequestScreen({super.key});

  @override
  ConsumerState<DeliveryRequestScreen> createState() => _DeliveryRequestScreenState();
}

class _DeliveryRequestScreenState extends ConsumerState<DeliveryRequestScreen> {
  static const List<String> _locations = [
    'Home',
    'Work',
    'Khomasdal taxi rank',
    'Khomas Care Pharmacy',
    'Wanaheda Corner Shop',
    'Windhoek CBD',
  ];

  static const List<({String value, String label, String detail, int estimate})> _parcelSizes = [
    (value: 'small', label: 'Small envelope', detail: 'Light documents or medicine', estimate: 45),
    (value: 'medium', label: 'Medium parcel', detail: 'Groceries, gifts, or boxed goods', estimate: 75),
    (value: 'large', label: 'Large box', detail: 'Bulkier items needing extra care', estimate: 120),
  ];

  String _pickupAddress = _locations.first;
  String _dropoffAddress = _locations.last;
  final _itemController = TextEditingController();
  final _notesController = TextEditingController();
  String _parcelSize = 'medium';
  XFile? _photo;
  bool _isBusy = false;
  String? _error;
  DeliveryModel? _successItem;

  int get _estimate => _parcelSizes.firstWhere((item) => item.value == _parcelSize).estimate;

  @override
  void dispose() {
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
                  Text('Estimate: N\$ ${_successItem!.price ?? _estimate}', style: const TextStyle(color: AppColors.mutedText)),
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
                  DropdownButtonFormField<String>(
                    initialValue: _pickupAddress,
                    decoration: const InputDecoration(labelText: 'Pickup location'),
                    items: _locations.map((option) => DropdownMenuItem(value: option, child: Text(option))).toList(),
                    onChanged: (value) => setState(() => _pickupAddress = value ?? _pickupAddress),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _dropoffAddress,
                    decoration: const InputDecoration(labelText: 'Drop-off location'),
                    items: _locations.map((option) => DropdownMenuItem(value: option, child: Text(option))).toList(),
                    onChanged: (value) => setState(() => _dropoffAddress = value ?? _dropoffAddress),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _locations.take(4).map((location) {
                      return ActionChip(
                        label: Text(location),
                        onPressed: () => setState(() => _dropoffAddress = location),
                      );
                    }).toList(),
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
                        Text('N\$ $_estimate', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 6),
                        Text('$_pickupAddress to $_dropoffAddress', style: const TextStyle(color: AppColors.mutedText)),
                      ],
                    ),
                  ),
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
                            price: _estimate.toString(),
                            parcelSize: _parcelSize,
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
                              pickupAddress: _pickupAddress,
                              dropoffAddress: _dropoffAddress,
                              itemDescription: _itemController.text.trim(),
                              parcelSize: _parcelSize,
                              notes: _notesController.text.trim(),
                              photo: _photo,
                              price: _estimate.toString(),
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
                    body: 'Your recent parcel requests will appear here.',
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
