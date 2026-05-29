import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../../shared/widgets/experience/save_button.dart';
import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import 'order_cart_controller.dart';

class ProductCard extends ConsumerWidget {
  const ProductCard({
    super.key,
    required this.product,
  });

  final ProductModel product;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final imageUrl = resolveMediaUrl(product.imageUrl);
    final sellerName =
        product.businessName ?? product.userBusinessName ?? product.userName ?? 'Local seller';
    final locationLabel =
        [product.area, product.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
    final sellerPhone = product.businessPhone ?? product.userPhone;
    final sellerWhatsapp = product.businessWhatsapp ?? product.userWhatsapp ?? product.userPhone;
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: () => context.push('/store/${product.id}'),
      child: AppCard(
        variant: AppCardVariant.marketplace,
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  AppNetworkImage(
                    imageUrl: imageUrl,
                    fallbackIcon: Icons.storefront_rounded,
                    width: double.infinity,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  Positioned(
                    right: 8,
                    top: 8,
                    child: SaveButton(
                      storageId: 'product:${product.id}',
                      itemType: 'product',
                      itemId: product.id,
                      onChanged: (saved) {
                        final label = saved ? 'Saved' : 'Removed from saved';
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(label)));
                      },
                    ),
                  ),
                  if (product.salePrice != null)
                    const Positioned(
                      left: 10,
                      top: 10,
                      child: AppBadge(label: 'Sale', tone: AppBadgeTone.warning),
                    ),
                  if (product.fastDelivery)
                    const Positioned(
                      left: 10,
                      bottom: 10,
                      child: AppBadge(label: 'Fast delivery', tone: AppBadgeTone.success),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTextStyles.h4),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (product.businessVerified)
                        const AppBadge(label: 'Verified seller', tone: AppBadgeTone.success),
                      if ((product.availabilityStatus?.isNotEmpty ?? false))
                        AppBadge(
                          label: product.availabilityStatus!,
                          tone: product.openNow ? AppBadgeTone.success : AppBadgeTone.info,
                        ),
                      if (product.rating != null)
                        AppBadge(label: '${product.rating!.toStringAsFixed(1)} rating', tone: AppBadgeTone.info),
                    ],
                  ),
                  if ((product.availabilityStatus?.isNotEmpty ?? false) || product.rating != null)
                    const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        getDisplayPrice(product.salePrice ?? product.price),
                        style: AppTextStyles.h3.copyWith(fontSize: 18),
                      ),
                      if (product.salePrice != null) ...[
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            getDisplayPrice(product.price),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.caption.copyWith(
                              decoration: TextDecoration.lineThrough,
                              color: AppColors.mutedText,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (product.deliveryEtaMinutes != null || product.deliveryFee != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      '${product.deliveryEtaMinutes != null ? '${product.deliveryEtaMinutes} min' : 'Delivery soon'}${product.deliveryFee != null ? ' • ${getDisplayPrice(product.deliveryFee!)} fee' : ''}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.primaryGreen,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Text(
                    sellerName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.deepCharcoal,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined, size: 14, color: AppColors.mutedText),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          locationLabel.isEmpty ? AppConfig.pilotTown : locationLabel,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Confirm the item and meet safely before payment.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: AppColors.mutedText, fontSize: 12),
                  ),
                  const SizedBox(height: 10),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      if (constraints.maxWidth < 230) {
                        return Column(
                          children: [
                            SizedBox(
                              width: double.infinity,
                              child: AppButton(
                                label: 'Add',
                                compact: true,
                                onPressed: () {
                                  ref.read(orderCartProvider.notifier).addProduct(product);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('${product.title} added to cart')),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              child: AppButton(
                                label: 'Open',
                                compact: true,
                                onPressed: () => context.push('/store/${product.id}'),
                              ),
                            ),
                          ],
                        );
                      }

                      return Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              label: 'Add',
                              compact: true,
                              onPressed: () {
                                ref.read(orderCartProvider.notifier).addProduct(product);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('${product.title} added to cart')),
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: AppButton(
                              label: 'Open',
                              compact: true,
                              onPressed: () => context.push('/store/${product.id}'),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 10),
                  ContactActions(
                    name: sellerName,
                    phone: sellerPhone,
                    whatsapp: sellerWhatsapp,
                    compact: true,
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
