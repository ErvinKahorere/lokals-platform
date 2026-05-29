import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../config/app_config.dart';
import '../../../shared/widgets/experience/smart_suggestion_card.dart';
import '../../../shared/widgets/listing_card.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../store/order_cart_controller.dart';

class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen> {
  final _searchController = TextEditingController();
  String _selectedType = 'all';
  int _postStep = 1;

  static const _typeChips = [
    ('all', 'All'),
    ('product', 'Products'),
    ('service', 'Services'),
    ('delivery', 'Delivery'),
  ];

  @override
  Widget build(BuildContext context) {
    final listings = ref.watch(marketplaceProvider);
    final cart = ref.watch(orderCartProvider);

    return LokalsShell(
      title: 'Marketplace',
      floatingActionButton: cart.totalItems > 0
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/orders/checkout'),
              backgroundColor: const Color(0xFF16A34A),
              foregroundColor: Colors.white,
              label: Text('Cart (${cart.totalItems})'),
              icon: const Icon(Icons.shopping_bag_outlined),
            )
          : FloatingActionButton.extended(
              onPressed: () => _openPostSheet(context),
              backgroundColor: const Color(0xFF16A34A),
              foregroundColor: Colors.white,
              label: const Text('Post'),
              icon: const Icon(Icons.add_a_photo_outlined),
            ),
      child: listings.when(
        data: (items) {
          final filtered = items.where((listing) {
            final query = _searchController.text.toLowerCase();
            final matchesType = _selectedType == 'all' || listing.type == _selectedType;
            final matchesQuery = query.isEmpty || listing.title.toLowerCase().contains(query) || listing.description.toLowerCase().contains(query);
            return matchesType && matchesQuery;
          }).toList();
          final featured = filtered.where((listing) => listing.status == 'published').take(4).toList();
          final recent = [...filtered]..sort((a, b) => b.id.compareTo(a.id));
          final sellerCounts = <String, int>{};
          for (final listing in filtered) {
            final name = listing.businessName ?? listing.userName;
            if (name == null || name.isEmpty) continue;
            sellerCounts[name] = (sellerCounts[name] ?? 0) + 1;
          }
          final topSeller = sellerCounts.entries.isEmpty
              ? null
              : (sellerCounts.entries.toList()..sort((a, b) => b.value.compareTo(a.value))).first;

          return filtered.isEmpty
              ? EmptyStateView(
                  title: 'No local listings found',
                  body: 'Try another search, switch category, or post what your area needs.',
                  action: AppButton(
                    label: 'Clear filters',
                    expanded: false,
                    variant: AppButtonVariant.secondary,
                    onPressed: () => setState(() {
                      _searchController.clear();
                      _selectedType = 'all';
                    }),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    AppCard(
                      variant: AppCardVariant.marketplace,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Local Marketplace', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 8),
                          Text(
                            'Browse nearby listings, trusted local sellers, and quick discoveries around ${AppConfig.pilotTown}.',
                            style: AppTextStyles.bodyMuted,
                          ),
                          const SizedBox(height: 14),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: const [
                              _MarketplaceFact(icon: Icons.place_outlined, label: 'Okahandja context'),
                              _MarketplaceFact(icon: Icons.verified_outlined, label: 'Trust cues first'),
                              _MarketplaceFact(icon: Icons.shield_outlined, label: 'Safe local buying'),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    AppSearchBar(
                      controller: _searchController,
                      hintText: 'Search products, services, and local deals...',
                      recentKey: 'market',
                      suggestions: const ['Affordable phones', 'Popular listings', 'Laptops nearby', 'Furniture for sale'],
                      shortcuts: const ['Verified sellers', 'Affordable', 'Available now'],
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 16),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _typeChips
                            .map(
                              (chip) => Padding(
                                padding: const EdgeInsets.only(right: 10),
                                child: ChoiceChip(
                                  label: Text(chip.$2),
                                  selected: _selectedType == chip.$1,
                                  onSelected: (_) => setState(() => _selectedType = chip.$1),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const SmartSuggestionCard(
                      title: 'Buy local with confidence',
                      body: 'Photos, price, seller details, and safe local meeting guidance stay easy to scan.',
                      icon: Icons.storefront_outlined,
                      route: '/marketplace',
                      badge: 'Marketplace',
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 128,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _DiscoveryPrompt(
                            title: 'Featured nearby',
                            body: featured.isEmpty
                                ? 'Fresh local picks will appear here.'
                                : '${featured.length} featured local picks ready to browse.',
                            icon: Icons.near_me_outlined,
                          ),
                          const _DiscoveryPrompt(
                            title: 'Safe local buying',
                            body: 'Meet in public places and confirm items before handing over cash.',
                            icon: Icons.shield_outlined,
                          ),
                          _DiscoveryPrompt(
                            title: 'Active sellers',
                            body: topSeller == null
                                ? 'Seller highlights will appear here.'
                                : '${topSeller.value} listings from ${topSeller.key}.',
                            icon: Icons.store_mall_directory_outlined,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SectionTitle(
                      title: 'Featured listings',
                      subtitle: 'Fresh local discoveries with clear price and status.',
                      action: TextButton(
                        onPressed: () => setState(() => _selectedType = 'all'),
                        child: const Text('View all'),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...featured.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: ListingCard(listing: item),
                      ),
                    ),
                    if (featured.isEmpty)
                      const EmptyStateView(
                        title: 'No featured listings yet',
                        body: 'New local listings will appear here first.',
                      ),
                    const SizedBox(height: 12),
                    SectionTitle(
                      title: 'Recent listings',
                      subtitle: 'Latest marketplace activity around your town.',
                      action: TextButton(
                        onPressed: () => _openPostSheet(context),
                        child: const Text('Post listing'),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...recent.take(8).map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: ListingCard(listing: item),
                      ),
                    ),
                  ],
                );
        },
        loading: () => const Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            children: [
              LoadingSkeleton(height: 180),
              SizedBox(height: 16),
              LoadingSkeleton(height: 52),
              SizedBox(height: 16),
              LoadingSkeleton(height: 200),
            ],
          ),
        ),
        error: (error, _) => EmptyStateView(
          title: 'Marketplace could not refresh.',
          body: 'Your saved navigation still works. Retry when the connection settles.',
          action: AppButton(
            label: 'Retry',
            expanded: false,
            onPressed: () => ref.invalidate(marketplaceProvider),
          ),
        ),
      ),
    );
  }

  Future<void> _openPostSheet(BuildContext context) async {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    final locationController = TextEditingController();
    final priceController = TextEditingController();
    String selectedType = 'product';
    XFile? image;
    var isAnalyzing = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Post in a few taps', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text('Step $_postStep of 4', style: const TextStyle(color: Color(0xFF64748B))),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: ['product', 'service', 'delivery'].map((type) {
                      return ChoiceChip(
                        label: Text(type == 'product' ? 'Sell item' : type == 'service' ? 'Offer service' : 'Offer delivery'),
                        selected: selectedType == type,
                        onSelected: (_) {
                          setModalState(() => selectedType = type);
                          setState(() => _postStep = 2);
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  InkWell(
                    borderRadius: BorderRadius.circular(24),
                    onTap: () async {
                      final file = await _pickImageSource(context);
                      if (file == null) {
                        return;
                      }
                      setModalState(() => image = file);
                      setState(() => _postStep = 3);
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        color: const Color(0xFFF8FAFC),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.add_a_photo_outlined, size: 32, color: Color(0xFF16A34A)),
                          const SizedBox(height: 8),
                          Text(image == null ? 'Take or upload image' : image!.name),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppButton(
                    label: isAnalyzing ? 'Analyzing...' : 'Analyze with AI',
                    expanded: false,
                    variant: AppButtonVariant.secondary,
                    onPressed: isAnalyzing
                        ? null
                        : () async {
                            setModalState(() => isAnalyzing = true);
                            try {
                              final response = await ref.read(discoveryRepositoryProvider).requestAiAssist(
                                    module: 'marketplace',
                                    title: titleController.text.trim(),
                                    description: descriptionController.text.trim(),
                                    location: locationController.text.trim(),
                                    media: image,
                                  );
                              final suggestions = ((response['suggestions'] as List?) ?? const []);
                              final suggestion = suggestions.isEmpty
                                  ? const <String, dynamic>{}
                                  : Map<String, dynamic>.from((suggestions.first as Map)['content'] as Map? ?? const {});

                              if (titleController.text.trim().isEmpty && (suggestion['title']?.toString() ?? '').isNotEmpty) {
                                titleController.text = suggestion['title'].toString();
                              }
                              if (descriptionController.text.trim().isEmpty && (suggestion['description']?.toString() ?? '').isNotEmpty) {
                                descriptionController.text = suggestion['description'].toString();
                              }
                              if (locationController.text.trim().isEmpty && (suggestion['location_hint']?.toString() ?? '').isNotEmpty) {
                                locationController.text = suggestion['location_hint'].toString();
                              }
                              if (priceController.text.trim().isEmpty && suggestion['price_estimate'] != null) {
                                priceController.text = suggestion['price_estimate'].toString();
                              }
                              if ((suggestion['category']?.toString() ?? '').isNotEmpty) {
                                selectedType = suggestion['category'].toString() == 'delivery' ? 'delivery' : selectedType;
                              }
                              if (mounted) {
                                ScaffoldMessenger.of(this.context).showSnackBar(
                                  const SnackBar(content: Text('AI suggestions added. Review before publishing.')),
                                );
                              }
                            } finally {
                              setModalState(() => isAnalyzing = false);
                            }
                          },
                  ),
                  const SizedBox(height: 16),
                  LokalsTextField(controller: titleController, label: 'Title', hint: 'What are you selling?'),
                  const SizedBox(height: 12),
                  LokalsTextField(controller: locationController, label: 'Location', hint: 'Town or suburb'),
                  const SizedBox(height: 12),
                  LokalsTextField(controller: priceController, label: 'Price', hint: 'Optional'),
                  const SizedBox(height: 12),
                  LokalsTextField(controller: descriptionController, label: 'Description', hint: 'Short description', maxLines: 3),
                  const SizedBox(height: 16),
                  AppCard(
                    variant: AppCardVariant.marketplace,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Confirm before publish', style: TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        Text(titleController.text.isEmpty ? 'Add a title' : titleController.text),
                        Text(selectedType),
                        Text(priceController.text.isEmpty ? 'Price on request' : 'N\$ ${priceController.text}'),
                        Text(locationController.text.isEmpty ? 'Add location' : locationController.text),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                    AppButton(
                      label: AppConfig.isDemoMode ? 'Simulate publish' : 'Confirm publish',
                      onPressed: () async {
                        if (AppConfig.isDemoMode) {
                          if (!mounted) {
                            return;
                          }
                          Navigator.of(this.context).pop();
                          ScaffoldMessenger.of(this.context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Demo Mode: listing publish simulated.',
                              ),
                            ),
                          );
                          return;
                        }
                        await ref.read(discoveryRepositoryProvider).createListing(
                          type: selectedType,
                          title: titleController.text,
                        description: descriptionController.text,
                        location: locationController.text,
                        price: priceController.text,
                        image: image,
                        );
                        ref.invalidate(marketplaceProvider);
                        if (!mounted) {
                          return;
                        }
                        Navigator.of(this.context).pop();
                        ScaffoldMessenger.of(this.context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Listing published to the marketplace feed.',
                            ),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<XFile?> _pickImageSource(BuildContext context) async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Take photo'),
              onTap: () => Navigator.of(context).pop(ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Choose from gallery'),
              onTap: () => Navigator.of(context).pop(ImageSource.gallery),
            ),
          ],
        ),
      ),
    );

    if (source == null) {
      return null;
    }

    return ImagePicker().pickImage(source: source, imageQuality: 82);
  }
}

class _DiscoveryPrompt extends StatelessWidget {
  const _DiscoveryPrompt({
    required this.title,
    required this.body,
    required this.icon,
  });

  final String title;
  final String body;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 214,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x140F172A),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF16A34A)),
          const SizedBox(height: 10),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _MarketplaceFact extends StatelessWidget {
  const _MarketplaceFact({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.primaryGreen),
          const SizedBox(width: 8),
          Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal)),
        ],
      ),
    );
  }
}
