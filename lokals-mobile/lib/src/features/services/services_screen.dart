import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_search_bar.dart';
import '../../../shared/widgets/category_tile.dart';
import '../../../shared/widgets/provider_card.dart';
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

  @override
  Widget build(BuildContext context) {
    final providers = ref.watch(servicesProvider);

    return LokalsShell(
      title: 'Services',
      showBack: true,
      child: providers.when(
        data: (items) {
          final filtered = items.where((provider) {
            final query = _searchController.text.toLowerCase();
            return query.isEmpty ||
                provider.name.toLowerCase().contains(query) ||
                provider.category.toLowerCase().contains(query);
          }).toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const SectionTitle(
                title: 'Book trusted local services',
                subtitle: 'Search, compare prices, and book nearby providers.',
              ),
              const SizedBox(height: 16),
              AppSearchBar(
                controller: _searchController,
                hintText: 'Find a barber, job, product...',
                recentKey: 'services',
                suggestions: const ['Barber nearby', 'Electrician available now', 'Affordable plumber', 'Best rated doctor'],
                shortcuts: const ['Popular near you', 'Available now', 'Best rated'],
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 112,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    CategoryTile(icon: Icons.content_cut_outlined, label: 'Beauty', onTap: () => setState(() => _searchController.text = 'beauty')),
                    const SizedBox(width: 12),
                    CategoryTile(icon: Icons.medical_services_outlined, label: 'Health', onTap: () => setState(() => _searchController.text = 'doctor'), color: AppColors.skySoft, iconColor: AppColors.info),
                    const SizedBox(width: 12),
                    CategoryTile(icon: Icons.plumbing_outlined, label: 'Plumbing', onTap: () => setState(() => _searchController.text = 'plumber')),
                    const SizedBox(width: 12),
                    CategoryTile(icon: Icons.electrical_services_outlined, label: 'Electrical', onTap: () => setState(() => _searchController.text = 'electrician'), color: AppColors.goldSoft, iconColor: AppColors.warning),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              if (filtered.isEmpty)
                const EmptyStateView(
                  title: 'No electricians found nearby',
                  body: 'Try expanding your search.',
                ),
              ...filtered.map((provider) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: ProviderCard(provider: provider),
              )),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) =>
            Center(child: Text('Something went wrong. Try again. $error')),
      ),
    );
  }
}
