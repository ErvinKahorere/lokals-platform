import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'community_project_card.dart';

class CommunityProjectReviewScreen extends ConsumerStatefulWidget {
  const CommunityProjectReviewScreen({
    super.key,
    required this.projectId,
  });

  final int projectId;

  @override
  ConsumerState<CommunityProjectReviewScreen> createState() => _CommunityProjectReviewScreenState();
}

class _CommunityProjectReviewScreenState extends ConsumerState<CommunityProjectReviewScreen> {
  final _reasonController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _review(String action) async {
    setState(() => _isSubmitting = true);
    try {
      await ref.read(discoveryRepositoryProvider).reviewCommunityProject(
            projectId: widget.projectId,
            action: action,
            reason: _reasonController.text.trim(),
          );
      ref.invalidate(pendingCommunityProjectsProvider);
      ref.invalidate(adminCommunityProjectDetailsProvider(widget.projectId));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Project ${action.replaceAll('_', ' ')} completed.')),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final projectAsync = ref.watch(adminCommunityProjectDetailsProvider(widget.projectId));

    return LokalsShell(
      title: 'Review initiative',
      showBack: true,
      child: projectAsync.when(
        data: (project) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
          children: [
            CommunityProjectCard(project: project),
            const SizedBox(height: 16),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Review notes', style: AppTextStyles.h3),
                  const SizedBox(height: 12),
                  LokalsTextField(
                    controller: _reasonController,
                    label: 'Notes or reason',
                    maxLines: 4,
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      AppButton(
                        label: 'Approve',
                        compact: true,
                        expanded: false,
                        isLoading: _isSubmitting,
                        onPressed: () => _review('approve'),
                      ),
                      AppButton(
                        label: 'Request changes',
                        compact: true,
                        expanded: false,
                        variant: AppButtonVariant.secondary,
                        onPressed: () => _review('request_changes'),
                      ),
                      AppButton(
                        label: 'Reject',
                        compact: true,
                        expanded: false,
                        variant: AppButtonVariant.danger,
                        onPressed: () => _review('reject'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: AppCard(
            child: AppButton(
              label: 'Retry loading review',
              expanded: false,
              compact: true,
              onPressed: () => ref.invalidate(adminCommunityProjectDetailsProvider(widget.projectId)),
            ),
          ),
        ),
      ),
    );
  }
}
