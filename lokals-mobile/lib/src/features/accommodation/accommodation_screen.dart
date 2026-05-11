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
import 'accommodation_card.dart';

class AccommodationScreen extends ConsumerStatefulWidget {
  const AccommodationScreen({super.key});

  @override
  ConsumerState<AccommodationScreen> createState() => _AccommodationScreenState();
}

class _AccommodationScreenState extends ConsumerState<AccommodationScreen> {
  final _searchController = TextEditingController();
  String _tab = 'rental';
  String _town = AppConfig.pilotTown;
  String _area = 'all';
  String _minPrice = '';
  String _maxPrice = '';
  String _bedrooms = 'any';
  String _bathrooms = 'any';
  String _pricePeriod = 'any';
  bool _verifiedOnly = false;
  bool _recentOnly = true;

  static const _tabItems = [
    ('rental', 'Rentals', Icons.home_work_outlined, Color(0xFFE8F1FF), AppColors.softBlue),
    ('property_sale', 'Property Sales', Icons.house_siding_outlined, Color(0xFFECFDF3), AppColors.primaryGreen),
    ('short_stay', 'B&B / Short Stay', Icons.hotel_outlined, Color(0xFFF3E8FF), AppColors.primaryPurple),
    ('guest_room', 'Rooms', Icons.bed_outlined, Color(0xFFFFF7CC), AppColors.warning),
    ('guesthouse', 'Guesthouses', Icons.villa_outlined, Color(0xFFFFF1F2), AppColors.danger),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final accommodationsQuery = ref.watch(accommodationsProvider);

    return LokalsShell(
      title: 'Accommodation',
      showBack: true,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openPostAccommodationSheet,
        icon: const Icon(Icons.add_home_work_outlined),
        label: const Text('Post'),
      ),
      child: accommodationsQuery.when(
        data: (items) {
          final filteredItems = _applyFilters(items);
          final featured = items.where((item) => item.pricePeriod == 'night' || item.ownerVerified || item.businessVerified).take(3).toList();
          final rentals = items.where((item) => item.type == 'rental').take(4).toList();
          final bnbNearby = items.where((item) => item.type == 'bnb' || item.type == 'short_stay' || item.type == 'guesthouse').take(4).toList();
          final propertySales = items.where((item) => item.type == 'property_sale').take(4).toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Accommodation', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800)),
                        SizedBox(height: 6),
                        Text('Rentals, property sales, B&Bs, guesthouses, and rooms around Okahandja.', style: AppTextStyles.bodyMuted),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _openFiltersSheet,
                    icon: const Icon(Icons.tune_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              AppSearchBar(
                controller: _searchController,
                hintText: 'Search stays in Okahandja...',
                recentKey: 'accommodation',
                suggestions: const ['Room in Nau-Aib', 'B&B near Gross Barmen Road', 'Guesthouse in Okahandja Park', 'House for sale in Osona'],
                shortcuts: const ['Rentals', 'B&B', 'Property sale', 'Rooms'],
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.purpleSoftAlt,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  auth.user?.defaultArea == null || auth.user!.defaultArea!.isEmpty
                      ? AppConfig.pilotTown
                      : '${auth.user!.defaultArea}, ${AppConfig.pilotTown}',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.primaryPurple,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                height: 112,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (context, index) {
                    final item = _tabItems[index];
                    final selected = _tab == item.$1;
                    return SizedBox(
                      width: 110,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: selected ? AppColors.primaryPurple : Colors.transparent,
                            width: 1.5,
                          ),
                          boxShadow: selected
                              ? [
                                  BoxShadow(
                                    color: AppColors.primaryPurple.withValues(alpha: 0.12),
                                    blurRadius: 18,
                                    offset: const Offset(0, 10),
                                  ),
                                ]
                              : null,
                        ),
                        child: LokalsActionTile(
                          icon: item.$3,
                          label: item.$2,
                          color: item.$4,
                          iconColor: item.$5,
                          onTap: () => setState(() => _tab = item.$1),
                        ),
                      ),
                    );
                  },
                  separatorBuilder: (context, index) => const SizedBox(width: 10),
                  itemCount: _tabItems.length,
                ),
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  ChoiceChip(
                    label: Text(_town),
                    selected: true,
                    onSelected: (_) => _pickValue('Select town', [AppConfig.pilotTown], _town, (value) => setState(() => _town = value)),
                  ),
                  ChoiceChip(
                    label: Text(_area == 'all' ? 'All areas' : _area),
                    selected: _area != 'all',
                    onSelected: (_) => _pickValue('Select area', ['all', ...AppConfig.okahandjaAreas], _area, (value) => setState(() => _area = value)),
                  ),
                  ChoiceChip(
                    label: Text(_verifiedOnly ? 'Verified owner' : 'Any owner'),
                    selected: _verifiedOnly,
                    onSelected: (_) => setState(() => _verifiedOnly = !_verifiedOnly),
                  ),
                  ChoiceChip(
                    label: const Text('Recently added'),
                    selected: _recentOnly,
                    onSelected: (_) => setState(() => _recentOnly = !_recentOnly),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SectionTitle(
                title: 'Featured stays',
                subtitle: 'Verified stays and standout local places.',
                action: TextButton(onPressed: () => context.push('/accommodation'), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              if (featured.isEmpty)
                const EmptyStateView(
                  title: 'No featured stays yet.',
                  body: 'Fresh verified listings will appear here soon.',
                )
              else
                SizedBox(
                  height: 320,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (context, index) => SizedBox(width: 250, child: AccommodationCard(item: featured[index])),
                    separatorBuilder: (context, index) => const SizedBox(width: 12),
                    itemCount: featured.length,
                  ),
                ),
              const SizedBox(height: 20),
              SectionTitle(
                title: 'Rentals near you',
                subtitle: 'Monthly places close to local transport and shops.',
                action: TextButton(onPressed: () => setState(() => _tab = 'rental'), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              ...rentals.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AccommodationCard(item: item, compact: true),
                  )),
              const SizedBox(height: 8),
              SectionTitle(
                title: 'B&Bs nearby',
                subtitle: 'Short stays, guesthouses, and trusted host spaces.',
                action: TextButton(onPressed: () => setState(() => _tab = 'short_stay'), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              ...bnbNearby.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AccommodationCard(item: item, compact: true),
                  )),
              const SizedBox(height: 8),
              SectionTitle(
                title: 'Property for sale',
                subtitle: 'Homes and property listings with direct contact.',
                action: TextButton(onPressed: () => setState(() => _tab = 'property_sale'), child: const Text('View all')),
              ),
              const SizedBox(height: 12),
              ...propertySales.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AccommodationCard(item: item, compact: true),
                  )),
              const SizedBox(height: 8),
              SectionTitle(
                title: 'Browse listings',
                subtitle: 'Image-first accommodation cards with quick owner access.',
                action: Text('${filteredItems.length} listings', style: AppTextStyles.caption),
              ),
              const SizedBox(height: 12),
              if (filteredItems.isEmpty)
                const EmptyStateView(
                  title: 'No accommodation found in your area.',
                  body: 'Try another filter.',
                )
              else
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredItems.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.68,
                  ),
                  itemBuilder: (context, index) => AccommodationCard(item: filteredItems[index]),
                ),
            ],
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            LoadingSkeleton(height: 52),
            SizedBox(height: 16),
            LoadingSkeleton(height: 110),
            SizedBox(height: 16),
            LoadingSkeleton(height: 320),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Accommodation unavailable',
              body: 'No accommodation found in your area. Try another filter.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(accommodationsProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<AccommodationItemModel> _applyFilters(List<AccommodationItemModel> items) {
    final query = _searchController.text.trim().toLowerCase();
    final filtered = items.where((item) {
      final matchesQuery = query.isEmpty ||
          item.title.toLowerCase().contains(query) ||
          (item.description?.toLowerCase().contains(query) ?? false) ||
          (item.area?.toLowerCase().contains(query) ?? false) ||
          (item.town?.toLowerCase().contains(query) ?? false);
      final matchesTab = _tab == 'short_stay'
          ? item.type == 'bnb' || item.type == 'short_stay' || item.type == 'guesthouse'
          : item.type == _tab;
      final matchesTown = _town == 'all' || item.town == _town;
      final matchesArea = _area == 'all' || item.area == _area;
      final matchesBedrooms = _bedrooms == 'any' || (item.bedrooms ?? 0) >= int.parse(_bedrooms);
      final matchesBathrooms = _bathrooms == 'any' || (item.bathrooms ?? 0) >= int.parse(_bathrooms);
      final matchesPricePeriod = _pricePeriod == 'any' || item.pricePeriod == _pricePeriod;
      final matchesMinPrice = _minPrice.isEmpty || double.tryParse(item.price)?.compareTo(double.tryParse(_minPrice) ?? 0) != -1;
      final matchesMaxPrice = _maxPrice.isEmpty || double.tryParse(item.price)?.compareTo(double.tryParse(_maxPrice) ?? double.infinity) != 1;
      final matchesVerified = !_verifiedOnly || item.ownerVerified || item.businessVerified;
      return matchesQuery && matchesTab && matchesTown && matchesArea && matchesBedrooms && matchesBathrooms && matchesPricePeriod && matchesMinPrice && matchesMaxPrice && matchesVerified;
    }).toList();

    if (_recentOnly) {
      filtered.sort((a, b) => (b.createdAt ?? '').compareTo(a.createdAt ?? ''));
    }

    return filtered;
  }

  Future<void> _pickValue(String title, List<String> items, String current, ValueChanged<String> onSelected) async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 8),
              child: Row(
                children: [
                  Expanded(child: Text(title, style: AppTextStyles.h3)),
                  IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close_rounded)),
                ],
              ),
            ),
            ...items.map(
              (item) => ListTile(
                title: Text(item == 'all' ? 'All areas' : item),
                trailing: item == current ? const Icon(Icons.check_rounded, color: AppColors.primaryPurple) : null,
                onTap: () => Navigator.of(context).pop(item),
              ),
            ),
          ],
        ),
      ),
    );

    if (selected != null) {
      onSelected(selected);
    }
  }

  Future<void> _openFiltersSheet() async {
    final minPriceController = TextEditingController(text: _minPrice);
    final maxPriceController = TextEditingController(text: _maxPrice);
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 18,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: StatefulBuilder(
            builder: (context, setModalState) => Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(child: Text('Filters', style: AppTextStyles.h3)),
                    IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close_rounded)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: LokalsTextField(
                        controller: minPriceController,
                        label: 'Min price',
                        hint: '0',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: LokalsTextField(
                        controller: maxPriceController,
                        label: 'Max price',
                        hint: '15000',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: _bedrooms,
                        items: const [
                          DropdownMenuItem(value: 'any', child: Text('Any bedrooms')),
                          DropdownMenuItem(value: '1', child: Text('1+ bedrooms')),
                          DropdownMenuItem(value: '2', child: Text('2+ bedrooms')),
                          DropdownMenuItem(value: '3', child: Text('3+ bedrooms')),
                        ],
                        onChanged: (value) => setModalState(() => _bedrooms = value ?? 'any'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: _bathrooms,
                        items: const [
                          DropdownMenuItem(value: 'any', child: Text('Any bathrooms')),
                          DropdownMenuItem(value: '1', child: Text('1+ bathrooms')),
                          DropdownMenuItem(value: '2', child: Text('2+ bathrooms')),
                        ],
                        onChanged: (value) => setModalState(() => _bathrooms = value ?? 'any'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _pricePeriod,
                  items: const [
                    DropdownMenuItem(value: 'any', child: Text('Any price period')),
                    DropdownMenuItem(value: 'night', child: Text('Per night')),
                    DropdownMenuItem(value: 'month', child: Text('Per month')),
                    DropdownMenuItem(value: 'once', child: Text('Once-off')),
                  ],
                  onChanged: (value) => setModalState(() => _pricePeriod = value ?? 'any'),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Apply',
                        onPressed: () {
                          _minPrice = minPriceController.text.trim();
                          _maxPrice = maxPriceController.text.trim();
                          setState(() {});
                          Navigator.of(context).pop();
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

  Future<void> _openPostAccommodationSheet() async {
    final auth = ref.read(authControllerProvider);
    final titleController = TextEditingController();
    final priceController = TextEditingController();
    final townController = TextEditingController(text: _town);
    final areaController = TextEditingController(text: _area == 'all' ? AppConfig.okahandjaAreas.first : _area);
    final phoneController = TextEditingController(text: auth.user?.phone ?? '');
    final whatsappController = TextEditingController(text: auth.user?.whatsapp ?? auth.user?.phone ?? '');
    final bedroomsController = TextEditingController();
    final bathroomsController = TextEditingController();
    final amenitiesController = TextEditingController();
    final descriptionController = TextEditingController();
    final rulesController = TextEditingController();
    var step = 0;
    var type = _tab == 'short_stay' ? 'bnb' : _tab;
    var pricePeriod = type == 'property_sale' ? 'once' : type == 'rental' ? 'month' : 'night';
    XFile? image;
    var saving = false;
    AccommodationItemModel? successItem;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 18,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: StatefulBuilder(
            builder: (context, setModalState) => SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Expanded(child: Text('Post accommodation', style: AppTextStyles.h3)),
                      IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close_rounded)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text('Photo first, short details, price and location, then publish.', style: AppTextStyles.bodyMuted),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    children: [
                      _StepChip(label: '1. Photo', active: step == 0),
                      _StepChip(label: '2. Basics', active: step == 1),
                      _StepChip(label: '3. Price / location', active: step == 2),
                      _StepChip(label: '4. Preview', active: step == 3),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (successItem != null) ...[
                    const Text('Accommodation published', style: AppTextStyles.h4),
                    const SizedBox(height: 8),
                    const Text('Your listing is now live in the accommodation feed.', style: AppTextStyles.bodyMuted),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: AppButton(
                            label: 'View Listing',
                            onPressed: () {
                              Navigator.of(context).pop();
                              if (successItem!.id > 0) {
                                context.push('/accommodation/${successItem!.id}');
                              } else {
                                context.push('/accommodation');
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: AppButton(
                            label: 'Back to Accommodation',
                            variant: AppButtonVariant.secondary,
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    if (step == 0) ...[
                      OutlinedButton.icon(
                        onPressed: () async {
                          final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
                          if (picked == null) return;
                          setModalState(() => image = picked);
                        },
                        icon: const Icon(Icons.photo_library_outlined),
                        label: Text(image == null ? 'Add photo or skip' : 'Photo selected'),
                      ),
                      if (image != null) ...[
                        const SizedBox(height: 12),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.file(File(image!.path), height: 160, width: double.infinity, fit: BoxFit.cover),
                        ),
                      ],
                    ],
                    if (step == 1) ...[
                      LokalsTextField(controller: titleController, label: 'Title', hint: 'Guesthouse suite in Eros'),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        initialValue: type,
                        items: const [
                          DropdownMenuItem(value: 'rental', child: Text('Rental')),
                          DropdownMenuItem(value: 'property_sale', child: Text('Property sale')),
                          DropdownMenuItem(value: 'bnb', child: Text('B&B')),
                          DropdownMenuItem(value: 'short_stay', child: Text('Short stay')),
                          DropdownMenuItem(value: 'guest_room', child: Text('Room')),
                          DropdownMenuItem(value: 'guesthouse', child: Text('Guesthouse')),
                        ],
                        onChanged: (value) {
                          if (value == null) return;
                          setModalState(() {
                            type = value;
                            pricePeriod = value == 'property_sale' ? 'once' : value == 'rental' ? 'month' : 'night';
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: LokalsTextField(controller: bedroomsController, label: 'Bedrooms')),
                          const SizedBox(width: 12),
                          Expanded(child: LokalsTextField(controller: bathroomsController, label: 'Bathrooms')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: amenitiesController, label: 'Amenities', hint: 'Wi-Fi, Parking, Breakfast'),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: descriptionController, label: 'Description', maxLines: 3),
                    ],
                    if (step == 2) ...[
                      Row(
                        children: [
                          Expanded(child: LokalsTextField(controller: priceController, label: 'Price')),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              initialValue: pricePeriod,
                              items: const [
                                DropdownMenuItem(value: 'night', child: Text('Per night')),
                                DropdownMenuItem(value: 'month', child: Text('Per month')),
                                DropdownMenuItem(value: 'once', child: Text('Once-off')),
                              ],
                              onChanged: (value) => setModalState(() => pricePeriod = value ?? 'month'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: LokalsTextField(controller: townController, label: 'Town')),
                          const SizedBox(width: 12),
                          Expanded(child: LokalsTextField(controller: areaController, label: 'Area')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: LokalsTextField(controller: phoneController, label: 'Contact phone')),
                          const SizedBox(width: 12),
                          Expanded(child: LokalsTextField(controller: whatsappController, label: 'WhatsApp')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: rulesController, label: 'Rules', hint: 'No smoking, Quiet after 22:00'),
                    ],
                    if (step == 3) ...[
                      AppCard(
                        color: AppColors.neutralSoft,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(titleController.text.trim().isEmpty ? 'Untitled listing' : titleController.text.trim(), style: AppTextStyles.h4),
                            const SizedBox(height: 8),
                            Text(priceController.text.trim().isEmpty ? 'Price on request' : 'N\$ ${priceController.text.trim()}', style: AppTextStyles.h3.copyWith(color: AppColors.primaryPurple)),
                            const SizedBox(height: 8),
                            Text('${areaController.text.trim()}, ${townController.text.trim()} - $pricePeriod', style: AppTextStyles.bodyMuted),
                            const SizedBox(height: 10),
                            Text(
                              descriptionController.text.trim().isEmpty
                                  ? 'Add a short property summary before you publish.'
                                  : descriptionController.text.trim(),
                              style: AppTextStyles.bodyMuted,
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
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
                        if (step > 0) const SizedBox(width: 10),
                        Expanded(
                          child: AppButton(
                            label: step < 3 ? 'Continue' : saving ? 'Publishing...' : 'Publish',
                            isLoading: saving,
                            onPressed: () async {
                              if (step < 3) {
                                setModalState(() => step += 1);
                                return;
                              }

                              setModalState(() => saving = true);

                              if (AppConfig.isDemoMode) {
                                setModalState(() {
                                  successItem = AccommodationItemModel(
                                    id: -1,
                                    type: type,
                                    title: titleController.text.trim(),
                                    price: priceController.text.trim().isEmpty ? '0' : priceController.text.trim(),
                                    description: descriptionController.text.trim(),
                                    pricePeriod: pricePeriod,
                                    town: townController.text.trim(),
                                    area: areaController.text.trim(),
                                  );
                                  saving = false;
                                });
                                return;
                              }

                              await ref.read(discoveryRepositoryProvider).createAccommodation(
                                    type: type,
                                    title: titleController.text.trim(),
                                    description: descriptionController.text.trim(),
                                    town: townController.text.trim(),
                                    area: areaController.text.trim(),
                                    price: priceController.text.trim(),
                                    bedrooms: bedroomsController.text.trim(),
                                    bathrooms: bathroomsController.text.trim(),
                                    phone: phoneController.text.trim(),
                                    whatsapp: whatsappController.text.trim(),
                                    pricePeriod: pricePeriod,
                                    amenities: amenitiesController.text.trim().isEmpty
                                        ? const []
                                        : amenitiesController.text.split(',').map((item) => item.trim()).where((item) => item.isNotEmpty).toList(),
                                    rules: rulesController.text.trim().isEmpty
                                        ? const []
                                        : rulesController.text.split(',').map((item) => item.trim()).where((item) => item.isNotEmpty).toList(),
                                    image: image,
                                  );

                              ref.invalidate(accommodationsProvider);
                              if (!mounted) return;
                              setModalState(() {
                                successItem = AccommodationItemModel(
                                  id: -1,
                                  type: type,
                                  title: titleController.text.trim(),
                                  price: priceController.text.trim(),
                                  description: descriptionController.text.trim(),
                                  pricePeriod: pricePeriod,
                                  town: townController.text.trim(),
                                  area: areaController.text.trim(),
                                );
                                saving = false;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _StepChip extends StatelessWidget {
  const _StepChip({
    required this.label,
    required this.active,
  });

  final String label;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: active ? AppColors.purpleSoftAlt : AppColors.neutralSoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: active ? AppColors.primaryPurple : AppColors.mutedText,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
