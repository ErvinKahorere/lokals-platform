import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'community_project_card.dart';

class MyCommunityProjectsScreen extends ConsumerWidget {
  const MyCommunityProjectsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectsAsync = ref.watch(myCommunityProjectsProvider);

    return LokalsShell(
      title: 'My initiatives',
      showBack: true,
      child: projectsAsync.when(
        data: (projects) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
          children: [
            const SectionTitle(
              title: 'My community projects',
              subtitle: 'Track approval status, updates, and support progress for your submissions.',
            ),
            const SizedBox(height: 16),
            if (projects.isEmpty)
              const EmptyStateView(
                title: 'No projects submitted yet',
                body: 'Start a verified local initiative for donations, volunteers, or community support.',
              )
            else
              ...projects.map(
                (project) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: CommunityProjectCard(
                    project: project,
                    onTap: () => context.push('/get-involved/${project.slug}'),
                    action: Align(
                      alignment: Alignment.centerLeft,
                      child: AppButton(
                        label: 'Open updates',
                        expanded: false,
                        compact: true,
                        variant: AppButtonVariant.secondary,
                        onPressed: () => context.push('/get-involved/${project.slug}/updates'),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: AppCard(
            child: AppButton(
              label: 'Retry loading my projects',
              expanded: false,
              compact: true,
              onPressed: () => ref.invalidate(myCommunityProjectsProvider),
            ),
          ),
        ),
      ),
    );
  }
}
