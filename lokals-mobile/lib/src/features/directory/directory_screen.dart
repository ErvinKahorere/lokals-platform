import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/experience_helpers.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class DirectoryScreen extends ConsumerStatefulWidget {
  const DirectoryScreen({super.key});

  @override
  ConsumerState<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends ConsumerState<DirectoryScreen> {
  final _searchController = TextEditingController();
  bool _verifiedOnly = false;
  bool _publicOnly = false;

  @override
  Widget build(BuildContext context) {
    final directory = ref.watch(directoryProvider);

    return LokalsShell(
      title: 'Directory',
      showBack: true,
      child: directory.when(
        data: (items) {
          final filtered = items.where((item) {
            final query = _searchController.text.toLowerCase();
            final matchesQuery = query.isEmpty ||
                item.name.toLowerCase().contains(query) ||
                item.category.toLowerCase().contains(query) ||
                (item.subcategory ?? '').toLowerCase().contains(query);
            final matchesVerified = !_verifiedOnly || item.isVerified;
            final matchesPublic = !_publicOnly || item.isPublicService;
            return matchesQuery && matchesVerified && matchesPublic;
          }).toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const SectionTitle(
                eyebrow: 'Directory',
                title: 'Trusted local directory',
                subtitle: 'Police, clinics, schools, businesses, and public services.',
              ),
              const SizedBox(height: 16),
              LokalsSearchBar(
                controller: _searchController,
                hintText: 'Search clinics, police, businesses...',
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  ChoiceChip(
                    label: const Text('Verified'),
                    selected: _verifiedOnly,
                    onSelected: (_) => setState(() => _verifiedOnly = !_verifiedOnly),
                  ),
                  ChoiceChip(
                    label: const Text('Public service'),
                    selected: _publicOnly,
                    onSelected: (_) => setState(() => _publicOnly = !_publicOnly),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (filtered.isEmpty)
                const EmptyStateView(
                  title: 'No contacts found in Okahandja for this category',
                  body: 'Try another category or remove a filter.',
                )
              else
                ...filtered.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: LokalsSurfaceTile(
                      onTap: () => context.push('/directory/${item.id}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                radius: 24,
                                backgroundColor: AppColors.purpleSoft,
                                child: Text(
                                  item.name.characters.first.toUpperCase(),
                                  style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.name, style: AppTextStyles.h3.copyWith(fontSize: 18)),
                                    const SizedBox(height: 6),
                                    Text(
                                      [item.category, item.subcategory]
                                          .whereType<String>()
                                          .where((value) => value.isNotEmpty)
                                          .join(' | '),
                                      style: AppTextStyles.bodyMuted,
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      [item.area, item.town, item.location]
                                          .whereType<String>()
                                          .where((value) => value.isNotEmpty)
                                          .join(', '),
                                      style: AppTextStyles.bodyMuted,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: [
                              _MiniPill(
                                label: item.isPublicService
                                    ? 'Public service'
                                    : item.isVerified
                                        ? 'Verified'
                                        : 'Directory',
                              ),
                              _MiniPill(
                                label: item.openNow
                                    ? 'Open now'
                                    : item.availabilityStatus ?? 'Check hours',
                              ),
                              _MiniPill(
                                label: getDisplayDistance(item.distanceKm, item.location),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Directory unavailable',
              body: 'We could not load directory listings right now.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(directoryProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MiniPill extends StatelessWidget {
  const _MiniPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
        color: AppColors.surfaceWhite,
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal),
      ),
    );
  }
}
