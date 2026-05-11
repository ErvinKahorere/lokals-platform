import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/experience/quick_call_button.dart';
import '../../../shared/widgets/experience/save_button.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.product,
  });

  final ProductModel product;

  @override
  Widget build(BuildContext context) {
    final imageUrl = resolveMediaUrl(product.imageUrl);
    final sellerName = product.businessName ?? product.userBusinessName ?? product.userName ?? 'Local seller';
    final locationLabel = [product.area, product.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
    final sellerPhone = product.businessPhone ?? product.userPhone;

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
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.neutralSoft,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                      image: imageUrl != null
                          ? DecorationImage(
                              image: NetworkImage(imageUrl),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: imageUrl == null
                        ? const Center(
                            child: Icon(Icons.storefront_rounded, color: AppColors.mutedText, size: 36),
                          )
                        : null,
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
                  const SizedBox(height: 6),
                  Text(
                    sellerName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal, fontWeight: FontWeight.w700),
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
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: QuickCallButton(phone: sellerPhone),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: AppButton(
                          label: 'View',
                          expanded: false,
                          onPressed: () => context.push('/store/${product.id}'),
                        ),
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
