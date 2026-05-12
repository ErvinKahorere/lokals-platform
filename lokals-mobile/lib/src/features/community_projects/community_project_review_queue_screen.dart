import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'community_project_card.dart';

class CommunityProjectReviewQueueScreen extends ConsumerWidget {
  const CommunityProjectReviewQueueScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingAsync = ref.watch(pendingCommunityProjectsProvider);

    return LokalsShell(
      title: 'Pending initiatives',
      showBack: true,
      child: pendingAsync.when(
        data: (projects) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
          children: [
            const SectionTitle(
              eyebrow: 'Town Manager',
              title: 'Pending community project review',
              subtitle: 'Review every submission before it becomes visible in Get Involved.',
            ),
            const SizedBox(height: 16),
            if (projects.isEmpty)
              const EmptyStateView(
                title: 'No pending initiatives',
                body: 'New submissions waiting for verification will appear here.',
              )
            else
              ...projects.map(
                (project) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: CommunityProjectCompactTile(
                    project: project,
                    onTap: () => context.push('/dashboard/community-projects/pending/${project.id}'),
                    trailing: const Icon(Icons.chevron_right_rounded),
                  ),
                ),
              ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: AppCard(
            child: AppButton(
              label: 'Retry queue',
              expanded: false,
              compact: true,
              onPressed: () => ref.invalidate(pendingCommunityProjectsProvider),
            ),
          ),
        ),
      ),
    );
  }
}
