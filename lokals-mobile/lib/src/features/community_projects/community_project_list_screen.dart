import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'community_project_card.dart';

class CommunityProjectListScreen extends ConsumerStatefulWidget {
  const CommunityProjectListScreen({super.key});

  @override
  ConsumerState<CommunityProjectListScreen> createState() => _CommunityProjectListScreenState();
}

class _CommunityProjectListScreenState extends ConsumerState<CommunityProjectListScreen> {
  CommunityProjectCategoryModel? _selectedCategory;
  bool _featuredOnly = false;
  bool _needsVolunteers = false;
  bool _needsDonations = false;

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(communityProjectCategoriesProvider);
    final params = <String, dynamic>{
      if (_selectedCategory != null) 'category_id': _selectedCategory!.id,
      if (_featuredOnly) 'featured': true,
      if (_needsVolunteers) 'needs_volunteers': true,
      if (_needsDonations) 'needs_donations': true,
    };
    final projectsAsync = ref.watch(communityProjectsProvider(params));

    return LokalsShell(
      title: 'Community Projects',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
        children: [
          SectionTitle(
            eyebrow: 'Get involved',
            title: 'Browse approved initiatives',
            subtitle: 'Support verified local projects through donations, volunteer time, services, and sponsorships.',
            action: AppButton(
              label: 'Submit',
              compact: true,
              expanded: false,
              variant: AppButtonVariant.accent,
              onPressed: () => context.push('/get-involved/submit'),
            ),
          ),
          const SizedBox(height: 14),
          LokalsCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Filters', style: AppTextStyles.h3),
                const SizedBox(height: 12),
                categoriesAsync.when(
                  data: (categories) => Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilterChip(
                        label: const Text('All'),
                        selected: _selectedCategory == null,
                        onSelected: (_) => setState(() => _selectedCategory = null),
                      ),
                      ...categories.map(
                        (category) => FilterChip(
                          label: Text(category.name),
                          selected: _selectedCategory?.id == category.id,
                          onSelected: (_) => setState(() => _selectedCategory = category),
                        ),
                      ),
                    ],
                  ),
                  loading: () => const LoadingSkeleton(height: 56),
                  error: (_, _) => const Text('Categories unavailable right now.'),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilterChip(
                      label: const Text('Featured'),
                      selected: _featuredOnly,
                      onSelected: (value) => setState(() => _featuredOnly = value),
                    ),
                    FilterChip(
                      label: const Text('Needs volunteers'),
                      selected: _needsVolunteers,
                      onSelected: (value) => setState(() => _needsVolunteers = value),
                    ),
                    FilterChip(
                      label: const Text('Needs donations'),
                      selected: _needsDonations,
                      onSelected: (value) => setState(() => _needsDonations = value),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          projectsAsync.when(
            data: (projects) {
              if (projects.isEmpty) {
                return const EmptyStateView(
                  title: 'No initiatives match these filters',
                  body: 'Try another support type or open all approved projects in Okahandja.',
                );
              }

              return Column(
                children: [
                  for (final project in projects) ...[
                    CommunityProjectCard(
                      project: project,
                      onTap: () => context.push('/get-involved/${project.slug}'),
                    ),
                    const SizedBox(height: 14),
                  ],
                ],
              );
            },
            loading: () => const LoadingSkeleton(height: 340),
            error: (_, _) => AppCard(
              child: AppButton(
                label: 'Retry loading projects',
                expanded: false,
                compact: true,
                onPressed: () => ref.invalidate(communityProjectsProvider(params)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
