import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class ProductDetailsScreen extends ConsumerWidget {
  const ProductDetailsScreen({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final product = ref.watch(productDetailsProvider(productId));

    return LokalsShell(
      title: 'Product details',
      showBack: true,
      child: product.when(
        data: (item) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            SectionTitle(
              title: item.title,
              subtitle: item.description ?? 'Local product listing.',
            ),
            const SizedBox(height: 16),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(getDisplayPrice(item.salePrice ?? item.price), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                  if (item.salePrice != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        getDisplayPrice(item.price),
                        style: const TextStyle(color: Color(0xFF64748B), decoration: TextDecoration.lineThrough),
                      ),
                    ),
                  const SizedBox(height: 12),
                  Text(item.businessName ?? item.userName ?? 'Local seller'),
                  const SizedBox(height: 8),
                  Text(item.area ?? item.town ?? 'Windhoek', style: const TextStyle(color: Color(0xFF64748B))),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: PrimaryAction(label: 'Contact seller', onPressed: () {})),
                      const SizedBox(width: 10),
                      Expanded(child: AppButton(label: 'Save', variant: AppButtonVariant.secondary, onPressed: () {})),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Product unavailable: $error')),
      ),
    );
  }
}
