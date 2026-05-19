import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'order_cart_controller.dart';
import 'product_card.dart';

class StoreScreen extends ConsumerStatefulWidget {
  const StoreScreen({super.key});

  @override
  ConsumerState<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends ConsumerState<StoreScreen> {
  final _searchController = TextEditingController();
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _categoryController = TextEditingController(text: 'electronics');
  final _townController = TextEditingController(text: AppConfig.pilotTown);
  final _areaController = TextEditingController(text: AppConfig.okahandjaAreas.first);
  final _descriptionController = TextEditingController();
  XFile? _image;
  String _selectedCategory = 'all';
  String _sortBy = 'newest';
  bool _saleOnly = false;
  bool _verifiedOnly = false;
  bool _saving = false;

  static const _categoryChips = [
    ('all', 'All', Icons.grid_view_rounded, Color(0xFFF3F4F6), AppColors.deepCharcoal),
    ('electronics', 'Electronics', Icons.phone_android_rounded, Color(0xFFE0ECFF), AppColors.softBlue),
    ('home', 'Home', Icons.chair_alt_outlined, Color(0xFFECFDF3), AppColors.primaryGreen),
    ('clothing', 'Clothing', Icons.checkroom_rounded, Color(0xFFF3E8FF), AppColors.primaryPurple),
    ('food', 'Food', Icons.fastfood_rounded, Color(0xFFFFF7CC), AppColors.warning),
    ('building', 'Building', Icons.hardware_rounded, Color(0xFFFFF3E8), Color(0xFFD97706)),
    ('vehicles', 'Vehicles', Icons.directions_car_outlined, Color(0xFFE2E8F0), AppColors.deepCharcoal),
    ('services', 'Services', Icons.miscellaneous_services_rounded, Color(0xFFE0F2FE), AppColors.softBlue),
    ('other', 'Other', Icons.more_horiz_rounded, Color(0xFFF1F5F9), AppColors.deepCharcoal),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    _titleController.dispose();
    _priceController.dispose();
    _categoryController.dispose();
    _townController.dispose();
    _areaController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;
    final scrollBottomPadding = safeBottom + 132;
    final productsQuery = ref.watch(storeProductsProvider(null));
    final alertsQuery = ref.watch(saleAlertsProvider);
    final cart = ref.watch(orderCartProvider);

    return LokalsShell(
      title: 'Store',
      showBack: true,
      bodyBottomInset: 10,
      floatingActionButton: cart.totalItems > 0
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/orders/checkout'),
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: Colors.white,
              label: Text('Cart (${cart.totalItems})'),
              icon: const Icon(Icons.shopping_bag_outlined),
            )
          : FloatingActionButton.extended(
              onPressed: _openPostProductSheet,
              label: const Text('Post'),
              icon: const Icon(Icons.add_box_outlined),
            ),
      child: productsQuery.when(
        data: (items) {
          final filtered = _applyFilters(items);
          final featured = filtered.where((item) => item.salePrice != null || item.businessVerified).take(4).toList();
          final recent = [...filtered]..sort((a, b) => b.id.compareTo(a.id));
          final localSellers = _buildSellerCards(filtered);

          return ListView(
            padding: EdgeInsets.fromLTRB(20, 20, 20, scrollBottomPadding),
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Marketplace', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800)),
                        SizedBox(height: 6),
                        Text('Shop local deals around Okahandja and discover trusted nearby sellers.', style: AppTextStyles.bodyMuted),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Saved items are stored locally for now.')),
                    ),
                    icon: const Icon(Icons.favorite_border_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              AppSearchBar(
                controller: _searchController,
                hintText: 'Search products in Okahandja...',
                recentKey: 'store',
                suggestions: const ['Samsung phone', 'Couch deal', 'Food voucher', 'Toyota Hilux'],
                shortcuts: const ['Electronics', 'Sale items', 'Home', 'Building'],
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 12),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Expanded(
                          child: SectionTitle(
                            title: 'Browse smarter',
                            subtitle:
                                'Keep category, seller, and sale filters together in one clean marketplace control area.',
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.purpleSoftAlt,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            _areaController.text.isEmpty ? AppConfig.pilotTown : '${_areaController.text}, ${AppConfig.pilotTown}',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.primaryPurple,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _categoryChips
                            .map(
                              (chip) => Padding(
                                padding: const EdgeInsets.only(right: 10),
                                child: _CategoryChip(
                                  icon: chip.$3,
                                  label: chip.$2,
                                  background: chip.$4,
                                  iconColor: chip.$5,
                                  selected: _selectedCategory == chip.$1,
                                  onTap: () => setState(() => _selectedCategory = chip.$1),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        ChoiceChip(
                          label: const Text('Sale items'),
                          selected: _saleOnly,
                          onSelected: (_) => setState(() => _saleOnly = !_saleOnly),
                        ),
                        ChoiceChip(
                          label: const Text('Verified sellers'),
                          selected: _verifiedOnly,
                          onSelected: (_) => setState(() => _verifiedOnly = !_verifiedOnly),
                        ),
                        ChoiceChip(
                          label: Text(_sortBy == 'price_low_high' ? 'Price low-high' : _sortBy == 'price_high_low' ? 'Price high-low' : 'Newest'),
                          selected: true,
                          onSelected: (_) => _showSortSheet(),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SectionTitle(
                title: 'Sale alerts',
                subtitle: 'Promotions and limited-time local offers.',
                action: TextButton(onPressed: () => setState(() => _saleOnly = true), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              alertsQuery.when(
                data: (alerts) {
                  if (alerts.isEmpty) {
                    return const EmptyStateView(
                      title: 'No sale alerts right now.',
                      body: 'Fresh promotions from Okahandja sellers will show here.',
                    );
                  }

                  return SizedBox(
                    height: 150,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemBuilder: (context, index) {
                        final alert = alerts[index];
                        return SizedBox(
                          width: 260,
                          child: AppCard(
                            color: index.isEven ? AppColors.warningSoft : AppColors.purpleSoftAlt,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const AppBadge(label: 'Promotion', tone: AppBadgeTone.warning),
                                const SizedBox(height: 10),
                                Text(alert.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppTextStyles.h4),
                                const SizedBox(height: 8),
                                Text(alert.body, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppTextStyles.bodyMuted),
                                const Spacer(),
                                TextButton(
                                  onPressed: () => setState(() => _saleOnly = true),
                                  child: const Text('View products'),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                      separatorBuilder: (context, index) => const SizedBox(width: 12),
                      itemCount: alerts.length.clamp(0, 5),
                    ),
                  );
                },
                loading: () => const LoadingSkeleton(height: 150),
                error: (error, _) => const EmptyStateView(
                  title: 'Sale alerts unavailable',
                  body: 'Please try again in a moment.',
                ),
              ),
              const SizedBox(height: 20),
              SectionTitle(
                title: 'Featured listings',
                subtitle: 'Popular local products and current deals.',
                action: TextButton(onPressed: () => setState(() => _saleOnly = false), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              _ProductGrid(items: featured.isEmpty ? filtered.take(4).toList() : featured),
              const SizedBox(height: 20),
              SectionTitle(
                title: 'Recent listings',
                subtitle: 'Fresh items added by nearby sellers.',
                action: TextButton(onPressed: () => context.push('/store'), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              if (recent.isEmpty)
                const EmptyStateView(
                  title: 'No products in Okahandja yet.',
                  body: 'Try another category.',
                )
              else
                _ProductGrid(items: recent.take(6).toList()),
              const SizedBox(height: 20),
              SectionTitle(
                title: 'Local sellers',
                subtitle: 'Businesses and sellers active in your area.',
                action: TextButton(onPressed: () => context.push('/directory'), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              if (localSellers.isEmpty)
                const EmptyStateView(
                  title: 'No local sellers yet.',
                  body: 'Seller profiles will appear here as Okahandja products go live.',
                )
              else
                ...localSellers.map(
                  (seller) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: AppColors.purpleSoftAlt,
                            child: Text(
                              seller.name.characters.first.toUpperCase(),
                              style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(seller.name, style: AppTextStyles.h4),
                                const SizedBox(height: 4),
                                Text('${seller.productCount} listings • ${seller.location}', style: AppTextStyles.bodyMuted),
                              ],
                            ),
                          ),
                          if (seller.businessId != null)
                            TextButton(
                              onPressed: () => context.push('/directory/${seller.businessId}'),
                              child: const Text('Open'),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => ListView(
          padding: EdgeInsets.fromLTRB(20, 20, 20, scrollBottomPadding),
          children: const [
            LoadingSkeleton(height: 52),
            SizedBox(height: 16),
            LoadingSkeleton(height: 110),
            SizedBox(height: 16),
            LoadingSkeleton(height: 260),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Store unavailable',
              body: 'No products found in your area. Try another category.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(storeProductsProvider(null)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<ProductModel> _applyFilters(List<ProductModel> items) {
    final query = _searchController.text.trim().toLowerCase();
    final filtered = items.where((item) {
      final sellerName = item.businessName ?? item.userBusinessName ?? item.userName ?? '';
      final matchesQuery = query.isEmpty ||
          item.title.toLowerCase().contains(query) ||
          sellerName.toLowerCase().contains(query) ||
          (item.category?.toLowerCase().contains(query) ?? false);
      final normalizedCategory = item.category?.toLowerCase();
      final matchesCategory = _selectedCategory == 'all' ||
          normalizedCategory == _selectedCategory ||
          (_selectedCategory == 'other' &&
              !const {
                'electronics',
                'home',
                'clothing',
                'food',
                'building',
                'vehicles',
                'services',
              }.contains(normalizedCategory));
      final matchesSale = !_saleOnly || item.salePrice != null;
      final matchesVerified = !_verifiedOnly || item.businessVerified;
      return matchesQuery && matchesCategory && matchesSale && matchesVerified;
    }).toList();

    switch (_sortBy) {
      case 'price_low_high':
        filtered.sort((a, b) => double.parse(a.salePrice ?? a.price).compareTo(double.parse(b.salePrice ?? b.price)));
        break;
      case 'price_high_low':
        filtered.sort((a, b) => double.parse(b.salePrice ?? b.price).compareTo(double.parse(a.salePrice ?? a.price)));
        break;
      default:
        filtered.sort((a, b) => b.id.compareTo(a.id));
    }

    return filtered;
  }

  List<_SellerSummary> _buildSellerCards(List<ProductModel> items) {
    final map = <String, _SellerSummary>{};

    for (final item in items) {
      final name = item.businessName ?? item.userBusinessName ?? item.userName;
      if (name == null || name.isEmpty) {
        continue;
      }

      final key = '${item.businessId ?? item.userId}:$name';
      final current = map[key];
      final location = [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
      map[key] = _SellerSummary(
        name: name,
        location: location.isEmpty ? AppConfig.pilotTown : location,
        productCount: (current?.productCount ?? 0) + 1,
        businessId: item.businessId,
      );
    }

    final sellers = map.values.toList()..sort((a, b) => b.productCount.compareTo(a.productCount));
    return sellers.take(4).toList();
  }

  Future<void> _openPostProductSheet() async {
    final auth = ref.read(authControllerProvider);
    final contactLabel = auth.user?.phone ?? 'Your profile phone will be used';
    var step = 0;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: StatefulBuilder(
          builder: (context, setModalState) => SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                SectionTitle(
                  eyebrow: 'Sell local',
                  title: step == 0 ? 'Add photo' : step == 1 ? 'Product details' : 'Preview',
                  subtitle: step == 0
                      ? 'Start with a product image or skip for now.'
                      : step == 1
                          ? 'Keep the listing short and clear.'
                          : 'Confirm the essentials before publishing.',
                ),
                const SizedBox(height: 16),
                if (step == 0) ...[
                  AppCard(
                    child: Column(
                      children: [
                        if (_image != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(18),
                            child: Image.file(File(_image!.path), height: 180, width: double.infinity, fit: BoxFit.cover),
                          )
                        else
                          Container(
                            height: 160,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: AppColors.neutralSoft,
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: const Center(child: Icon(Icons.photo_library_outlined, size: 42, color: AppColors.mutedText)),
                          ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: () async {
                            final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
                            if (picked == null) {
                              return;
                            }
                            setModalState(() => _image = picked);
                          },
                          icon: const Icon(Icons.add_photo_alternate_outlined),
                          label: Text(_image == null ? 'Add photo' : 'Change photo'),
                        ),
                      ],
                    ),
                  ),
                ] else if (step == 1) ...[
                  LokalsTextField(controller: _titleController, label: 'Title', hint: 'What are you selling?'),
                  const SizedBox(height: 12),
                  LokalsTextField(controller: _priceController, label: 'Price', hint: 'Optional price'),
                  const SizedBox(height: 12),
                  LokalsTextField(controller: _categoryController, label: 'Category', hint: 'Electronics, home, clothing...'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: LokalsTextField(controller: _townController, label: 'Town', hint: 'Town', readOnly: true)),
                      const SizedBox(width: 12),
                      Expanded(child: LokalsTextField(controller: _areaController, label: 'Area', hint: 'Area')),
                    ],
                  ),
                  const SizedBox(height: 12),
                  AppCard(
                    color: AppColors.neutralSoft,
                    child: Row(
                      children: [
                        const Icon(Icons.phone_outlined, color: AppColors.primaryPurple),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text('Buyer contact: $contactLabel', style: AppTextStyles.bodyMuted),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  LokalsTextField(
                    controller: _descriptionController,
                    label: 'Description',
                    hint: 'Short product details',
                    maxLines: 3,
                  ),
                ] else ...[
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_titleController.text.trim().isEmpty ? 'Untitled product' : _titleController.text.trim(), style: AppTextStyles.h3),
                        const SizedBox(height: 8),
                        Text(
                          _priceController.text.trim().isEmpty ? 'Price on request' : _priceController.text.trim(),
                          style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${_categoryController.text.trim().isEmpty ? 'General' : _categoryController.text.trim()} • ${_areaController.text.trim().isEmpty ? _townController.text.trim() : '${_areaController.text.trim()}, ${_townController.text.trim()}'}',
                          style: AppTextStyles.bodyMuted,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _descriptionController.text.trim().isEmpty ? 'Add a short description to help nearby buyers.' : _descriptionController.text.trim(),
                          style: AppTextStyles.bodyMuted,
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                Row(
                  children: [
                    if (step > 0)
                      Expanded(
                        child: AppButton(
                          label: 'Back',
                          variant: AppButtonVariant.secondary,
                          onPressed: () => setModalState(() => step -= 1),
                        ),
                      ),
                    if (step > 0) const SizedBox(width: 12),
                    Expanded(
                      child: AppButton(
                        label: step < 2 ? (step == 0 ? 'Continue' : 'Preview') : (_saving ? 'Publishing...' : 'Publish'),
                        onPressed: () async {
                          if (step == 1 && _titleController.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please add a product title first.')),
                            );
                            return;
                          }

                          if (step < 2) {
                            setModalState(() => step += 1);
                            return;
                          }

                          if (_saving) {
                            return;
                          }

                          setModalState(() => _saving = true);
                          try {
                            final product = await ref.read(discoveryRepositoryProvider).createProduct(
                                  title: _titleController.text.trim(),
                                  description: _descriptionController.text.trim(),
                                  category: _categoryController.text.trim().isEmpty ? 'general' : _categoryController.text.trim(),
                                  town: _townController.text.trim().isEmpty ? AppConfig.pilotTown : _townController.text.trim(),
                                  area: _areaController.text.trim(),
                                  price: _priceController.text.trim().isEmpty ? '0' : _priceController.text.trim(),
                                  image: _image,
                                );
                            if (!context.mounted) {
                              return;
                            }
                            Navigator.pop(context);
                            ref.invalidate(storeProductsProvider(null));
                            _clearPostForm();
                            _showPublishSuccess(product);
                          } finally {
                            if (context.mounted) {
                              setModalState(() => _saving = false);
                            }
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSortSheet() {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Newest'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _sortBy = 'newest');
              },
            ),
            ListTile(
              title: const Text('Price low-high'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _sortBy = 'price_low_high');
              },
            ),
            ListTile(
              title: const Text('Price high-low'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _sortBy = 'price_high_low');
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showPublishSuccess(ProductModel product) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Product published'),
        content: const Text('Your listing is now live in the store.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.go('/store');
            },
            child: const Text('Back to Store'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.push('/store/${product.id}');
            },
            child: const Text('View Product'),
          ),
        ],
      ),
    );
  }

  void _clearPostForm() {
    _titleController.clear();
    _priceController.clear();
    _categoryController.text = 'electronics';
    _townController.text = AppConfig.pilotTown;
    _areaController.text = AppConfig.okahandjaAreas.first;
    _descriptionController.clear();
    _image = null;
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.icon,
    required this.label,
    required this.background,
    required this.iconColor,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color background;
  final Color iconColor;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? AppColors.purpleSoftAlt : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: selected ? AppColors.primaryPurple : AppColors.border),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: background,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, size: 18, color: iconColor),
            ),
            const SizedBox(height: 8),
            Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal)),
          ],
        ),
      ),
    );
  }
}

class _ProductGrid extends StatelessWidget {
  const _ProductGrid({required this.items});

  final List<ProductModel> items;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final singleColumn = constraints.maxWidth < 380;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: items.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: singleColumn ? 1 : 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: singleColumn ? 1.42 : 0.7,
          ),
          itemBuilder: (context, index) => ProductCard(product: items[index]),
        );
      },
    );
  }
}

class _SellerSummary {
  const _SellerSummary({
    required this.name,
    required this.location,
    required this.productCount,
    this.businessId,
  });

  final String name;
  final String location;
  final int productCount;
  final int? businessId;
}
