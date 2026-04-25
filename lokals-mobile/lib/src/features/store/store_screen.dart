import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';

import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class StoreScreen extends ConsumerStatefulWidget {
  const StoreScreen({super.key});

  @override
  ConsumerState<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends ConsumerState<StoreScreen> {
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _categoryController = TextEditingController(text: 'general');
  final _townController = TextEditingController(text: 'Windhoek');
  final _areaController = TextEditingController(text: 'Katutura');
  final _descriptionController = TextEditingController();
  XFile? _image;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(storeProductsProvider);

    return LokalsShell(
      title: 'Store',
      showBack: true,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          showModalBottomSheet<void>(
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
                      const Text('Sell product', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 16),
                      LokalsTextField(controller: _titleController, label: 'Title'),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: _priceController, label: 'Price'),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: _categoryController, label: 'Category'),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: _areaController, label: 'Area'),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: _descriptionController, label: 'Description', maxLines: 3),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () async {
                          final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
                          if (picked == null) return;
                          setModalState(() => _image = picked);
                        },
                        icon: const Icon(Icons.photo_library_outlined),
                        label: Text(_image == null ? 'Add photo' : 'Photo selected'),
                      ),
                      const SizedBox(height: 16),
                      PrimaryAction(
                        label: AppConfig.isDemoMode ? 'Simulate product post' : 'Sell product',
                        isBusy: _saving,
                        onPressed: () async {
                          if (AppConfig.isDemoMode) {
                            if (!context.mounted) return;
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Demo Mode: product post simulated.')),
                            );
                            return;
                          }
                          setModalState(() => _saving = true);
                          await ref.read(discoveryRepositoryProvider).createProduct(
                                title: _titleController.text.trim(),
                                description: _descriptionController.text.trim(),
                                category: _categoryController.text.trim(),
                                town: _townController.text.trim(),
                                area: _areaController.text.trim(),
                                price: _priceController.text.trim(),
                                image: _image,
                              );
                          if (!context.mounted) return;
                          setModalState(() => _saving = false);
                          Navigator.pop(context);
                          ref.invalidate(storeProductsProvider);
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
        label: const Text('Post'),
        icon: const Icon(Icons.add),
      ),
      child: products.when(
        data: (items) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const SectionTitle(
              title: 'Local products and sale picks',
              subtitle: 'Browse local sellers, then contact directly.',
            ),
            const SizedBox(height: 16),
            if (items.isEmpty)
              const EmptyStateView(
                title: 'No products found nearby',
                body: 'Try changing category or location.',
              )
            else
              ...items.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsCard(
                    variant: AppCardVariant.marketplace,
                    child: InkWell(
                      onTap: () => context.push('/store/${item.id}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 8),
                          Text(item.businessName ?? item.userName ?? 'Local seller'),
                          const SizedBox(height: 8),
                          Text(getDisplayPrice(item.salePrice ?? item.price), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 8),
                          Text(item.area ?? item.town ?? 'Windhoek', style: const TextStyle(color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Store unavailable: $error')),
      ),
    );
  }
}
