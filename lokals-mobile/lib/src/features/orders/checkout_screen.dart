import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import '../store/order_cart_controller.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  String _deliveryMethod = 'courier';
  String _paymentMethod = 'cash';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).user;
    _addressController.text =
        [user?.defaultArea, user?.defaultTown].whereType<String>().where((value) => value.isNotEmpty).join(', ');
  }

  @override
  void dispose() {
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(orderCartProvider);
    final grouped = _groupBySeller(cart.items);
    final deliveryFee = _deliveryMethod == 'pickup' ? 0.0 : grouped.length * 18.0;
    final serviceFee = grouped.length * 6.0;
    final total = cart.subtotal + deliveryFee + serviceFee;

    return LokalsShell(
      title: 'Checkout',
      showBack: true,
      floatingActionButton: grouped.isEmpty
          ? null
          : FloatingActionButton.extended(
              onPressed: _submitting ? null : () => _submitOrder(grouped),
              label: Text(_submitting ? 'Placing...' : 'Place order'),
              icon: const Icon(Icons.local_shipping_outlined),
            ),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          SectionTitle(
            eyebrow: 'Orders',
            title: 'Guided checkout',
            subtitle: 'Cart, address, delivery method, payment, and review in one practical local-commerce flow.',
          ),
          const SizedBox(height: 16),
          if (grouped.isEmpty)
            EmptyStateView(
              title: 'Your cart is empty',
              body: 'Add items from the store first.',
              action: AppButton(
                label: 'Browse store',
                expanded: false,
                onPressed: () => context.push('/store'),
              ),
            )
          else ...[
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Cart', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  ...grouped.map((group) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(group.sellerName ?? 'Local seller', style: const TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(height: 10),
                              ...group.items.map((item) => Padding(
                                    padding: const EdgeInsets.only(bottom: 8),
                                    child: Row(
                                      children: [
                                        Expanded(child: Text('${item.quantity} x ${item.title}')),
                                        Text(getDisplayPrice((item.amount * item.quantity).toString())),
                                      ],
                                    ),
                                  )),
                            ],
                          ),
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
                  const Text('Address and instructions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  LokalsTextField(
                    controller: _addressController,
                    label: 'Delivery address',
                    hint: 'House number, area, and town',
                  ),
                  const SizedBox(height: 12),
                  LokalsTextField(
                    controller: _notesController,
                    label: 'Order notes',
                    hint: 'Gate code, landmark, or seller note',
                    maxLines: 3,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Delivery method', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      ChoiceChip(
                        label: const Text('Courier'),
                        selected: _deliveryMethod == 'courier',
                        onSelected: (_) => setState(() => _deliveryMethod = 'courier'),
                      ),
                      ChoiceChip(
                        label: const Text('Pickup'),
                        selected: _deliveryMethod == 'pickup',
                        onSelected: (_) => setState(() => _deliveryMethod = 'pickup'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text('Payment', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      ChoiceChip(
                        label: const Text('Cash'),
                        selected: _paymentMethod == 'cash',
                        onSelected: (_) => setState(() => _paymentMethod = 'cash'),
                      ),
                      ChoiceChip(
                        label: const Text('Wallet'),
                        selected: _paymentMethod == 'wallet',
                        onSelected: (_) => setState(() => _paymentMethod = 'wallet'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Review', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  _summaryRow('Subtotal', getDisplayPrice(cart.subtotal.toString())),
                  _summaryRow('Delivery fee', getDisplayPrice(deliveryFee.toString())),
                  _summaryRow('Service fee', getDisplayPrice(serviceFee.toString())),
                  _summaryRow('Total', getDisplayPrice(total.toString()), highlight: true),
                  const SizedBox(height: 14),
                  Text(
                    _deliveryMethod == 'pickup'
                        ? 'Pickup keeps the order flow available even when delivery is not needed.'
                        : 'Estimated delivery in 25 to 40 minutes around ${AppConfig.pilotTown}.',
                    style: AppTextStyles.bodyMuted,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  List<_SellerOrderGroup> _groupBySeller(List<OrderCartItemModel> items) {
    final map = <String, _SellerOrderGroup>{};
    for (final item in items) {
      final key = '${item.sellerId ?? 0}:${item.sellerName ?? 'seller'}';
      final existing = map[key];
      map[key] = _SellerOrderGroup(
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        items: [...?existing?.items, item],
      );
    }
    return map.values.toList();
  }

  Future<void> _submitOrder(List<_SellerOrderGroup> groups) async {
    if (_deliveryMethod != 'pickup' && _addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add a delivery address first.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final repository = ref.read(discoveryRepositoryProvider);
      CommerceOrderModel? firstOrder;
      for (final group in groups) {
        if (group.sellerId == null) {
          continue;
        }
        final order = await repository.createOrder(
          businessId: group.sellerId!,
          paymentMethod: _paymentMethod,
          deliveryAddress: _deliveryMethod == 'pickup' ? '${group.sellerName ?? 'Seller'} pickup' : _addressController.text.trim(),
          notes: _notesController.text.trim(),
          items: group.items
              .map((item) => {'product_id': item.productId, 'quantity': item.quantity})
              .toList(),
        );
        firstOrder ??= order;
      }
      await ref.read(orderCartProvider.notifier).clear();
      ref.invalidate(commerceOrdersProvider);
      if (!mounted) return;
      if (firstOrder != null) {
        context.go('/orders/${firstOrder.id}');
      } else {
        context.go('/orders');
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to place the order right now.')),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  Widget _summaryRow(String label, String value, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(child: Text(label, style: highlight ? const TextStyle(fontWeight: FontWeight.w700) : null)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: highlight ? const Color(0xFF16A34A) : null,
            ),
          ),
        ],
      ),
    );
  }
}

class _SellerOrderGroup {
  _SellerOrderGroup({
    required this.sellerId,
    required this.sellerName,
    required this.items,
  });

  final int? sellerId;
  final String? sellerName;
  final List<OrderCartItemModel> items;
}
