import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/category_tile.dart';
import '../../../shared/widgets/provider_card.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'services_repository.dart';

class ServicesScreen extends ConsumerStatefulWidget {
  const ServicesScreen({super.key});

  @override
  ConsumerState<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends ConsumerState<ServicesScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'all';
  bool _nearMeOnly = true;
  bool _verifiedOnly = false;
  bool _bookableOnly = false;
  bool _openNowOnly = false;

  static const _categoryRows = [
    ('all', 'Home & Maintenance', 'Cleaning, plumbing, electrical, and repairs'),
    ('all', 'Events & Entertainment', 'Decor, catering, MCs, and event support'),
    ('doctor', 'Health & Beauty', 'Clinics, barbers, wellness, and personal care'),
    ('mechanic', 'Automotive', 'Mechanics, diagnostics, and roadside help'),
    ('tutor', 'Education', 'Tutors, coaching, and practical learning'),
    ('all', 'Public Services', 'Nearby directory-linked local help'),
  ];

  static const Map<String, List<String>> _categoryAliases = {
    'all': [],
    'cleaner': ['cleaner', 'cleaning', 'house cleaner', 'laundry'],
    'plumber': ['plumber', 'plumbing', 'pipe', 'leak'],
    'electrician': ['electrician', 'electrical', 'wiring', 'power'],
    'carpenter': ['carpenter', 'carpentry', 'woodwork', 'furniture'],
    'painting': ['painting', 'painter', 'paint'],
    'garden': ['garden', 'gardener', 'landscaping', 'yard'],
    'repair': ['repair', 'appliance repair', 'maintenance', 'fix'],
    'moving': ['moving', 'mover', 'delivery', 'transport'],
    'doctor': ['doctor', 'clinic', 'health', 'medical'],
    'barber': ['barber', 'haircut', 'beard', 'salon'],
    'mechanic': ['mechanic', 'automotive', 'garage', 'vehicle'],
    'tutor': ['tutor', 'teaching', 'education', 'lesson'],
  };

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  bool _matchesCategory(ProviderModel provider) {
    if (_selectedCategory == 'all') {
      return true;
    }

    final aliases = _categoryAliases[_selectedCategory] ?? [_selectedCategory];
    final haystack = <String>[
      provider.category,
      if (provider.subcategory != null) provider.subcategory!,
      ...provider.services.map((service) => service.name),
      ...provider.services.map((service) => service.description ?? ''),
    ].join(' ').toLowerCase();

    return aliases.any(haystack.contains);
  }

  bool _matchesQuery(ProviderModel provider, String query) {
    if (query.isEmpty) {
      return true;
    }

    final haystack = <String>[
      provider.name,
      provider.category,
      provider.subcategory ?? '',
      provider.description ?? '',
      ...provider.services.map((service) => service.name),
      ...provider.services.map((service) => service.description ?? ''),
    ].join(' ').toLowerCase();

    return haystack.contains(query);
  }

  @override
  Widget build(BuildContext context) {
    final providers = ref.watch(servicesProvider);

    return LokalsShell(
      title: 'Services',
      showBack: true,
      child: providers.when(
        data: (items) {
          final query = _searchController.text.toLowerCase().trim();
          final filtered = items.where((provider) {
            final matchesQuery = _matchesQuery(provider, query);
            final matchesCategory = _matchesCategory(provider);
            final matchesVerified = !_verifiedOnly || provider.isVerified;
            final matchesBookable = !_bookableOnly || provider.services.any((service) => service.isBookable && service.isActive);
            final matchesOpen = !_openNowOnly || provider.openNow;
            return matchesQuery && matchesCategory && matchesVerified && matchesBookable && matchesOpen;
          }).toList()
            ..sort((a, b) {
              if (_nearMeOnly) {
                return (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999);
              }
              return a.name.compareTo(b.name);
            });

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            children: [
              Container(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.deepPurple, AppColors.primaryPurple],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Services', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800)),
                    SizedBox(height: 8),
                    Text(
                      'Find trusted local help for home, business, and everyday life.',
                      style: TextStyle(color: Colors.white70, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              AppSearchBar(
                controller: _searchController,
                hintText: 'Search services in Okahandja...',
                recentKey: 'services',
                suggestions: const ['Barber nearby', 'Electrician available now', 'Affordable plumber', 'Best rated doctor'],
                shortcuts: const ['Cleaning', 'Plumbing', 'Electrical', 'Moving'],
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                children: [
                  const Expanded(
                    child: Text('Popular Services', style: AppTextStyles.h3),
                  ),
                  TextButton(onPressed: () => setState(() => _selectedCategory = 'all'), child: const Text('View all')),
                ],
              ),
              const SizedBox(height: 12),
              GridView.count(
                crossAxisCount: 3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.95,
                children: [
                  CategoryTile(icon: Icons.cleaning_services_outlined, label: 'Cleaning', onTap: () => setState(() => _selectedCategory = 'cleaner'), color: AppColors.infoSoft, iconColor: AppColors.softBlue),
                  CategoryTile(icon: Icons.plumbing_outlined, label: 'Plumbing', onTap: () => setState(() => _selectedCategory = 'plumber'), color: AppColors.successSoft, iconColor: AppColors.primaryGreen),
                  CategoryTile(icon: Icons.electrical_services_outlined, label: 'Electrical', onTap: () => setState(() => _selectedCategory = 'electrician'), color: AppColors.warningSoft, iconColor: AppColors.warning),
                  CategoryTile(icon: Icons.carpenter_outlined, label: 'Carpentry', onTap: () => setState(() => _selectedCategory = 'carpenter'), color: AppColors.goldSoft, iconColor: const Color(0xFFD97706)),
                  CategoryTile(icon: Icons.format_paint_outlined, label: 'Painting', onTap: () => setState(() => _selectedCategory = 'painting'), color: AppColors.purpleSoftAlt, iconColor: AppColors.primaryPurple),
                  CategoryTile(icon: Icons.yard_outlined, label: 'Garden', onTap: () => setState(() => _selectedCategory = 'garden'), color: const Color(0xFFE8F8E8), iconColor: AppColors.primaryGreen),
                  CategoryTile(icon: Icons.kitchen_outlined, label: 'Repair', onTap: () => setState(() => _selectedCategory = 'repair'), color: AppColors.infoSoft, iconColor: AppColors.softBlue),
                  CategoryTile(icon: Icons.local_shipping_outlined, label: 'Moving', onTap: () => setState(() => _selectedCategory = 'moving'), color: AppColors.warningSoft, iconColor: const Color(0xFFD97706)),
                  CategoryTile(icon: Icons.more_horiz_rounded, label: 'More', onTap: () => setState(() => _selectedCategory = 'all'), color: AppColors.neutralSoft, iconColor: AppColors.deepCharcoal),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              const Text('All Categories', style: AppTextStyles.h3),
              const SizedBox(height: 12),
              ..._categoryRows.map(
                (row) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsSurfaceTile(
                    onTap: () => setState(() => _selectedCategory = row.$1),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.purpleSoft,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.apps_rounded, color: AppColors.primaryPurple),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(row.$2, style: const TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              Text(row.$3, style: const TextStyle(color: AppColors.mutedText)),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, color: AppColors.mutedText),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              AppCard(
                padding: const EdgeInsets.all(14),
                child: Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ChoiceChip(
                      label: const Text('Near me'),
                      selected: _nearMeOnly,
                      onSelected: (_) => setState(() => _nearMeOnly = !_nearMeOnly),
                    ),
                    ChoiceChip(
                      label: const Text('Open now'),
                      selected: _openNowOnly,
                      onSelected: (_) => setState(() => _openNowOnly = !_openNowOnly),
                    ),
                    ChoiceChip(
                      label: const Text('Verified'),
                      selected: _verifiedOnly,
                      onSelected: (_) => setState(() => _verifiedOnly = !_verifiedOnly),
                    ),
                    ChoiceChip(
                      label: const Text('Bookable'),
                      selected: _bookableOnly,
                      onSelected: (_) => setState(() => _bookableOnly = !_bookableOnly),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                children: [
                  const Expanded(child: Text('Top Providers Near You', style: AppTextStyles.h3)),
                  TextButton(
                    onPressed: () => setState(() {
                      _selectedCategory = 'all';
                      _verifiedOnly = false;
                      _bookableOnly = false;
                      _openNowOnly = false;
                    }),
                    child: const Text('View all'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (filtered.isEmpty)
                EmptyStateView(
                  title: 'No services found nearby.',
                  body: 'Try another area or remove one filter to widen your search.',
                  action: AppButton(
                    label: 'Reset filters',
                    expanded: false,
                    variant: AppButtonVariant.secondary,
                    onPressed: () => setState(() {
                      _selectedCategory = 'all';
                      _nearMeOnly = true;
                      _verifiedOnly = false;
                      _bookableOnly = false;
                      _openNowOnly = false;
                      _searchController.clear();
                    }),
                  ),
                )
              else
                ...filtered.take(5).map((provider) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: ProviderCard(provider: provider),
                    )),
            ],
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          children: const [
            LoadingSkeleton(height: 160),
            SizedBox(height: 16),
            LoadingSkeleton(height: 110),
            SizedBox(height: 12),
            LoadingSkeleton(height: 110),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'We could not load services right now',
              body: 'Try again in a moment or switch to another area.',
              action: AppButton(
                label: 'Retry',
                onPressed: () => ref.invalidate(servicesProvider),
                expanded: false,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
