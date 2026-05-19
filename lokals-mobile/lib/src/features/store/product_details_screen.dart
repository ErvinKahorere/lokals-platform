import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../../shared/widgets/experience/save_button.dart';
import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../auth/auth_navigation.dart';
import '../discovery/discovery_repository.dart';
import 'order_cart_controller.dart';
import 'product_card.dart';

class ProductDetailsScreen extends ConsumerStatefulWidget {
  const ProductDetailsScreen({super.key, required this.productId});

  final String productId;

  @override
  ConsumerState<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends ConsumerState<ProductDetailsScreen> {
  bool _followBusy = false;

  Future<void> _openConversation({
    required int participantId,
    required String subject,
    required String contextKey,
  }) async {
    final auth = ref.read(authControllerProvider);
    if (auth.token == null) {
      promptSignIn(
        context,
        next: GoRouterState.of(context).uri.toString(),
      );
      return;
    }

    final scaffold = ScaffoldMessenger.of(context);

    try {
      final payload = await ref.read(discoveryRepositoryProvider).createConversation(
            participantIds: [participantId],
            context: contextKey,
            subject: subject,
          );
      if (!mounted) return;
      final data = Map<String, dynamic>.from((payload['data'] as Map?) ?? payload);
      final conversationId = data['id']?.toString();
      if (conversationId == null || conversationId.isEmpty) {
        scaffold.showSnackBar(
          const SnackBar(content: Text('We could not open this conversation right now.')),
        );
        return;
      }
      context.push('/conversations/$conversationId');
    } catch (_) {
      if (!mounted) return;
      scaffold.showSnackBar(
        const SnackBar(content: Text('We could not open this conversation right now.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final productQuery = ref.watch(productDetailsProvider(widget.productId));
    final productsQuery = ref.watch(storeProductsProvider(null));
    final alertsQuery = ref.watch(saleAlertsProvider);
    final followedOrganizationIds = ref.watch(followedOrganizationIdsProvider);

    return LokalsShell(
      title: 'Product details',
      showBack: true,
      floatingActionButton: productQuery.asData?.value == null
          ? null
          : FloatingActionButton.extended(
              onPressed: () {
                ref.read(orderCartProvider.notifier).addProduct(productQuery.asData!.value);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('${productQuery.asData!.value.title} added to cart')),
                );
              },
              label: const Text('Add to cart'),
              icon: const Icon(Icons.add_shopping_cart_rounded),
            ),
      child: productQuery.when(
        data: (item) {
          final imageUrl = resolveMediaUrl(item.imageUrl);
          final sellerName = item.businessName ?? item.userBusinessName ?? item.userName ?? 'Local seller';
          final sellerPhone = item.businessPhone ?? item.userPhone;
          final sellerWhatsapp = item.businessWhatsapp ?? item.userWhatsapp ?? sellerPhone;
          final locationLabel = [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
          final relatedProducts = (productsQuery.asData?.value ?? [])
              .where((product) => product.id != item.id && (product.category == item.category || product.businessId == item.businessId))
              .take(4)
              .toList();
          final sellerProducts = (productsQuery.asData?.value ?? [])
              .where((product) => product.id != item.id && ((item.businessId != null && product.businessId == item.businessId) || (item.userId != null && product.userId == item.userId)))
              .take(3)
              .toList();
          final sellerAlerts = (alertsQuery.asData?.value ?? [])
              .where((alert) => item.businessId != null && alert.organizationId == item.businessId)
              .take(2)
              .toList();
          final isFollowing = item.businessId != null && (followedOrganizationIds.asData?.value.contains(item.businessId) ?? false);
          final messenger = ScaffoldMessenger.of(context);

          Future<void> toggleFollow() async {
            if (item.businessId == null) {
              return;
            }

            setState(() => _followBusy = true);
            try {
              if (isFollowing) {
                await ref.read(discoveryRepositoryProvider).unfollowOrganization(item.businessId!);
                ref.invalidate(followedOrganizationIdsProvider);
                if (!mounted) {
                  return;
                }
                messenger.showSnackBar(const SnackBar(content: Text('Unfollowed')));
              } else {
                await ref.read(discoveryRepositoryProvider).followOrganization(item.businessId!);
                ref.invalidate(followedOrganizationIdsProvider);
                if (!mounted) {
                  return;
                }
                messenger.showSnackBar(const SnackBar(content: Text('Following')));
              }
            } finally {
              if (mounted) {
                setState(() => _followBusy = false);
              }
            }
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
            children: [
              AppCard(
                padding: EdgeInsets.zero,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        AppNetworkImage(
                          imageUrl: imageUrl,
                          fallbackIcon: Icons.inventory_2_outlined,
                          height: 240,
                          width: double.infinity,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                        ),
                        Positioned(
                          right: 12,
                          top: 12,
                          child: SaveButton(
                            storageId: 'product:${item.id}',
                            itemType: 'product',
                            itemId: item.id,
                            onChanged: (saved) {
                              final label = saved ? 'Saved' : 'Removed from saved';
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(label)));
                            },
                          ),
                        ),
                      ],
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
                              AppBadge(label: item.category ?? 'Product', tone: AppBadgeTone.info),
                              AppBadge(label: _stockLabel(item.stockStatus), tone: _stockTone(item.stockStatus)),
                              if (item.salePrice != null) const AppBadge(label: 'On sale', tone: AppBadgeTone.warning),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(item.title, style: AppTextStyles.h2.copyWith(fontSize: 28)),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Text(
                                getDisplayPrice(item.salePrice ?? item.price),
                                style: AppTextStyles.h2.copyWith(color: AppColors.primaryPurple),
                              ),
                              if (item.salePrice != null) ...[
                                const SizedBox(width: 10),
                                Text(
                                  getDisplayPrice(item.price),
                                  style: AppTextStyles.bodyMuted.copyWith(decoration: TextDecoration.lineThrough),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              const Icon(Icons.place_outlined, size: 16, color: AppColors.mutedText),
                              const SizedBox(width: 6),
                              Text(locationLabel.isEmpty ? AppConfig.pilotTown : locationLabel, style: AppTextStyles.bodyMuted),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              const Text('Description', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (item.description?.trim().isNotEmpty ?? false)
                          ? item.description!
                          : 'Local seller listing with direct enquiry and flexible pickup or delivery options.',
                      style: AppTextStyles.bodyMuted.copyWith(height: 1.5),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        AppBadge(label: 'Condition: Good', tone: AppBadgeTone.info),
                        AppBadge(label: 'Status: ${_stockLabel(item.stockStatus)}', tone: _stockTone(item.stockStatus)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  const Expanded(
                    child: Text('Seller', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  ),
                  if (item.businessId != null)
                    AppButton(
                      label: isFollowing ? 'Following' : 'Follow',
                      expanded: false,
                      variant: isFollowing ? AppButtonVariant.primary : AppButtonVariant.secondary,
                      onPressed: _followBusy ? null : toggleFollow,
                    ),
                ],
              ),
              const SizedBox(height: 12),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        AppAvatarImage(
                          name: sellerName,
                          imageUrl: resolveMediaUrl(item.businessLogoUrl ?? item.userAvatar),
                          radius: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(child: Text(sellerName, style: AppTextStyles.h4)),
                                  if (item.businessVerified) ...[
                                    const SizedBox(width: 8),
                                    const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(locationLabel.isEmpty ? AppConfig.pilotTown : locationLabel, style: AppTextStyles.bodyMuted),
                              const SizedBox(height: 4),
                              Text(
                                item.userId != null
                                    ? 'Message, call, or WhatsApp this seller directly.'
                                    : 'Replies by call or WhatsApp for now.',
                                style: AppTextStyles.caption,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    if (item.businessId != null)
                      AppButton(
                        label: 'View Seller Store',
                        variant: AppButtonVariant.secondary,
                        onPressed: () => context.push('/directory/${item.businessId}'),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              ContactActions(
                name: sellerName,
                phone: sellerPhone,
                whatsapp: sellerWhatsapp,
                onMessage: item.userId == null
                    ? null
                    : () => _openConversation(
                          participantId: item.userId!,
                          subject: item.title,
                          contextKey: 'marketplace',
                        ),
              ),
              if (sellerProducts.isNotEmpty) ...[
                const SizedBox(height: 18),
                const Text('Recent from this seller', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                SizedBox(
                  height: 260,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (context, index) => SizedBox(
                      width: 190,
                      child: ProductCard(product: sellerProducts[index]),
                    ),
                    separatorBuilder: (context, index) => const SizedBox(width: 12),
                    itemCount: sellerProducts.length,
                  ),
                ),
              ],
              if (sellerAlerts.isNotEmpty) ...[
                const SizedBox(height: 18),
                const Text('Active sale alerts', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                ...sellerAlerts.map(
                  (alert) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      color: AppColors.warningSoft,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const AppBadge(label: 'Promotion', tone: AppBadgeTone.warning),
                          const SizedBox(height: 10),
                          Text(alert.title, style: AppTextStyles.h4),
                          const SizedBox(height: 6),
                          Text(alert.body, style: AppTextStyles.bodyMuted),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 18),
              const Text('Related products', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              if (relatedProducts.isEmpty)
                const EmptyStateView(
                  title: 'No related products yet.',
                  body: 'More similar listings will appear here soon.',
                )
              else
                _RelatedProductsGrid(items: relatedProducts),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading product',
          message: 'Preparing seller details and nearby offers...',
        ),
        error: (error, _) => const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Product unavailable',
              body: 'We could not load this product right now.',
            ),
          ),
        ),
      ),
    );
  }

  static String _stockLabel(String? status) {
    return switch (status) {
      'limited' => 'Limited stock',
      'out_of_stock' => 'Out of stock',
      _ => 'In stock',
    };
  }

  static AppBadgeTone _stockTone(String? status) {
    return switch (status) {
      'limited' => AppBadgeTone.warning,
      'out_of_stock' => AppBadgeTone.danger,
      _ => AppBadgeTone.success,
    };
  }
}

class _RelatedProductsGrid extends StatelessWidget {
  const _RelatedProductsGrid({required this.items});

  final List<ProductModel> items;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.7,
      ),
      itemBuilder: (context, index) => ProductCard(product: items[index]),
    );
  }
}
