import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/provider_card.dart';
import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
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

  static const List<_ServiceCategory> _categories = [
    _ServiceCategory(
      key: 'health',
      label: 'Health',
      detail: 'Clinics, pharmacies, and care support',
      icon: Icons.local_hospital_outlined,
      aliases: ['doctor', 'clinic', 'health', 'medical', 'pharmacy', 'wellness'],
    ),
    _ServiceCategory(
      key: 'transport',
      label: 'Transport',
      detail: 'Taxi, moving help, and deliveries',
      icon: Icons.local_taxi_outlined,
      aliases: ['transport', 'taxi', 'ride', 'moving', 'delivery', 'courier'],
    ),
    _ServiceCategory(
      key: 'repairs',
      label: 'Repairs',
      detail: 'Electrical, plumbing, and fixes',
      icon: Icons.handyman_outlined,
      aliases: ['plumber', 'electrician', 'mechanic', 'repair', 'maintenance', 'carpenter', 'painting'],
    ),
    _ServiceCategory(
      key: 'beauty',
      label: 'Beauty',
      detail: 'Barbers, salons, and personal care',
      icon: Icons.content_cut_rounded,
      aliases: ['barber', 'beauty', 'hair', 'salon', 'spa'],
    ),
    _ServiceCategory(
      key: 'food',
      label: 'Food',
      detail: 'Catering, kitchens, and takeaways',
      icon: Icons.restaurant_outlined,
      aliases: ['food', 'restaurant', 'catering', 'kitchen', 'bakery'],
    ),
    _ServiceCategory(
      key: 'government',
      label: 'Government',
      detail: 'Council offices and civic support',
      icon: Icons.account_balance_outlined,
      aliases: ['government', 'council', 'municipal', 'public service', 'office'],
    ),
    _ServiceCategory(
      key: 'emergency',
      label: 'Emergency',
      detail: 'Police, urgent help, and safety',
      icon: Icons.sos_outlined,
      aliases: ['emergency', 'police', 'fire', 'ambulance', 'safety'],
    ),
    _ServiceCategory(
      key: 'professional',
      label: 'Professional',
      detail: 'Legal, accounting, and expert help',
      icon: Icons.badge_outlined,
      aliases: ['professional', 'legal', 'accounting', 'consulting', 'tutor', 'education'],
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  bool _matchesCategoryText(String haystack) {
    if (_selectedCategory == 'all') {
      return true;
    }

    final category = _categories.firstWhere(
      (item) => item.key == _selectedCategory,
      orElse: () => _categories.first,
    );
    return category.aliases.any(haystack.contains);
  }

  bool _matchesProvider(ProviderModel provider, String query) {
    final haystack = <String>[
      provider.name,
      provider.category,
      provider.subcategory ?? '',
      provider.description ?? '',
      provider.area ?? '',
      provider.town ?? '',
      provider.location,
      ...provider.services.map((service) => service.name),
      ...provider.services.map((service) => service.description ?? ''),
    ].join(' ').toLowerCase();

    final matchesQuery = query.isEmpty || haystack.contains(query);
    final matchesCategory = _matchesCategoryText(haystack);
    final matchesVerified = !_verifiedOnly || provider.isVerified;
    final matchesBookable = !_bookableOnly || provider.services.any((service) => service.isActive && service.isBookable);
    final matchesOpen = !_openNowOnly || provider.openNow;

    return matchesQuery && matchesCategory && matchesVerified && matchesBookable && matchesOpen;
  }

  bool _matchesDirectory(OrganizationModel item, String query) {
    final haystack = <String>[
      item.name,
      item.category,
      item.subcategory ?? '',
      item.description ?? '',
      item.area ?? '',
      item.town ?? '',
      item.location ?? '',
      ...item.servicesOffered,
    ].join(' ').toLowerCase();

    final matchesQuery = query.isEmpty || haystack.contains(query);
    final matchesCategory = _matchesCategoryText(haystack);
    final matchesVerified = !_verifiedOnly || item.isVerified;
    final matchesOpen = !_openNowOnly || item.openNow;

    return matchesQuery && matchesCategory && matchesVerified && matchesOpen;
  }

  void _resetFilters() {
    setState(() {
      _selectedCategory = 'all';
      _nearMeOnly = true;
      _verifiedOnly = false;
      _bookableOnly = false;
      _openNowOnly = false;
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;
    final scrollBottomPadding = safeBottom + 88;
    final providersAsync = ref.watch(servicesProvider);
    final directoryAsync = ref.watch(directoryProvider);
    final preferences = ref.watch(preferencesProvider).asData?.value;
    final auth = ref.watch(authControllerProvider);

    final town = auth.user?.defaultTown ?? preferences?.defaultTown ?? AppConfig.pilotTown;
    final area = auth.user?.defaultArea ?? preferences?.defaultArea;
    final locationLabel = [
      if (area != null && area.isNotEmpty) area,
      town,
    ].join(', ');

    return LokalsShell(
      title: 'Services',
      showBack: true,
      bodyBottomInset: 10,
      child: providersAsync.when(
        data: (providers) {
          final directoryItems = directoryAsync.asData?.value ?? const <OrganizationModel>[];
          final query = _searchController.text.toLowerCase().trim();

          final filteredProviders = providers.where((provider) => _matchesProvider(provider, query)).toList()
            ..sort((a, b) {
              if (_nearMeOnly) {
                return (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999);
              }
              return a.name.compareTo(b.name);
            });

          final featuredProviders = filteredProviders
              .where((provider) => provider.isVerified || (provider.rating ?? 0) >= 4.5)
              .take(3)
              .toList();

          final nearbyProviders = filteredProviders
              .where((provider) => !featuredProviders.any((featured) => featured.id == provider.id))
              .toList();

          final publicServices = directoryItems
              .where((item) => item.isPublicService)
              .where((item) => _matchesDirectory(item, query))
              .take(6)
              .toList()
            ..sort((a, b) => (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999));

          final activeFilters = <String>[
            if (_selectedCategory != 'all')
              _categories.firstWhere((item) => item.key == _selectedCategory).label,
            if (_verifiedOnly) 'Verified',
            if (_bookableOnly) 'Bookable',
            if (_openNowOnly) 'Open now',
            if (_nearMeOnly) 'Nearby first',
          ];

          return ListView(
            padding: EdgeInsets.fromLTRB(20, 12, 20, scrollBottomPadding),
            children: [
              _HeroCard(locationLabel: locationLabel, town: town),
              const SizedBox(height: AppSpacing.lg),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Search and filter', style: AppTextStyles.eyebrow),
                    const SizedBox(height: 10),
                    const Text('Find local services fast', style: AppTextStyles.h3),
                    const SizedBox(height: 8),
                    Text(
                      'Search businesses, professionals, public offices, and useful contacts around $locationLabel.',
                      style: AppTextStyles.bodyMuted,
                    ),
                    const SizedBox(height: 16),
                    LokalsSearchBar(
                      controller: _searchController,
                      hintText: 'Search services, people, and places...',
                      recentKey: 'services',
                      suggestions: const [
                        'Clinic near me',
                        'Verified electrician',
                        'Taxi in Okahandja',
                        'Emergency contact',
                      ],
                      shortcuts: const ['Verified', 'Open now', 'Nearby', 'Public service'],
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 40,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _FilterChip(
                            label: 'Verified',
                            selected: _verifiedOnly,
                            onTap: () => setState(() => _verifiedOnly = !_verifiedOnly),
                          ),
                          _FilterChip(
                            label: 'Bookable',
                            selected: _bookableOnly,
                            onTap: () => setState(() => _bookableOnly = !_bookableOnly),
                          ),
                          _FilterChip(
                            label: 'Open now',
                            selected: _openNowOnly,
                            onTap: () => setState(() => _openNowOnly = !_openNowOnly),
                          ),
                          _FilterChip(
                            label: 'Nearby first',
                            selected: _nearMeOnly,
                            onTap: () => setState(() => _nearMeOnly = !_nearMeOnly),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceWhite,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        activeFilters.isEmpty ? 'All services' : activeFilters.join(' | '),
                        style: AppTextStyles.bodyMuted,
                      ),
                    ),
                    const SizedBox(height: 14),
                    AppButton(
                      label: 'Reset filters',
                      expanded: false,
                      variant: AppButtonVariant.secondary,
                      onPressed: _resetFilters,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SectionTitle(
                eyebrow: 'Quick categories',
                title: 'Start with the service type you need',
                subtitle: 'Clear, practical categories to keep local discovery fast.',
                action: TextButton(
                  onPressed: () => setState(() => _selectedCategory = 'all'),
                  child: const Text('Clear'),
                ),
              ),
              const SizedBox(height: 14),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _categories.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.12,
                ),
                itemBuilder: (context, index) {
                  final item = _categories[index];
                  final selected = item.key == _selectedCategory;
                  return _CategoryCard(
                    category: item,
                    selected: selected,
                    onTap: () => setState(() => _selectedCategory = item.key),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.lg),
              const SectionTitle(
                eyebrow: 'Featured',
                title: 'Verified and trusted local picks',
                subtitle: 'Reliable providers surfaced first for faster, more confident decisions.',
              ),
              const SizedBox(height: 14),
              if (featuredProviders.isEmpty)
                EmptyStateView(
                  title: 'No featured services yet',
                  body: 'Try another search or clear one filter to widen the local pool.',
                  action: AppButton(
                    label: 'Show all services',
                    expanded: false,
                    variant: AppButtonVariant.secondary,
                    onPressed: _resetFilters,
                  ),
                )
              else
                ...featuredProviders.map(
                  (provider) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: ProviderCard(provider: provider),
                  ),
                ),
              const SizedBox(height: AppSpacing.lg),
              const SectionTitle(
                eyebrow: 'Nearby',
                title: 'Services around you',
                subtitle: 'Quick local options with visible trust cues, distance, and direct actions.',
              ),
              const SizedBox(height: 14),
              if (filteredProviders.isEmpty)
                EmptyStateView(
                  title: 'No services match this search',
                  body: 'Try another category or remove one filter to widen your local search.',
                  action: AppButton(
                    label: 'Reset filters',
                    expanded: false,
                    variant: AppButtonVariant.secondary,
                    onPressed: _resetFilters,
                  ),
                )
              else if (nearbyProviders.isEmpty)
                const EmptyStateView(
                  title: 'Only featured matches right now',
                  body: 'Your current filters are very focused. The best matching verified options are shown above.',
                )
              else
                ...nearbyProviders.map(
                  (provider) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: ProviderCard(provider: provider),
                  ),
                ),
              const SizedBox(height: AppSpacing.lg),
              SectionTitle(
                eyebrow: 'Public services',
                title: 'Municipal and useful public contacts',
                subtitle: directoryAsync.isLoading
                    ? 'Loading local public contacts...'
                    : 'Important offices, emergency contacts, and public support points if available.',
              ),
              const SizedBox(height: 14),
              if (directoryAsync.isLoading)
                ...List.generate(
                  3,
                  (index) => const Padding(
                    padding: EdgeInsets.only(bottom: 14),
                    child: _PublicServiceSkeleton(),
                  ),
                )
              else if (directoryAsync.hasError)
                EmptyStateView(
                  title: 'Public services unavailable',
                  body: 'We could not load municipal and public contacts right now.',
                  action: AppButton(
                    label: 'Retry',
                    expanded: false,
                    onPressed: () => ref.invalidate(directoryProvider),
                  ),
                )
              else if (publicServices.isEmpty)
                const EmptyStateView(
                  title: 'No public services found',
                  body: 'Public and municipal contacts will appear here when they match your search and filters.',
                )
              else
                ...publicServices.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: _PublicServiceCard(item: item),
                  ),
                ),
            ],
          );
        },
        loading: () => ListView(
          padding: EdgeInsets.fromLTRB(20, 12, 20, scrollBottomPadding),
          children: const [
            _HeroSkeleton(),
            SizedBox(height: 18),
            LoadingSkeleton(height: 280, radius: 28),
            SizedBox(height: 18),
            _CategorySkeletonGrid(),
            SizedBox(height: 18),
            _ServiceSkeletonCard(),
            SizedBox(height: 14),
            _ServiceSkeletonCard(),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'We could not load services right now',
              body: 'Try again in a moment to bring back nearby providers and useful public contacts.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(servicesProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({
    required this.locationLabel,
    required this.town,
  });

  final String locationLabel;
  final String town;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF16A34A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Find Local Services'.toUpperCase(),
            style: AppTextStyles.caption.copyWith(
              color: Colors.white.withValues(alpha: 0.76),
              fontWeight: FontWeight.w700,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Trusted local help across $locationLabel',
            style: AppTextStyles.h1.copyWith(
              color: Colors.white,
              fontSize: 28,
              height: 1.12,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Browse verified providers, public services, and useful contacts around $town with cleaner trust cues and faster actions.',
            style: AppTextStyles.body.copyWith(
              color: Colors.white.withValues(alpha: 0.82),
              height: 1.45,
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              _HeroPill(label: 'Verified providers'),
              _HeroPill(label: 'Public services'),
              _HeroPill(label: 'Quick contact actions'),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: selected ? AppColors.successSoft : Colors.white,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected ? AppColors.primaryGreen.withValues(alpha: 0.24) : AppColors.border,
            ),
          ),
          child: Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: selected ? AppColors.primaryGreen : AppColors.mutedText,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({
    required this.category,
    required this.selected,
    required this.onTap,
  });

  final _ServiceCategory category;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.successSoft : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: selected ? AppColors.primaryGreen.withValues(alpha: 0.22) : AppColors.border,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 18,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: selected ? AppColors.primaryGreen.withValues(alpha: 0.12) : AppColors.purpleSoft,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                category.icon,
                color: selected ? AppColors.primaryGreen : AppColors.primaryPurple,
              ),
            ),
            const Spacer(),
            Text(category.label, style: AppTextStyles.h3.copyWith(fontSize: 16)),
            const SizedBox(height: 6),
            Text(
              category.detail,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodyMuted.copyWith(height: 1.35),
            ),
          ],
        ),
      ),
    );
  }
}

class _PublicServiceCard extends StatelessWidget {
  const _PublicServiceCard({required this.item});

  final OrganizationModel item;

  @override
  Widget build(BuildContext context) {
    final locationLabel = [
      item.area,
      item.town,
      item.location,
    ].whereType<String>().where((value) => value.isNotEmpty).join(', ');
    final distanceLabel = getDisplayDistance(item.distanceKm, item.location);
    final statusLabel = item.openNow ? 'Open now' : item.availabilityStatus ?? 'Check hours';
    final ratingLabel = item.rating != null
        ? '${item.rating!.toStringAsFixed(1)} | ${item.reviewCount ?? 0} reviews'
        : 'Public service contact';

    return AppCard(
      variant: AppCardVariant.dashboard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.purpleSoft,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Icon(
                  item.emergencyContact ? Icons.shield_outlined : Icons.account_balance_outlined,
                  color: AppColors.primaryPurple,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (item.isVerified)
                          const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
                        AppBadge(
                          label: item.isPublicService ? 'Public service' : 'Directory',
                          tone: AppBadgeTone.info,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(item.name, style: AppTextStyles.h3),
                    const SizedBox(height: 4),
                    Text(item.subcategory ?? item.category, style: AppTextStyles.bodyMuted),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _InfoPill(icon: Icons.place_outlined, label: locationLabel.isEmpty ? distanceLabel : locationLabel),
              _InfoPill(
                icon: item.openNow ? Icons.schedule_rounded : Icons.access_time_outlined,
                label: statusLabel,
              ),
              _InfoPill(icon: Icons.star_outline_rounded, label: ratingLabel),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            item.description ?? 'Useful local contact with direct actions and public-facing service details.',
            style: AppTextStyles.bodyMuted,
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.6,
            children: [
              AppButton(
                label: 'View details',
                expanded: true,
                onPressed: () => context.push('/directory/${item.id}'),
              ),
              AppButton(
                label: 'Call',
                icon: Icons.call_outlined,
                expanded: true,
                variant: AppButtonVariant.secondary,
                onPressed: item.phone == null || item.phone!.isEmpty
                    ? null
                    : () => const ContactActionService().call(context, item.phone!),
              ),
              AppButton(
                label: 'WhatsApp',
                icon: Icons.forum_outlined,
                expanded: true,
                variant: AppButtonVariant.secondary,
                onPressed: (item.whatsapp ?? item.phone) == null || (item.whatsapp ?? item.phone)!.isEmpty
                    ? null
                    : () => const ContactActionService().openWhatsApp(
                          context,
                          phone: item.whatsapp ?? item.phone ?? '',
                          name: item.name,
                          message: 'Hello ${item.name}, I found your contact on LOKALS and would like more information.',
                        ),
              ),
              AppButton(
                label: 'Directions',
                icon: Icons.near_me_outlined,
                expanded: true,
                variant: AppButtonVariant.secondary,
                onPressed: (item.location ?? locationLabel).trim().isEmpty
                    ? null
                    : () => const ContactActionService().openMaps(
                          context,
                          query: item.location ?? locationLabel,
                        ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  const _InfoPill({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primaryPurple),
          const SizedBox(width: 6),
          Flexible(child: Text(label, style: AppTextStyles.caption)),
        ],
      ),
    );
  }
}

class _HeroSkeleton extends StatelessWidget {
  const _HeroSkeleton();

  @override
  Widget build(BuildContext context) {
    return const LoadingSkeleton(height: 180, radius: 30);
  }
}

class _CategorySkeletonGrid extends StatelessWidget {
  const _CategorySkeletonGrid();

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.12,
      children: List.generate(
        4,
        (index) => const LoadingSkeleton(height: 140, radius: 24),
      ),
    );
  }
}

class _ServiceSkeletonCard extends StatelessWidget {
  const _ServiceSkeletonCard();

  @override
  Widget build(BuildContext context) {
    return const LoadingSkeleton(height: 260, radius: 28);
  }
}

class _PublicServiceSkeleton extends StatelessWidget {
  const _PublicServiceSkeleton();

  @override
  Widget build(BuildContext context) {
    return const LoadingSkeleton(height: 230, radius: 28);
  }
}

class _ServiceCategory {
  const _ServiceCategory({
    required this.key,
    required this.label,
    required this.detail,
    required this.icon,
    required this.aliases,
  });

  final String key;
  final String label;
  final String detail;
  final IconData icon;
  final List<String> aliases;
}
