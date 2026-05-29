import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'hire_shared.dart';

class HireItemDetailsScreen extends ConsumerStatefulWidget {
  const HireItemDetailsScreen({super.key, required this.itemId});

  final String itemId;

  @override
  ConsumerState<HireItemDetailsScreen> createState() =>
      _HireItemDetailsScreenState();
}

class _HireItemDetailsScreenState extends ConsumerState<HireItemDetailsScreen> {
  late DateTime _startAt;
  late DateTime _endAt;
  final _notesController = TextEditingController();
  final _deliveryAddressController = TextEditingController();
  String _pickupMethod = 'pickup';
  int _quantity = 1;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _startAt = DateTime(now.year, now.month, now.day + 1, 9);
    _endAt = DateTime(now.year, now.month, now.day + 2, 17);
  }

  @override
  void dispose() {
    _notesController.dispose();
    _deliveryAddressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final request = HireItemRequest(
      id: widget.itemId,
      startAt: _startAt.toIso8601String(),
      endAt: _endAt.toIso8601String(),
    );
    final query = ref.watch(hireItemDetailsProvider(request));

    return LokalsShell(
      title: 'Hire item',
      showBack: true,
      bodyBottomInset: 10,
      child: query.when(
        data: (item) {
          final method = _effectivePickupMethod(item);
          final estimate = _estimate(item, method);
          final imageUrl = resolveMediaUrl(
            item.images.isNotEmpty ? item.images.first : null,
          );

          return Stack(
            children: [
              ListView(
                padding: EdgeInsets.fromLTRB(
                  20,
                  20,
                  20,
                  132,
                ),
                children: [
                  AppCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppNetworkImage(
                          imageUrl: imageUrl,
                          fallbackIcon: Icons.warehouse_outlined,
                          height: 220,
                          width: double.infinity,
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(20),
                          ),
                          backgroundColor: AppColors.purpleSoftAlt,
                        ),
                        Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  AppBadge(
                                    label: item.category,
                                    tone: AppBadgeTone.info,
                                  ),
                                  AppBadge(
                                    label: item.isRequestedWindowAvailable
                                        ? 'Available'
                                        : 'Booked',
                                    tone: item.isRequestedWindowAvailable
                                        ? AppBadgeTone.success
                                        : AppBadgeTone.warning,
                                  ),
                                  AppBadge(
                                    label:
                                        item.verificationStatus ??
                                        'verification pending',
                                    tone: item.verificationStatus == 'approved'
                                        ? AppBadgeTone.success
                                        : AppBadgeTone.warning,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Text(
                                item.title,
                                style: AppTextStyles.h2.copyWith(fontSize: 28),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                item.description ??
                                    'Practical local rental with owner approval and clear pickup or delivery arrangements.',
                                style: AppTextStyles.bodyMuted.copyWith(
                                  height: 1.45,
                                ),
                              ),
                              const SizedBox(height: 14),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  _SoftChip(
                                    icon: Icons.payments_outlined,
                                    label: hirePricingLabel(item),
                                  ),
                                  _SoftChip(
                                    icon: Icons.security_outlined,
                                    label: item.deposit == null
                                        ? 'No deposit'
                                        : 'Deposit ${getDisplayPrice(item.deposit)}',
                                  ),
                                  _SoftChip(
                                    icon: Icons.place_outlined,
                                    label: hireItemLocation(item),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _OwnerCard(item: item),
                  const SizedBox(height: 16),
                  _InfoSection(
                    title: 'Included',
                    emptyLabel: 'Main item and basic handover support',
                    items: item.includedItems,
                    icon: Icons.inventory_2_outlined,
                  ),
                  const SizedBox(height: 16),
                  _InfoSection(
                    title: 'Rules',
                    emptyLabel:
                        'Return the item in the same condition received.',
                    items: item.rules,
                    icon: Icons.rule_folder_outlined,
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Request booking',
                          subtitle:
                              'Choose a rental window and handover method. The owner confirms before the hire starts.',
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: _DateButton(
                                label: 'Start',
                                value: _formatCompact(_startAt),
                                onTap: () => _pickDateTime(isStart: true),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _DateButton(
                                label: 'End',
                                value: _formatCompact(_endAt),
                                onTap: () => _pickDateTime(isStart: false),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            _StepperButton(
                              icon: Icons.remove_rounded,
                              onTap: _quantity <= 1
                                  ? null
                                  : () => setState(() => _quantity -= 1),
                            ),
                            Expanded(
                              child: Center(
                                child: Text(
                                  'Qty $_quantity',
                                  style: AppTextStyles.h4,
                                ),
                              ),
                            ),
                            _StepperButton(
                              icon: Icons.add_rounded,
                              onTap: () => setState(() => _quantity += 1),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: _MethodTile(
                                label: 'Pickup',
                                icon: Icons.storefront_outlined,
                                selected: method == 'pickup',
                                enabled: item.pickupAvailable,
                                onTap: () =>
                                    setState(() => _pickupMethod = 'pickup'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _MethodTile(
                                label: 'Delivery',
                                icon: Icons.local_shipping_outlined,
                                selected: method == 'delivery',
                                enabled: item.deliveryAvailable,
                                onTap: () =>
                                    setState(() => _pickupMethod = 'delivery'),
                              ),
                            ),
                          ],
                        ),
                        if (method == 'delivery') ...[
                          const SizedBox(height: 14),
                          LokalsTextField(
                            controller: _deliveryAddressController,
                            label: 'Delivery address',
                            hint: 'House number, street, area, town',
                          ),
                        ],
                        const SizedBox(height: 14),
                        LokalsTextField(
                          controller: _notesController,
                          label: 'Notes',
                          hint: 'Setup, pickup, or return notes',
                          maxLines: 3,
                        ),
                        const SizedBox(height: 16),
                        _EstimateRows(estimate: estimate),
                      ],
                    ),
                  ),
                ],
              ),
              Positioned(
                left: 16,
                right: 16,
                bottom: 16,
                child: AppCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Estimated total',
                              style: AppTextStyles.caption,
                            ),
                            const SizedBox(height: 3),
                            Text(
                              getDisplayPrice(
                                estimate.total.toStringAsFixed(0),
                              ),
                              style: AppTextStyles.h3.copyWith(fontSize: 22),
                            ),
                          ],
                        ),
                      ),
                      AppButton(
                        label: _submitting ? 'Sending...' : 'Request',
                        expanded: false,
                        isLoading: _submitting,
                        onPressed: item.isRequestedWindowAvailable
                            ? () => _submitBooking(item, method)
                            : null,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            LoadingSkeleton(height: 260),
            SizedBox(height: 16),
            LoadingSkeleton(height: 120),
            SizedBox(height: 16),
            LoadingSkeleton(height: 220),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Hire item unavailable',
              body:
                  'This rental may be paused, removed, or temporarily unavailable.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(hireItemDetailsProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _effectivePickupMethod(HireItemModel item) {
    if (_pickupMethod == 'delivery' && !item.deliveryAvailable) {
      return item.pickupAvailable ? 'pickup' : 'delivery';
    }
    if (_pickupMethod == 'pickup' && !item.pickupAvailable) {
      return item.deliveryAvailable ? 'delivery' : 'pickup';
    }
    return _pickupMethod;
  }

  _HireEstimate _estimate(HireItemModel item, String method) {
    final hours = _endAt.difference(_startAt).inHours.clamp(1, 24 * 30);
    final days = (hours / 24).ceil().clamp(1, 30);
    final pricePerDay = double.tryParse(item.prices?.pricePerDay ?? '');
    final pricePerHour = double.tryParse(item.prices?.pricePerHour ?? '');
    final rental =
        ((pricePerDay != null
                    ? pricePerDay * days
                    : (pricePerHour ?? 0) * hours) *
                _quantity)
            .toDouble();
    final deposit = double.tryParse(item.deposit ?? '') ?? 0;
    final delivery = method == 'delivery' ? 35.0 : 0.0;
    return _HireEstimate(
      rental: rental,
      deposit: deposit,
      delivery: delivery,
      total: rental + deposit + delivery,
    );
  }

  Future<void> _submitBooking(HireItemModel item, String method) async {
    final auth = ref.read(authControllerProvider);
    if (auth.token == null) {
      context.push('/login');
      return;
    }
    if (_endAt.isBefore(_startAt) || _endAt.isAtSameMomentAs(_startAt)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Choose an end time after the start time.'),
        ),
      );
      return;
    }
    if (method == 'delivery' &&
        _deliveryAddressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add a delivery address first.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final booking = await ref
          .read(discoveryRepositoryProvider)
          .createHireBooking(
            itemId: item.id,
            startAt: _startAt,
            endAt: _endAt,
            quantity: _quantity,
            pickupMethod: method,
            deliveryAddress: _deliveryAddressController.text.trim(),
            notes: _notesController.text.trim(),
          );
      ref.invalidate(myHireBookingsProvider);
      if (!mounted) return;
      context.push('/hire/bookings/${booking.id}');
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to request this item: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  Future<void> _pickDateTime({required bool isStart}) async {
    final current = isStart ? _startAt : _endAt;
    final date = await showDatePicker(
      context: context,
      initialDate: current,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 180)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(current),
    );
    if (time == null) return;
    final next = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );
    setState(() {
      if (isStart) {
        _startAt = next;
        if (!_endAt.isAfter(_startAt)) {
          _endAt = _startAt.add(const Duration(days: 1));
        }
      } else {
        _endAt = next;
      }
    });
  }

  String _formatCompact(DateTime value) {
    final hour = value.hour.toString().padLeft(2, '0');
    final minute = value.minute.toString().padLeft(2, '0');
    return '${value.day}/${value.month} $hour:$minute';
  }
}

class _HireEstimate {
  const _HireEstimate({
    required this.rental,
    required this.deposit,
    required this.delivery,
    required this.total,
  });

  final double rental;
  final double deposit;
  final double delivery;
  final double total;
}

class _EstimateRows extends StatelessWidget {
  const _EstimateRows({required this.estimate});

  final _HireEstimate estimate;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _summaryRow('Rental fee', estimate.rental),
        _summaryRow('Deposit', estimate.deposit),
        _summaryRow('Delivery', estimate.delivery),
        const Divider(height: 22),
        _summaryRow('Estimated total', estimate.total, highlight: true),
      ],
    );
  }

  Widget _summaryRow(String label, double value, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTextStyles.bodyMuted)),
          Text(
            getDisplayPrice(value.toStringAsFixed(0)),
            style: TextStyle(
              color: highlight
                  ? AppColors.primaryGreen
                  : AppColors.deepCharcoal,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _OwnerCard extends StatelessWidget {
  const _OwnerCard({required this.item});

  final HireItemModel item;

  @override
  Widget build(BuildContext context) {
    final ownerName = item.business?.name ?? item.owner?.name ?? 'Local owner';
    return AppCard(
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.purpleSoftAlt,
            child: Text(
              ownerName.characters.first.toUpperCase(),
              style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(ownerName, style: AppTextStyles.h4),
                const SizedBox(height: 4),
                Text(
                  '${hireItemLocation(item)} - ${item.business?.isVerified == true ? 'Verified owner' : 'Owner details verified on booking'}',
                  style: AppTextStyles.bodyMuted,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  const _InfoSection({
    required this.title,
    required this.emptyLabel,
    required this.items,
    required this.icon,
  });

  final String title;
  final String emptyLabel;
  final List<String> items;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final rows = items.isEmpty ? [emptyLabel] : items;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.h3.copyWith(fontSize: 20)),
          const SizedBox(height: 12),
          ...rows.map(
            (row) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(icon, size: 18, color: AppColors.primaryGreen),
                  const SizedBox(width: 10),
                  Expanded(child: Text(row, style: AppTextStyles.bodyMuted)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SoftChip extends StatelessWidget {
  const _SoftChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.neutralSoftAlt,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.primaryPurple),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.deepCharcoal,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _DateButton extends StatelessWidget {
  const _DateButton({
    required this.label,
    required this.value,
    required this.onTap,
  });

  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.neutralSoftAlt,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTextStyles.caption),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w800),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _MethodTile extends StatelessWidget {
  const _MethodTile({
    required this.label,
    required this.icon,
    required this.selected,
    required this.enabled,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1 : 0.45,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: enabled ? onTap : null,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: selected ? AppColors.successSoft : AppColors.neutralSoftAlt,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: selected ? AppColors.primaryGreen : AppColors.border,
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: selected ? AppColors.primaryGreen : AppColors.mutedText,
              ),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepperButton extends StatelessWidget {
  const _StepperButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return IconButton.filledTonal(onPressed: onTap, icon: Icon(icon));
  }
}
