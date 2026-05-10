import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../auth/auth_navigation.dart';
import '../discovery/discovery_repository.dart';
import '../../../shared/widgets/experience/quick_call_button.dart';

class DirectoryScreen extends ConsumerStatefulWidget {
  const DirectoryScreen({super.key});

  @override
  ConsumerState<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends ConsumerState<DirectoryScreen> {
  final _searchController = TextEditingController();
  bool _verifiedOnly = false;
  bool _publicOnly = false;
  String _selectedCategory = 'all';

  static const _directoryCategories = [
    ('all', 'All'),
    ('public', 'Public'),
    ('police', 'Police'),
    ('clinic', 'Clinic'),
    ('council', 'Council'),
    ('emergency', 'Emergency'),
    ('business', 'Business'),
  ];

  bool _matchesCategory(String category, String subcategory, bool isPublicService) {
    final haystack = '$category $subcategory'.toLowerCase();
    switch (_selectedCategory) {
      case 'public':
        return isPublicService;
      case 'police':
        return haystack.contains('police');
      case 'clinic':
        return haystack.contains('clinic') || haystack.contains('health');
      case 'council':
        return haystack.contains('council') || haystack.contains('municipal');
      case 'emergency':
        return haystack.contains('emergency');
      case 'business':
        return !isPublicService;
      default:
        return true;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final directory = ref.watch(directoryProvider);
    final auth = ref.watch(authControllerProvider);
    final followedOrganizationIds = ref.watch(followedOrganizationIdsProvider);

    return LokalsShell(
      title: 'Directory',
      showBack: true,
      child: directory.when(
        data: (items) {
          final query = _searchController.text.toLowerCase().trim();
          final filtered = items.where((item) {
            final matchesQuery = query.isEmpty ||
                item.name.toLowerCase().contains(query) ||
                item.category.toLowerCase().contains(query) ||
                (item.subcategory ?? '').toLowerCase().contains(query) ||
                (item.description ?? '').toLowerCase().contains(query);
            final matchesVerified = !_verifiedOnly || item.isVerified;
            final matchesPublic = !_publicOnly || item.isPublicService;
            final matchesCategory = _matchesCategory(item.category, item.subcategory ?? '', item.isPublicService);
            return matchesQuery && matchesVerified && matchesPublic && matchesCategory;
          }).toList()
            ..sort((a, b) {
              if (a.isPublicService != b.isPublicService) {
                return a.isPublicService ? -1 : 1;
              }
              return (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999);
            });

          final publicServices = filtered.where((item) => item.isPublicService).take(4).toList();
          final organizations = filtered.where((item) => !item.isPublicService).take(8).toList();

          Future<void> toggleFollow(OrganizationModel item, bool isFollowing) async {
            if (auth.token == null) {
              promptSignIn(context, next: GoRouterState.of(context).uri.toString());
              return;
            }

            if (isFollowing) {
              await ref.read(discoveryRepositoryProvider).unfollowOrganization(item.id);
            } else {
              await ref.read(discoveryRepositoryProvider).followOrganization(item.id);
            }
            ref.invalidate(followedOrganizationIdsProvider);
          }

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
              SizedBox(
                height: 42,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (context, index) {
                    final item = _directoryCategories[index];
                    return ChoiceChip(
                      label: Text(item.$2),
                      selected: _selectedCategory == item.$1,
                      onSelected: (_) => setState(() => _selectedCategory = item.$1),
                    );
                  },
                  separatorBuilder: (context, index) => const SizedBox(width: 10),
                  itemCount: _directoryCategories.length,
                ),
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
              else ...[
                if (publicServices.isNotEmpty) ...[
                  const Text('Public services', style: AppTextStyles.h3),
                  const SizedBox(height: 12),
                  ...publicServices.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _DirectoryCard(
                          item: item,
                          isFollowing: followedOrganizationIds.asData?.value.contains(item.id) ?? false,
                          onTap: () => context.push('/directory/${item.id}'),
                          onFollow: () => toggleFollow(item, followedOrganizationIds.asData?.value.contains(item.id) ?? false),
                        ),
                      )),
                  const SizedBox(height: 8),
                ],
                if (organizations.isNotEmpty) ...[
                  const Text('Businesses and providers', style: AppTextStyles.h3),
                  const SizedBox(height: 12),
                  ...organizations.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _DirectoryCard(
                          item: item,
                          isFollowing: followedOrganizationIds.asData?.value.contains(item.id) ?? false,
                          onTap: () => context.push('/directory/${item.id}'),
                          onFollow: () => toggleFollow(item, followedOrganizationIds.asData?.value.contains(item.id) ?? false),
                        ),
                      )),
                ],
              ],
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading directory',
          message: 'Finding local services and public contacts...',
        ),
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

class _DirectoryCard extends StatelessWidget {
  const _DirectoryCard({
    required this.item,
    required this.isFollowing,
    required this.onTap,
    required this.onFollow,
  });

  final OrganizationModel item;
  final bool isFollowing;
  final VoidCallback onTap;
  final VoidCallback onFollow;

  @override
  Widget build(BuildContext context) {
    return LokalsSurfaceTile(
      onTap: onTap,
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
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: QuickCallButton(phone: item.phone)),
              const SizedBox(width: 10),
              Expanded(
                child: AppButton(
                  label: isFollowing ? 'Following' : 'Follow',
                  expanded: true,
                  variant: isFollowing ? AppButtonVariant.primary : AppButtonVariant.secondary,
                  onPressed: onFollow,
                ),
              ),
            ],
          ),
        ],
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
