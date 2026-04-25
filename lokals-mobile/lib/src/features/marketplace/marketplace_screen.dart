import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../config/app_config.dart';
import '../../../shared/widgets/app_search_bar.dart';
import '../../../shared/widgets/experience/smart_suggestion_card.dart';
import '../../../shared/widgets/listing_card.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen> {
  final _searchController = TextEditingController();
  int _postStep = 1;

  @override
  Widget build(BuildContext context) {
    final listings = ref.watch(marketplaceProvider);

    return LokalsShell(
      title: 'Shop',
      floatingActionButton: FloatingActionButton.extended(
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
            return query.isEmpty || listing.title.toLowerCase().contains(query) || listing.description.toLowerCase().contains(query);
          }).toList();

          return filtered.isEmpty
              ? const EmptyStateView(
                  title: 'No items found nearby',
                  body: 'Try changing category or location.',
                )
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    const SectionTitle(
                      title: 'Shop local with confidence',
                      subtitle: 'Featured listings, recent items, and clear prices.',
                    ),
                    const SizedBox(height: 16),
                    AppSearchBar(
                      controller: _searchController,
                      hintText: 'Find a barber, job, product...',
                      recentKey: 'market',
                      suggestions: const ['Affordable phones', 'Popular listings', 'Laptops nearby', 'Furniture for sale'],
                      shortcuts: const ['Popular near you', 'Affordable', 'Available now'],
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 16),
                    const SmartSuggestionCard(
                      title: 'Shop nearby with confidence',
                      body: 'Price, save, and contact actions should always feel one tap away.',
                      icon: Icons.storefront_outlined,
                      route: '/marketplace',
                      badge: 'Marketplace',
                    ),
                    const SizedBox(height: 12),
                    ...filtered.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: ListingCard(listing: item),
                      ),
                    ),
                  ],
                );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Something went wrong. Try again. $error')),
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
