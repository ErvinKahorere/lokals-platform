import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class OrderDetailsScreen extends ConsumerStatefulWidget {
  const OrderDetailsScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends ConsumerState<OrderDetailsScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final order = ref.watch(commerceOrderDetailsProvider(widget.orderId));

    return LokalsShell(
      title: 'Order details',
      showBack: true,
      child: order.when(
        data: (item) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
          children: [
            AppCard(
              padding: EdgeInsets.zero,
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF111827), Color(0xFF16A34A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppBadge(
                      label: item.statusLabel ?? item.status,
                      tone: item.status == 'delivered' ? AppBadgeTone.success : AppBadgeTone.info,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      item.referenceCode ?? 'Order #${item.id}',
                      style: AppTextStyles.h2.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item.nextActionLabel ?? 'Your order is moving through the seller and courier flow.',
                      style: AppTextStyles.bodyMuted.copyWith(color: Colors.white.withValues(alpha: 0.84)),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _InfoChip(label: item.estimatedArrivalMinutes == null ? 'ETA updating' : '${item.estimatedArrivalMinutes} min ETA'),
                        _InfoChip(label: item.total == null ? 'N\$0' : getDisplayPrice(item.total!)),
                        _InfoChip(label: item.courierName ?? 'Courier soon'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _tabButton(0, 'Overview'),
                  _tabButton(1, 'Timeline'),
                  _tabButton(2, 'Route'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (_tab == 0) ...[
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Order items', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 12),
                    ...item.items.map((line) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Row(
                            children: [
                              Expanded(child: Text('${line.quantity} x ${line.name}')),
                              Text(getDisplayPrice(line.totalPrice)),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Receipt summary', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 12),
                    _summaryRow('Subtotal', getDisplayPrice(item.subtotal ?? '0')),
                    _summaryRow('Delivery fee', getDisplayPrice(item.deliveryFee ?? '0')),
                    _summaryRow('Service fee', getDisplayPrice(item.serviceFee ?? '0')),
                    _summaryRow('Total', getDisplayPrice(item.total ?? '0'), highlight: true),
                  ],
                ),
              ),
            ],
            if (_tab == 1)
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Tracking timeline', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 12),
                    ...item.trackingSteps.map((step) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                margin: const EdgeInsets.only(top: 4),
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: step.isCurrent
                                      ? AppColors.primaryPurple
                                      : step.isComplete
                                          ? AppColors.primaryGreen
                                          : AppColors.border,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(step.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                                    const SizedBox(height: 4),
                                    Text(
                                      step.timestamp ?? (step.isCurrent ? 'Happening now' : 'Waiting for update'),
                                      style: AppTextStyles.bodyMuted,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            if (_tab == 2)
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Route', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 12),
                    _routeBlock('Pickup', item.pickupAddress ?? 'Seller pickup point pending'),
                    const SizedBox(height: 10),
                    _routeBlock('Delivery', item.deliveryAddress ?? 'Delivery address pending'),
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
            LoadingSkeleton(height: 200),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Order unavailable',
              body: 'Please try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(commerceOrderDetailsProvider(widget.orderId)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _tabButton(int index, String label) {
    final active = _tab == index;
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: ChoiceChip(
        label: Text(label),
        selected: active,
        onSelected: (_) => setState(() => _tab = index),
      ),
    );
  }

  Widget _routeBlock(String label, String value) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: highlight ? AppColors.primaryGreen : AppColors.deepCharcoal,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label});

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
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
