import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'community_project_card.dart';

class GetInvolvedHomeScreen extends ConsumerWidget {
  const GetInvolvedHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featuredAsync = ref.watch(featuredCommunityProjectsProvider);
    const recentParams = {'featured': false};
    final projectsAsync = ref.watch(communityProjectsProvider(recentParams));
    final auth = ref.watch(authControllerProvider);
    final role = auth.user?.currentRole ?? (auth.user?.roles.isNotEmpty == true ? auth.user!.roles.first : 'citizen');
    final canReview = const {'town_manager', 'municipality_admin', 'super_admin', 'operator'}.contains(role);

    return LokalsShell(
      title: 'Get Involved',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
        children: [
          const SectionTitle(
            eyebrow: 'Community projects',
            title: 'Verified local initiatives',
            subtitle: 'Browse approved charity drives, volunteer opportunities, and community support requests across Okahandja.',
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    AppButton(
                      label: 'Browse projects',
                      icon: Icons.volunteer_activism_outlined,
                      expanded: false,
                      onPressed: () => context.push('/get-involved/list'),
                    ),
                    AppButton(
                      label: 'Submit project',
                      icon: Icons.add_circle_outline_rounded,
                      expanded: false,
                      variant: AppButtonVariant.accent,
                      onPressed: () => context.push('/get-involved/submit'),
                    ),
                    AppButton(
                      label: 'My projects',
                      expanded: false,
                      compact: true,
                      variant: AppButtonVariant.secondary,
                      onPressed: () => context.push('/get-involved/my-projects'),
                    ),
                    AppButton(
                      label: 'My pledges',
                      expanded: false,
                      compact: true,
                      variant: AppButtonVariant.secondary,
                      onPressed: () => context.push('/get-involved/my-pledges'),
                    ),
                    if (canReview)
                      AppButton(
                        label: 'Pending review',
                        expanded: false,
                        compact: true,
                        variant: AppButtonVariant.secondary,
                        onPressed: () => context.push('/dashboard/community-projects/pending'),
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SectionTitle(
            eyebrow: 'Featured',
            title: 'Community projects needing support',
            subtitle: 'Town Manager approved initiatives ready for donations, volunteer time, and local action.',
            action: TextButton(
              onPressed: () => context.push('/get-involved/list'),
              child: const Text('View all'),
            ),
          ),
          const SizedBox(height: 14),
          featuredAsync.when(
            data: (projects) {
              if (projects.isEmpty) {
                return const EmptyStateView(
                  title: 'No featured initiatives yet',
                  body: 'Town-approved projects will appear here as soon as local organisers publish them.',
                );
              }

              return Column(
                children: [
                  for (final project in projects.take(3)) ...[
                    CommunityProjectCard(
                      project: project,
                      onTap: () => context.push('/get-involved/${project.slug}'),
                    ),
                    const SizedBox(height: 14),
                  ],
                ],
              );
            },
            loading: () => const LoadingSkeleton(height: 280),
            error: (_, __) => AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Could not load projects right now.', style: AppTextStyles.h3),
                  const SizedBox(height: 10),
                    AppButton(
                      label: 'Retry',
                      expanded: false,
                      compact: true,
                      onPressed: () => ref.invalidate(featuredCommunityProjectsProvider),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 22),
          SectionTitle(
            eyebrow: 'Updates',
            title: 'Recently active initiatives',
            subtitle: 'See where support is still needed and which projects are making visible progress.',
            action: TextButton(
              onPressed: () => context.push('/get-involved/list'),
              child: const Text('Explore'),
            ),
          ),
          const SizedBox(height: 12),
          projectsAsync.when(
            data: (projects) {
              if (projects.isEmpty) {
                return const EmptyStateView(
                  title: 'No initiatives available',
                  body: 'Approved community projects will appear here once organisers submit them for review.',
                );
              }

              return Column(
                children: [
                  for (final project in projects.take(5)) ...[
                    CommunityProjectCompactTile(
                      project: project,
                      onTap: () => context.push('/get-involved/${project.slug}'),
                      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.primaryPurple),
                    ),
                    const SizedBox(height: 10),
                  ],
                ],
              );
            },
            loading: () => const LoadingSkeleton(height: 220),
            error: (_, __) => AppCard(
              child: AppButton(
                label: 'Retry loading initiatives',
                expanded: false,
                compact: true,
                onPressed: () => ref.invalidate(communityProjectsProvider(recentParams)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
