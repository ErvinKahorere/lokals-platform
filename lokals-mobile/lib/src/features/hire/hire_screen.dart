import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'hire_shared.dart';

class HireScreen extends ConsumerStatefulWidget {
  const HireScreen({super.key});

  @override
  ConsumerState<HireScreen> createState() => _HireScreenState();
}

class _HireScreenState extends ConsumerState<HireScreen> {
  final _searchController = TextEditingController();
  String _activeCategory = 'all';
  bool _deliveryOnly = false;

  static const _categories = [
    'all',
    'events',
    'tools',
    'equipment',
    'household',
    'cameras',
    'trailers',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final query = ref.watch(
      hireItemsProvider(
        HireItemsRequest(
          search: _searchController.text,
          category: _activeCategory,
          deliveryOnly: _deliveryOnly,
        ),
      ),
    );
    final user = ref.watch(authControllerProvider).user;

    return LokalsShell(
      title: 'Hire',
      showBack: true,
      bodyBottomInset: 10,
      child: query.when(
        data: (items) {
          final featured = items.take(3).toList();
          final availableCount = items.where((item) => item.isAvailable).length;
          final deliveryCount = items
              .where((item) => item.deliveryAvailable)
              .length;

          return ListView(
            padding: EdgeInsets.fromLTRB(
              20,
              20,
              20,
              MediaQuery.viewPaddingOf(context).bottom + 104,
            ),
            children: [
              SectionTitle(
                eyebrow: 'Hire',
                title: 'Rent local gear and essentials',
                subtitle:
                    'Browse event chairs, generators, trailers, tools, and practical rentals without mixing them into shop orders or parcel delivery.',
                action: AppButton(
                  label: 'My bookings',
                  expanded: false,
                  onPressed: () => context.push('/hire/bookings'),
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Find what you only need sometimes',
                      style: AppTextStyles.h3.copyWith(fontSize: 24),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'LOKALS Hire keeps event equipment, tools, and temporary-use items in a dedicated flow with owner approval and clear handover steps.',
                      style: AppTextStyles.bodyMuted,
                    ),
                    const SizedBox(height: 16),
                    AppSearchBar(
                      controller: _searchController,
                      hintText: 'Search chairs, tents, trailers, tools...',
                      recentKey: 'hire-search',
                      suggestions: const [
                        'Generator',
                        'Chairs',
                        'Tent',
                        'Sound system',
                      ],
                      shortcuts: const ['Events', 'Tools', 'Equipment'],
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 14),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _categories
                            .map(
                              (category) => Padding(
                                padding: const EdgeInsets.only(right: 10),
                                child: ChoiceChip(
                                  label: Text(
                                    category == 'all'
                                        ? 'All'
                                        : getStatusLabel(category),
                                  ),
                                  selected: _activeCategory == category,
                                  onSelected: (_) {
                                    setState(() => _activeCategory = category);
                                  },
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        ChoiceChip(
                          label: const Text('Delivery available'),
                          selected: _deliveryOnly,
                          onSelected: (_) {
                            setState(() => _deliveryOnly = !_deliveryOnly);
                          },
                        ),
                        if (user != null)
                          ActionChip(
                            label: const Text('Owner queue'),
                            onPressed: () =>
                                context.push('/hire/owner/bookings'),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: _StatTile(
                      label: 'Live items',
                      value: '${items.length}',
                      color: AppColors.primaryPurple,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatTile(
                      label: 'Available now',
                      value: '$availableCount',
                      color: AppColors.primaryGreen,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatTile(
                      label: 'With delivery',
                      value: '$deliveryCount',
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
              if (featured.isNotEmpty) ...[
                const SizedBox(height: 22),
                const SectionTitle(
                  title: 'Featured rentals',
                  subtitle:
                      'Popular Okahandja hire items owners are actively offering right now.',
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 328,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: featured.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(width: 12),
                    itemBuilder: (context, index) => SizedBox(
                      width: 284,
                      child: HireItemCard(
                        item: featured[index],
                        onTap: () =>
                            context.push('/hire/${featured[index].id}'),
                      ),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 22),
              const SectionTitle(
                title: 'All hire items',
                subtitle:
                    'Browse local rentals with pricing, deposit visibility, and pickup or delivery badges.',
              ),
              const SizedBox(height: 12),
              if (items.isEmpty)
                EmptyStateView(
                  title: 'No hire items yet',
                  body:
                      'Once local owners list tools, gear, and event items, they will show up here.',
                  action: user == null
                      ? null
                      : AppButton(
                          label: 'View my bookings',
                          expanded: false,
                          onPressed: () => context.push('/hire/bookings'),
                        ),
                )
              else
                ...items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: HireItemCard(
                      item: item,
                      onTap: () => context.push('/hire/${item.id}'),
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            LoadingSkeleton(height: 180),
            SizedBox(height: 16),
            LoadingSkeleton(height: 94),
            SizedBox(height: 16),
            LoadingSkeleton(height: 280),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Hire unavailable',
              body:
                  'We could not load local rentals right now. Please try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(hireItemsProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.h2.copyWith(fontSize: 24, color: color),
          ),
        ],
      ),
    );
  }
}
