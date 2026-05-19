import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../store/order_cart_controller.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(commerceOrdersProvider);
    final cart = ref.watch(orderCartProvider);

    return LokalsShell(
      title: 'Orders',
      showBack: true,
      child: orders.when(
        data: (items) => ListView(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.viewPaddingOf(context).bottom + 100),
          children: [
            SectionTitle(
              eyebrow: 'Order delivery',
              title: 'Track shop and food orders',
              subtitle: 'Keep customer order delivery separate from parcel delivery while reusing the same trusted courier workflow.',
              action: AppButton(
                label: cart.totalItems > 0 ? 'Cart (${cart.totalItems})' : 'Open cart',
                expanded: false,
                onPressed: () => context.push('/orders/checkout'),
              ),
            ),
            const SizedBox(height: 16),
            if (items.isEmpty)
              const EmptyStateView(
                title: 'No orders yet',
                body: 'Add products from local stores and your order history will appear here.',
              )
            else
              ...items.map((order) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _OrderCard(order: order),
                  )),
          ],
        ),
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            LoadingSkeleton(height: 90),
            SizedBox(height: 12),
            LoadingSkeleton(height: 140),
            SizedBox(height: 12),
            LoadingSkeleton(height: 140),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Orders unavailable',
              body: 'Please try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(commerceOrdersProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});

  final CommerceOrderModel order;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  order.referenceCode ?? 'Order #${order.id}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
              ),
              AppBadge(
                label: order.statusLabel ?? order.status,
                tone: order.status == 'delivered' ? AppBadgeTone.success : AppBadgeTone.info,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(order.sellerName ?? 'Local seller', style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(order.deliveryAddress ?? 'Delivery address pending', style: AppTextStyles.bodyMuted),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  order.total == null ? 'N\$0' : getDisplayPrice(order.total!),
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                ),
              ),
              AppButton(
                label: 'Track',
                expanded: false,
                onPressed: () => context.push('/orders/${order.id}'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
