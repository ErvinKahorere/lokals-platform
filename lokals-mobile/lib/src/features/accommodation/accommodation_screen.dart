import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class AccommodationScreen extends ConsumerStatefulWidget {
  const AccommodationScreen({super.key});

  @override
  ConsumerState<AccommodationScreen> createState() => _AccommodationScreenState();
}

class _AccommodationScreenState extends ConsumerState<AccommodationScreen> {
  String _type = 'rental';
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _townController = TextEditingController(text: 'Windhoek');
  final _areaController = TextEditingController(text: 'Klein Windhoek');
  final _bedroomsController = TextEditingController(text: '1');
  final _bathroomsController = TextEditingController(text: '1');
  XFile? _image;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    final accommodations = ref.watch(accommodationsProvider);

    return LokalsShell(
      title: 'Accommodation',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Rentals, property, and short stay',
            subtitle: 'Search by area, compare rates, and contact owners fast.',
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              ChoiceChip(label: const Text('Rentals'), selected: _type == 'rental', onSelected: (_) => setState(() => _type = 'rental')),
              ChoiceChip(label: const Text('Property sales'), selected: _type == 'property_sale', onSelected: (_) => setState(() => _type = 'property_sale')),
              ChoiceChip(label: const Text('B&B / Short stay'), selected: _type == 'bnb', onSelected: (_) => setState(() => _type = 'bnb')),
            ],
          ),
          const SizedBox(height: 16),
          accommodations.when(
            data: (items) {
              final filtered = items
                  .where((item) => _type == 'bnb'
                      ? item.type == 'bnb' || item.type == 'short_stay'
                      : item.type == _type)
                  .toList();

              if (filtered.isEmpty) {
                return const EmptyStateView(
                  title: 'No accommodation found nearby',
                  body: 'Try changing area or price range.',
                );
              }

              return Column(
                children: filtered
                    .map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: LokalsCard(
                          variant: AppCardVariant.marketplace,
                          child: InkWell(
                            onTap: () => context.push('/accommodation/${item.id}'),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 8),
                                Text(getDisplayPrice(item.price), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 6),
                                Text('per ${item.pricePeriod ?? 'month'}'),
                                const SizedBox(height: 8),
                                Text('${item.bedrooms ?? 0} bed • ${item.bathrooms ?? 0} bath • ${item.area ?? item.town ?? item.location ?? 'Windhoek'}'),
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => Text('Accommodation unavailable: $error'),
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Quick post', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                LokalsTextField(controller: _titleController, label: 'Title'),
                const SizedBox(height: 12),
                LokalsTextField(controller: _priceController, label: 'Price'),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: LokalsTextField(controller: _bedroomsController, label: 'Bedrooms')),
                    const SizedBox(width: 12),
                    Expanded(child: LokalsTextField(controller: _bathroomsController, label: 'Bathrooms')),
                  ],
                ),
                const SizedBox(height: 12),
                LokalsTextField(controller: _areaController, label: 'Area'),
                const SizedBox(height: 12),
                LokalsTextField(controller: _descriptionController, label: 'Description', maxLines: 3),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () async {
                    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
                    if (picked == null) return;
                    setState(() => _image = picked);
                  },
                  icon: const Icon(Icons.photo_library_outlined),
                  label: Text(_image == null ? 'Add photo' : 'Photo selected'),
                ),
                const SizedBox(height: 16),
                PrimaryAction(
                  label: AppConfig.isDemoMode ? 'Simulate accommodation post' : 'Add accommodation',
                  isBusy: _saving,
                  onPressed: () async {
                    if (AppConfig.isDemoMode) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Demo Mode: accommodation post simulated.')),
                      );
                      return;
                    }
                    setState(() => _saving = true);
                    await ref.read(discoveryRepositoryProvider).createAccommodation(
                          type: _type,
                          title: _titleController.text.trim(),
                          description: _descriptionController.text.trim(),
                          town: _townController.text.trim(),
                          area: _areaController.text.trim(),
                          price: _priceController.text.trim(),
                          bedrooms: _bedroomsController.text.trim(),
                          bathrooms: _bathroomsController.text.trim(),
                          image: _image,
                        );
                    if (!mounted) return;
                    setState(() => _saving = false);
                    ref.invalidate(accommodationsProvider);
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
