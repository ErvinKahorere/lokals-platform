import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';

String hirePricingLabel(HireItemModel item) {
  if (item.prices?.pricePerDay != null &&
      item.prices!.pricePerDay!.isNotEmpty) {
    return '${getDisplayPrice(item.prices!.pricePerDay)} / day';
  }

  if (item.prices?.pricePerHour != null &&
      item.prices!.pricePerHour!.isNotEmpty) {
    return '${getDisplayPrice(item.prices!.pricePerHour)} / hour';
  }

  return 'Price on request';
}

String hireItemLocation(HireItemModel item) {
  final parts = [
    item.area,
    item.town,
  ].whereType<String>().where((part) => part.isNotEmpty).toList();
  if (parts.isEmpty) {
    return 'Okahandja';
  }
  return parts.join(', ');
}

String hireBookingPeriodLabel(HireBookingModel booking) {
  final start = _tryParseDateTime(booking.startAt);
  final end = _tryParseDateTime(booking.endAt);
  if (start == null || end == null) {
    return 'Rental period pending';
  }
  return '${_formatDateTime(start)} - ${_formatDateTime(end)}';
}

String hirePickupMethodLabel(String? pickupMethod) {
  return switch (pickupMethod) {
    'delivery' => 'Delivery',
    'pickup' => 'Pickup',
    _ => 'Handover details pending',
  };
}

String hireStatusLabel(HireBookingModel booking) {
  return booking.statusLabel ?? getStatusLabel(booking.status);
}

AppBadgeTone hireStatusTone(String? status) {
  return switch (status) {
    'completed' || 'returned' => AppBadgeTone.success,
    'cancelled' || 'rejected' || 'disputed' => AppBadgeTone.danger,
    'accepted' ||
    'confirmed' ||
    'handed_over' ||
    'in_use' ||
    'return_due' => AppBadgeTone.info,
    _ => AppBadgeTone.warning,
  };
}

List<({String label, String action, AppButtonVariant variant})>
hireOwnerActions(HireBookingModel booking) {
  return switch (booking.status) {
    'pending' => const [
      (label: 'Accept', action: 'accept', variant: AppButtonVariant.primary),
      (label: 'Reject', action: 'reject', variant: AppButtonVariant.secondary),
    ],
    'accepted' => const [
      (label: 'Confirm', action: 'confirm', variant: AppButtonVariant.primary),
    ],
    'confirmed' => const [
      (
        label: 'Handed over',
        action: 'handed-over',
        variant: AppButtonVariant.primary,
      ),
    ],
    'handed_over' || 'in_use' || 'return_due' => const [
      (
        label: 'Mark returned',
        action: 'returned',
        variant: AppButtonVariant.secondary,
      ),
    ],
    'returned' => const [
      (
        label: 'Complete',
        action: 'complete',
        variant: AppButtonVariant.primary,
      ),
    ],
    _ => const [],
  };
}

DateTime? _tryParseDateTime(String? value) {
  if (value == null || value.isEmpty) {
    return null;
  }
  return DateTime.tryParse(value)?.toLocal();
}

String _formatDateTime(DateTime value) {
  final month = _monthNames[value.month - 1];
  final hour = value.hour % 12 == 0 ? 12 : value.hour % 12;
  final minute = value.minute.toString().padLeft(2, '0');
  final period = value.hour >= 12 ? 'PM' : 'AM';
  return '$month ${value.day}, ${value.year} - $hour:$minute $period';
}

const _monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

class HireItemCard extends StatelessWidget {
  const HireItemCard({super.key, required this.item, required this.onTap});

  final HireItemModel item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final imageUrl = resolveMediaUrl(
      item.images.isNotEmpty ? item.images.first : null,
    );
    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: onTap,
      child: AppCard(
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AppNetworkImage(
                  imageUrl: imageUrl,
                  fallbackIcon: Icons.warehouse_outlined,
                  height: 160,
                  width: double.infinity,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(20),
                  ),
                  backgroundColor: AppColors.purpleSoftAlt,
                ),
                Positioned(
                  left: 14,
                  top: 14,
                  child: AppBadge(
                    label: item.category,
                    tone: AppBadgeTone.info,
                  ),
                ),
                Positioned(
                  right: 14,
                  top: 14,
                  child: AppBadge(
                    label: item.isRequestedWindowAvailable
                        ? 'Available'
                        : 'Booked',
                    tone: item.isRequestedWindowAvailable
                        ? AppBadgeTone.success
                        : AppBadgeTone.warning,
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title, style: AppTextStyles.h4),
                  const SizedBox(height: 6),
                  Text(
                    '${item.business?.name ?? item.owner?.name ?? 'Local owner'} - ${hireItemLocation(item)}',
                    style: AppTextStyles.bodyMuted,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _MiniMetricChip(
                        label: hirePricingLabel(item),
                        color: AppColors.primaryPurple,
                        background: AppColors.purpleSoftAlt,
                      ),
                      _MiniMetricChip(
                        label: item.deposit == null
                            ? 'No deposit'
                            : 'Deposit ${getDisplayPrice(item.deposit)}',
                        color: AppColors.primaryGreen,
                        background: AppColors.successSoft,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (item.pickupAvailable)
                        const AppBadge(
                          label: 'Pickup',
                          tone: AppBadgeTone.neutral,
                        ),
                      if (item.deliveryAvailable)
                        const AppBadge(
                          label: 'Delivery',
                          tone: AppBadgeTone.success,
                        ),
                      if (item.condition != null)
                        AppBadge(
                          label: 'Condition ${item.condition!}',
                          tone: AppBadgeTone.info,
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HireBookingCard extends StatelessWidget {
  const HireBookingCard({
    super.key,
    required this.booking,
    required this.onTap,
    this.trailing,
  });

  final HireBookingModel booking;
  final VoidCallback onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: onTap,
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    booking.referenceCode ?? 'Hire #${booking.id}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                AppBadge(
                  label: hireStatusLabel(booking),
                  tone: hireStatusTone(booking.status),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(booking.item?.title ?? 'Hire item', style: AppTextStyles.h4),
            const SizedBox(height: 6),
            Text(
              '${booking.item?.business?.name ?? booking.owner?.name ?? 'Local owner'} - ${hirePickupMethodLabel(booking.pickupMethod)}',
              style: AppTextStyles.bodyMuted,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Text(
              hireBookingPeriodLabel(booking),
              style: AppTextStyles.bodyMuted,
            ),
            if ((booking.nextAction ?? '').isNotEmpty) ...[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.neutralSoftAlt,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  booking.nextAction!,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.deepCharcoal,
                  ),
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    getDisplayPrice(booking.totals?.total ?? '0'),
                    style: AppTextStyles.h3.copyWith(fontSize: 20),
                  ),
                ),
                trailing ??
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.mutedText,
                    ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniMetricChip extends StatelessWidget {
  const _MiniMetricChip({
    required this.label,
    required this.color,
    required this.background,
  });

  final String label;
  final Color color;
  final Color background;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
