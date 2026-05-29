import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../features/auth/auth_controller.dart';
import '../../services/contact_action_service.dart';
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
  String _requestStep = 'route';
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
    final recentCouriers =
        (deliveries.asData?.value ?? const <DeliveryModel>[])
            .where(
              (item) =>
                  (item.driverName ?? '').trim().isNotEmpty ||
                  (item.driverPhone ?? '').trim().isNotEmpty,
            )
            .take(3)
            .toList();
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
                recentCouriers: recentCouriers,
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
              const SizedBox(height: 6),
              Text(
                'Reference: ${_successItem!.referenceCode ?? 'Delivery ${_successItem!.id}'}',
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
    required List<DeliveryModel> recentCouriers,
  }) {
    return LayoutBuilder(
      key: const ValueKey('delivery-request'),
      builder: (context, constraints) {
        final isCompactHeight = constraints.maxHeight < 760;
        final optionRowHeight = isCompactHeight ? 100.0 : 104.0;
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
                    title: 'Send local parcel',
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
                  const SizedBox(height: 10),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _StepChip(
                          label: '1. Route',
                          selected: _requestStep == 'route',
                          onTap: () => setState(() => _requestStep = 'route'),
                        ),
                        _StepChip(
                          label: '2. Parcel',
                          selected: _requestStep == 'parcel',
                          onTap: () =>
                              setState(() => _requestStep = 'parcel'),
                        ),
                        _StepChip(
                          label: '3. Review',
                          selected: _requestStep == 'review',
                          onTap: () =>
                              setState(() => _requestStep = 'review'),
                        ),
                      ],
                    ),
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
                          padding: const EdgeInsets.only(bottom: 22),
                          physics: const BouncingScrollPhysics(),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (_requestStep == 'route' ||
                                  _requestStep == 'review') ...[
                                Row(
                                  children: [
                                    const Expanded(
                                      child: Text(
                                        'Popular routes',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    AppBadge(
                                      label: '$_estimatedTotal estimate',
                                      tone: AppBadgeTone.success,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    _QuickDropChip(
                                      label: 'Home to Taxi rank',
                                      onTap: () => setState(() {
                                        _pickupController.text = 'Home';
                                        _dropoffController.text =
                                            'Okahandja taxi rank';
                                      }),
                                    ),
                                    _QuickDropChip(
                                      label: 'Council to Clinic',
                                      onTap: () => setState(() {
                                        _pickupController.text =
                                            'Okahandja Town Council';
                                        _dropoffController.text =
                                            'Okahandja State Clinic';
                                      }),
                                    ),
                                    _QuickDropChip(
                                      label: 'Work to Hall',
                                      onTap: () => setState(() {
                                        _pickupController.text = 'Work';
                                        _dropoffController.text =
                                            'Nau-Aib community hall';
                                      }),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 14),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: AppButton(
                                    label: 'Continue to parcel details',
                                    expanded: false,
                                    variant: AppButtonVariant.secondary,
                                    onPressed: () => setState(
                                      () => _requestStep = 'parcel',
                                    ),
                                  ),
                                ),
                              ],
                              if (_requestStep == 'parcel' ||
                                  _requestStep == 'review') ...[
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
                              ],
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
                              if (_requestStep == 'review') ...[
                                const SizedBox(height: 10),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: AppColors.deepCharcoal,
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Review and confirm',
                                        style: TextStyle(
                                          color: Colors.white70,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      const Text(
                                        'Send local parcel',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      _ReviewRow(
                                        label: 'Route',
                                        value:
                                            '${_pickupController.text.trim()} -> ${_dropoffController.text.trim()}',
                                      ),
                                      _ReviewRow(
                                        label: 'Parcel',
                                        value:
                                            '$_parcelSize | ${_weightController.text.trim().isEmpty ? '0' : _weightController.text.trim()} kg',
                                      ),
                                      _ReviewRow(
                                        label: 'Estimate',
                                        value:
                                            'N\$ $_estimatedTotal | ${_urgency.replaceAll('_', ' ')}',
                                      ),
                                      const SizedBox(height: 12),
                                      Wrap(
                                        spacing: 8,
                                        runSpacing: 8,
                                        children: const [
                                          _TrustPill(
                                            text:
                                                'Track parcel status after booking',
                                          ),
                                          _TrustPill(
                                            text:
                                                'Verified courier details show after assignment',
                                          ),
                                          _TrustPill(
                                            text:
                                                'Safe handling notes help with fragile items',
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(color: AppColors.border),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Recent courier operators',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      const Text(
                                        'Local courier contacts from recent deliveries, if available.',
                                        style: TextStyle(
                                          color: AppColors.mutedText,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      if (recentCouriers.isEmpty)
                                        const Text(
                                          'Courier previews will appear here after accepted or completed deliveries.',
                                          style: TextStyle(
                                            color: AppColors.mutedText,
                                          ),
                                        )
                                      else
                                        ...recentCouriers.map(
                                          (item) => Padding(
                                            padding: const EdgeInsets.only(
                                              bottom: 10,
                                            ),
                                            child: _CourierPreviewCard(
                                              item: item,
                                            ),
                                          ),
                                        ),
                                    ],
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
                        padding: const EdgeInsets.fromLTRB(0, 10, 0, 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.9),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 16,
                              offset: const Offset(0, -6),
                            ),
                          ],
                          border: Border(
                            top: BorderSide(
                              color: AppColors.border.withValues(alpha: 0.68),
                            ),
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: AppButton(
                                label: _isBusy
                                    ? 'Requesting delivery...'
                                    : _requestStep == 'review'
                                    ? (AppConfig.isDemoMode
                                          ? 'Simulate delivery'
                                          : 'Confirm delivery request')
                                    : 'Continue',
                                isLoading: _isBusy,
                                icon: Icons.delivery_dining_rounded,
                                onPressed: _requestStep == 'review'
                                    ? _submitDeliveryRequest
                                    : () => setState(() {
                                        _requestStep = _requestStep == 'route'
                                            ? 'parcel'
                                            : 'review';
                                      }),
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

class _StepChip extends StatelessWidget {
  const _StepChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      label: Text(label),
      backgroundColor:
          selected ? AppColors.purpleSoftAlt : AppColors.neutralSoftAlt,
      labelStyle: TextStyle(
        color: selected ? AppColors.primaryPurple : AppColors.deepCharcoal,
        fontWeight: FontWeight.w800,
      ),
      onPressed: onTap,
    );
  }
}

class _ReviewRow extends StatelessWidget {
  const _ReviewRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.white60,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _TrustPill extends StatelessWidget {
  const _TrustPill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _CourierPreviewCard extends StatelessWidget {
  const _CourierPreviewCard({required this.item});

  final DeliveryModel item;

  @override
  Widget build(BuildContext context) {
    final phone = item.driverPhone;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.neutralSoftAlt,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppBadge(
            label: (item.driverName ?? '').trim().isNotEmpty
                ? 'Recent courier'
                : 'Courier',
            tone: AppBadgeTone.info,
          ),
          const SizedBox(height: 8),
          Text(
            (item.driverName ?? '').trim().isNotEmpty
                ? item.driverName!
                : 'Local courier',
            style: const TextStyle(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            item.driverVehicleType ??
                item.driverVehicleRegistration ??
                'Vehicle details appear when available',
            style: const TextStyle(color: AppColors.mutedText),
          ),
          if (phone != null && phone.trim().isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AppButton(
                  label: 'Call',
                  expanded: false,
                  variant: AppButtonVariant.secondary,
                  onPressed: () =>
                      const ContactActionService().call(context, phone),
                ),
                AppButton(
                  label: 'WhatsApp',
                  expanded: false,
                  onPressed: () => const ContactActionService().openWhatsApp(
                    context,
                    phone: phone,
                    name: item.driverName,
                    message:
                        'Hi, I am checking local parcel delivery options on LOKALS.',
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
