import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

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

class DeliveryRequestScreen extends ConsumerStatefulWidget {
  const DeliveryRequestScreen({super.key});

  @override
  ConsumerState<DeliveryRequestScreen> createState() =>
      _DeliveryRequestScreenState();
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

  static const List<({String value, String label, String detail, int estimate})>
  _parcelSizes = [
    (value: 'small', label: 'Small', detail: 'Envelope', estimate: 45),
    (value: 'medium', label: 'Medium', detail: 'Parcel', estimate: 75),
    (value: 'large', label: 'Large', detail: 'Box', estimate: 120),
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

  @override
  void initState() {
    super.initState();
    _pickupController.addListener(_refresh);
    _dropoffController.addListener(_refresh);
    _weightController.addListener(_refresh);
  }

  void _refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  int get _estimate =>
      _parcelSizes.firstWhere((item) => item.value == _parcelSize).estimate;

  int get _estimatedTotal {
    final urgencyBonus = switch (_urgency) {
      'express' => 25,
      'priority' => 40,
      _ => 0,
    };
    final weight = double.tryParse(_weightController.text.trim()) ?? 0;
    final weightBonus = weight > 5
        ? 18
        : weight > 2
        ? 10
        : 0;
    return _estimate + urgencyBonus + weightBonus;
  }

  @override
  void dispose() {
    _pickupController.removeListener(_refresh);
    _dropoffController.removeListener(_refresh);
    _weightController.removeListener(_refresh);
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
    final auth = ref.watch(authControllerProvider);
    final unreadCount =
        (ref.watch(notificationsProvider).asData?.value ?? const [])
            .where((item) => item.readAt == null)
            .length;
    final activeDelivery = deliveries.asData?.value
        .where(
          (item) => ![
            'delivered',
            'cancelled',
          ].contains((item.status ?? '').toLowerCase()),
        )
        .cast<DeliveryModel?>()
        .firstWhere((item) => item != null, orElse: () => null);
    final area = auth.user?.defaultArea ?? 'Nau-Aib';
    final town = auth.user?.defaultTown ?? AppConfig.pilotTown;

    return LokalsShell(
      title: 'Delivery',
      showAppBar: false,
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
            : _buildLibraryView(
                context,
                deliveries: deliveries,
                activeDelivery: activeDelivery,
              ),
      ),
    );
  }

  Widget _buildSuccessState(BuildContext context) {
    return ListView(
      key: const ValueKey('delivery-success'),
      padding: const EdgeInsets.all(20),
      children: [
        RequestSuccessState(
          title: 'Delivery requested',
          body:
              'Your parcel request is live. A nearby courier can confirm shortly.',
          meta: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${_successItem!.pickupAddress} to ${_successItem!.dropoffAddress}',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              Text(
                'Estimate: N\$ ${_successItem!.price ?? _estimatedTotal}',
                style: const TextStyle(color: AppColors.mutedText),
              ),
            ],
          ),
          primaryLabel: 'View status',
          onPrimary: () => context.push('/delivery/${_successItem!.id}'),
          secondaryLabel: 'Request another delivery',
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
      key: const ValueKey('delivery-request'),
      builder: (context, constraints) {
        final isCompactHeight = constraints.maxHeight < 760;
        final optionRowHeight = isCompactHeight ? 108.0 : 112.0;
        final initialSheetSize = isCompactHeight ? 0.54 : 0.5;

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
                      'You can still request delivery with address-only entry if the map cannot load.',
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
              top: 12,
              left: 14,
              right: 14,
              child: Column(
                children: [
                  TransportFloatingHeader(
                    title: 'Delivery',
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
                  const SizedBox(height: 10),
                  TransportRouteCard(
                    pickupController: _pickupController,
                    destinationController: _dropoffController,
                    pickupLabel: 'Pickup',
                    destinationLabel: 'Drop-off',
                    onAddStop: () => setState(
                      () => _dropoffController.text = 'Okahandja State Clinic',
                    ),
                    quickChips: [
                      _QuickDropChip(
                        label: 'Home',
                        onTap: () =>
                            setState(() => _dropoffController.text = 'Home'),
                      ),
                      _QuickDropChip(
                        label: 'Work',
                        onTap: () =>
                            setState(() => _dropoffController.text = 'Work'),
                      ),
                      _QuickDropChip(
                        label: 'Clinic',
                        onTap: () => setState(
                          () => _dropoffController.text =
                              'Okahandja State Clinic',
                        ),
                      ),
                      _QuickDropChip(
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
            TransportDraggableBottomSheet(
              initialChildSize: initialSheetSize,
              minChildSize: isCompactHeight ? 0.48 : 0.42,
              maxChildSize: 0.88,
              childBuilder: (context, sheetController) => Column(
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
                          controller: sheetController,
                          padding: const EdgeInsets.only(bottom: 16),
                          physics: const BouncingScrollPhysics(),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Expanded(
                                    child: Text(
                                      'Parcel details',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ),
                                  AppBadge(
                                    label: 'N\$ $_estimatedTotal',
                                    tone: AppBadgeTone.success,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              SizedBox(
                                height: optionRowHeight,
                                child: ListView.separated(
                                  scrollDirection: Axis.horizontal,
                                  physics: const BouncingScrollPhysics(),
                                  itemCount: _parcelSizes.length,
                                  separatorBuilder: (_, _) =>
                                      const SizedBox(width: 10),
                                  itemBuilder: (context, index) {
                                    final item = _parcelSizes[index];
                                    return TransportOptionCard(
                                      title: item.label,
                                      subtitle: item.detail,
                                      price: 'N\$ ${item.estimate}',
                                      icon: Icons.inventory_2_outlined,
                                      accentColor: AppColors.lokalsGreen,
                                      isSelected: _parcelSize == item.value,
                                      onTap: () => setState(
                                        () => _parcelSize = item.value,
                                      ),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(height: 10),
                              Wrap(
                                spacing: 10,
                                runSpacing: 10,
                                children: [
                                  TransportCompactStatChip(
                                    label: 'Urgency',
                                    value: _urgency.replaceAll('_', ' '),
                                    accentColor: AppColors.lokalsGreen,
                                  ),
                                  TransportCompactStatChip(
                                    label: 'Weight',
                                    value:
                                        '${_weightController.text.trim().isEmpty ? '0' : _weightController.text.trim()} kg',
                                    accentColor: AppColors.lokalsGreen,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              DropdownButtonFormField<String>(
                                initialValue: _urgency,
                                decoration: const InputDecoration(
                                  labelText: 'Urgency',
                                ),
                                items: const [
                                  DropdownMenuItem(
                                    value: 'standard',
                                    child: Text('Standard'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'express',
                                    child: Text('Express'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'priority',
                                    child: Text('Priority'),
                                  ),
                                ],
                                onChanged: (value) => setState(
                                  () => _urgency = value ?? _urgency,
                                ),
                              ),
                              const SizedBox(height: 10),
                              LokalsTextField(
                                controller: _weightController,
                                label: 'Weight (kg)',
                                hint: 'Approximate parcel weight',
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                      decimal: true,
                                    ),
                              ),
                              const SizedBox(height: 10),
                              LokalsTextField(
                                controller: _itemController,
                                label: 'Parcel description',
                                hint: 'What are you sending?',
                                maxLines: 2,
                              ),
                              const SizedBox(height: 10),
                              ExpansionTile(
                                tilePadding: EdgeInsets.zero,
                                childrenPadding: EdgeInsets.zero,
                                title: const Text(
                                  'Advanced map options',
                                  style: TextStyle(fontWeight: FontWeight.w800),
                                ),
                                subtitle: const Text(
                                  'Open only when you need to adjust pickup or drop-off pins.',
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
                                          label: const Text('Drop-off pin'),
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
                                        : 'Drop-off pin',
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
                                        ? 'Tap to place the pickup pin. Manual address entry still works if location access is denied.'
                                        : 'Tap to place the drop-off pin. Manual address entry still works if the map is unavailable.',
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              ExpansionTile(
                                tilePadding: EdgeInsets.zero,
                                childrenPadding: EdgeInsets.zero,
                                title: const Text(
                                  'Notes and proof',
                                  style: TextStyle(fontWeight: FontWeight.w800),
                                ),
                                subtitle: const Text(
                                  'Optional handoff details and parcel photo.',
                                  style: TextStyle(
                                    color: AppColors.mutedText,
                                    fontSize: 12,
                                  ),
                                ),
                                children: [
                                  LokalsTextField(
                                    controller: _notesController,
                                    label: 'Notes',
                                    hint: 'Optional landmark or handoff detail',
                                    maxLines: 2,
                                  ),
                                  const SizedBox(height: 12),
                                  AppButton(
                                    label: _photo == null
                                        ? 'Add parcel photo'
                                        : 'Change parcel photo',
                                    expanded: false,
                                    variant: AppButtonVariant.secondary,
                                    onPressed: () async {
                                      final file = await ImagePicker()
                                          .pickImage(
                                            source: ImageSource.gallery,
                                            imageQuality: 82,
                                          );
                                      if (file == null) return;
                                      setState(() => _photo = file);
                                    },
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
                              const SizedBox(height: 8),
                            ],
                          ),
                        ),
                      ),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        curve: Curves.easeOut,
                        padding: const EdgeInsets.fromLTRB(0, 12, 0, 2),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.06),
                              blurRadius: 18,
                              offset: const Offset(0, -8),
                            ),
                          ],
                          border: const Border(
                            top: BorderSide(color: AppColors.border),
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: AppButton(
                                label: _isBusy
                                    ? 'Requesting delivery...'
                                    : AppConfig.isDemoMode
                                    ? 'Simulate delivery'
                                    : 'Request delivery',
                                isLoading: _isBusy,
                                icon: Icons.delivery_dining_rounded,
                                onPressed: _submitDeliveryRequest,
                              ),
                            ),
                            const SizedBox(width: 12),
                            SizedBox(
                              width: 92,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    'N\$ $_estimatedTotal',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.lokalsGreen,
                                    ),
                                  ),
                                  const Text(
                                    'Est. fee',
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
                      ),
                    ],
                  ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildLibraryView(
    BuildContext context, {
    required AsyncValue<List<DeliveryModel>> deliveries,
    required DeliveryModel? activeDelivery,
  }) {
    return ListView(
      key: ValueKey('delivery-$_activeTab'),
      padding: const EdgeInsets.all(20),
      children: [
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
        if (_activeTab == 'recent')
          deliveries.when(
            data: (items) => items.isEmpty
                ? const EmptyState(
                    title: 'No delivery requests yet',
                    body:
                        'Your recent Okahandja parcel requests will appear here.',
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
                              subtitle: Text(
                                '${item.pickupAddress} -> ${item.dropoffAddress}',
                              ),
                              trailing: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    item.price == null
                                        ? 'Open'
                                        : 'N\$ ${item.price}',
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
              title: error is MobileAccessException
                  ? 'Delivery history unavailable'
                  : 'Unable to load deliveries',
              body: error is MobileAccessException
                  ? error.message
                  : 'Please try again in a moment.',
              actionLabel: error is MobileAccessException && error.requiresLogin
                  ? 'Login'
                  : 'Retry',
              onAction: () {
                if (error is MobileAccessException && error.requiresLogin) {
                  context.go('/login');
                  return;
                }
                ref.invalidate(deliveriesProvider);
              },
            ),
          ),
        if (_activeTab == 'active')
          activeDelivery != null
              ? TransportPanel(
                  title: 'Active delivery',
                  subtitle:
                      'The parcel request that currently needs attention first.',
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
                        onPressed: () =>
                            context.push('/delivery/${activeDelivery.id}'),
                      ),
                    ],
                  ),
                )
              : const EmptyState(
                  title: 'No active delivery',
                  body:
                      'When a delivery is searching, accepted, or in transit, it will appear here.',
                ),
      ],
    );
  }

  Future<void> _submitDeliveryRequest() async {
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
      final created = await ref
          .read(discoveryRepositoryProvider)
          .createDelivery(
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
        _error =
            'Unable to request delivery right now. You can still keep the address entry and try again.';
      });
    }
  }
}

class _QuickDropChip extends StatelessWidget {
  const _QuickDropChip({required this.label, required this.onTap});

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
