import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'hire_shared.dart';

class HireBookingDetailsScreen extends ConsumerStatefulWidget {
  const HireBookingDetailsScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  ConsumerState<HireBookingDetailsScreen> createState() =>
      _HireBookingDetailsScreenState();
}

class _HireBookingDetailsScreenState
    extends ConsumerState<HireBookingDetailsScreen> {
  int _tab = 0;
  bool _busy = false;

  @override
  Widget build(BuildContext context) {
    final query = ref.watch(hireBookingDetailsProvider(widget.bookingId));

    return LokalsShell(
      title: 'Hire tracking',
      showBack: true,
      bodyBottomInset: 10,
      child: query.when(
        data: (booking) => ListView(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.viewPaddingOf(context).bottom + 104,
          ),
          children: [
            AppCard(
              padding: EdgeInsets.zero,
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF111827), Color(0xFF16A34A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppBadge(
                      label: hireStatusLabel(booking),
                      tone: hireStatusTone(booking.status),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      booking.referenceCode ?? 'Hire #${booking.id}',
                      style: AppTextStyles.h2.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      booking.nextAction ??
                          'Your hire booking is moving through owner approval, handover, and return steps.',
                      style: AppTextStyles.bodyMuted.copyWith(
                        color: Colors.white.withValues(alpha: 0.84),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _HeroChip(
                          label: hirePickupMethodLabel(booking.pickupMethod),
                        ),
                        _HeroChip(
                          label: getDisplayPrice(booking.totals?.total ?? '0'),
                        ),
                        _HeroChip(
                          label: booking.paymentStatus ?? 'Payment pending',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _tabButton(0, 'Overview'),
                  _tabButton(1, 'Timeline'),
                  _tabButton(2, 'Return'),
                ],
              ),
            ),
            const SizedBox(height: 14),
            if (_tab == 0) ...[
              _ItemSummary(booking: booking),
              const SizedBox(height: 12),
              _TotalsCard(booking: booking),
            ],
            if (_tab == 1) _TimelineCard(booking: booking),
            if (_tab == 2) _ReturnCard(booking: booking),
            const SizedBox(height: 16),
            if (booking.canCancel || booking.canMarkReturned)
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Next action',
                      style: AppTextStyles.h3.copyWith(fontSize: 20),
                    ),
                    const SizedBox(height: 10),
                    if (booking.canMarkReturned)
                      AppButton(
                        label: 'Mark returned',
                        isLoading: _busy,
                        onPressed: () => _runAction(
                          () => ref
                              .read(discoveryRepositoryProvider)
                              .markHireReturned(booking.id),
                        ),
                      ),
                    if (booking.canCancel) ...[
                      if (booking.canMarkReturned) const SizedBox(height: 10),
                      AppButton(
                        label: 'Cancel booking',
                        variant: AppButtonVariant.secondary,
                        isLoading: _busy,
                        onPressed: () => _runAction(() async {
                          await ref
                              .read(discoveryRepositoryProvider)
                              .cancelHireBooking(booking.id);
                          return booking;
                        }),
                      ),
                    ],
                  ],
                ),
              ),
          ],
        ),
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            LoadingSkeleton(height: 180),
            SizedBox(height: 12),
            LoadingSkeleton(height: 52),
            SizedBox(height: 12),
            LoadingSkeleton(height: 220),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Hire booking unavailable',
              body:
                  'This booking may no longer be available, or you may need to sign in again.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(hireBookingDetailsProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _runAction(Future<HireBookingModel> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
      ref.invalidate(hireBookingDetailsProvider(widget.bookingId));
      ref.invalidate(myHireBookingsProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Hire booking updated.')));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to update booking: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  Widget _tabButton(int index, String label) {
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: ChoiceChip(
        label: Text(label),
        selected: _tab == index,
        onSelected: (_) => setState(() => _tab = index),
      ),
    );
  }
}

class _HeroChip extends StatelessWidget {
  const _HeroChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _ItemSummary extends StatelessWidget {
  const _ItemSummary({required this.booking});

  final HireBookingModel booking;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Rental item', style: AppTextStyles.h3.copyWith(fontSize: 20)),
          const SizedBox(height: 10),
          Text(booking.item?.title ?? 'Hire item', style: AppTextStyles.h4),
          const SizedBox(height: 6),
          Text(
            '${booking.item?.category ?? 'Rental'} - ${booking.owner?.name ?? booking.item?.owner?.name ?? 'Local owner'}',
            style: AppTextStyles.bodyMuted,
          ),
          const SizedBox(height: 12),
          _InfoRow('Period', hireBookingPeriodLabel(booking)),
          _InfoRow('Handover', hirePickupMethodLabel(booking.pickupMethod)),
          if ((booking.deliveryInfo?.address ?? '').isNotEmpty)
            _InfoRow('Delivery address', booking.deliveryInfo!.address!),
          _InfoRow('Quantity', '${booking.quantity}'),
        ],
      ),
    );
  }
}

class _TotalsCard extends StatelessWidget {
  const _TotalsCard({required this.booking});

  final HireBookingModel booking;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payment summary',
            style: AppTextStyles.h3.copyWith(fontSize: 20),
          ),
          const SizedBox(height: 12),
          _InfoRow(
            'Rental fee',
            getDisplayPrice(booking.totals?.rentalFee ?? '0'),
          ),
          _InfoRow(
            'Deposit',
            getDisplayPrice(booking.totals?.depositAmount ?? '0'),
          ),
          _InfoRow(
            'Delivery',
            getDisplayPrice(booking.totals?.deliveryFee ?? '0'),
          ),
          const Divider(height: 22),
          _InfoRow(
            'Total',
            getDisplayPrice(booking.totals?.total ?? '0'),
            bold: true,
          ),
        ],
      ),
    );
  }
}

class _TimelineCard extends StatelessWidget {
  const _TimelineCard({required this.booking});

  final HireBookingModel booking;

  @override
  Widget build(BuildContext context) {
    final steps = booking.timeline.isEmpty
        ? [
            HireTimelineStepModel(
              key: booking.status,
              label: hireStatusLabel(booking),
              isCurrent: true,
            ),
          ]
        : booking.timeline;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Timeline', style: AppTextStyles.h3.copyWith(fontSize: 20)),
          const SizedBox(height: 14),
          ...steps.map(
            (step) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: step.isCurrent
                          ? AppColors.primaryPurple
                          : step.isComplete
                          ? AppColors.primaryGreen
                          : AppColors.border,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          step.label,
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          step.timestamp ??
                              (step.isCurrent ? 'Current step' : 'Waiting'),
                          style: AppTextStyles.bodyMuted,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReturnCard extends StatelessWidget {
  const _ReturnCard({required this.booking});

  final HireBookingModel booking;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Return and support',
            style: AppTextStyles.h3.copyWith(fontSize: 20),
          ),
          const SizedBox(height: 10),
          Text(
            booking.canMarkReturned
                ? 'Once the item has been returned to the owner, mark it returned so the booking can move toward completion.'
                : 'Return actions appear here once the item has been handed over or is in use.',
            style: AppTextStyles.bodyMuted.copyWith(height: 1.45),
          ),
          const SizedBox(height: 12),
          AppBadge(
            label: booking.canMarkReturned
                ? 'Return action available'
                : 'No return action yet',
            tone: booking.canMarkReturned
                ? AppBadgeTone.success
                : AppBadgeTone.neutral,
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.label, this.value, {this.bold = false});

  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: Text(label, style: AppTextStyles.bodyMuted)),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontWeight: bold ? FontWeight.w900 : FontWeight.w700,
                color: bold ? AppColors.primaryGreen : AppColors.deepCharcoal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
