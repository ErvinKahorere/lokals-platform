import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'community_impact_repository.dart';

class CommunityImpactPendingScreen extends ConsumerWidget {
  const CommunityImpactPendingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(communityImpactPendingProvider);

    return LokalsShell(
      title: 'Impact Approvals',
      showBack: true,
      child: items.when(
        data: (data) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            const SectionTitle(
              eyebrow: 'Town manager',
              title: 'Pending Community Impact approvals',
              subtitle: 'Approve only verified positive local contributions. No punitive scoring is supported.',
            ),
            const SizedBox(height: 16),
            if (data.isEmpty)
              const EmptyStateView(title: 'No pending approvals', body: 'Fresh verified actions will appear here for review.')
            else
              ...data.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.reason, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 6),
                        Text('${item.points} points • ${item.category.replaceAll('_', ' ')}', style: AppTextStyles.bodyMuted),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: AppButton(
                                label: 'Approve',
                                compact: true,
                                onPressed: () async {
                                  await ref.read(communityImpactRepositoryProvider).approvePending(item.id);
                                  ref.invalidate(communityImpactPendingProvider);
                                },
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: AppButton(
                                label: 'Reject',
                                compact: true,
                                variant: AppButtonVariant.secondary,
                                onPressed: () async {
                                  await ref.read(communityImpactRepositoryProvider).rejectPending(item.id);
                                  ref.invalidate(communityImpactPendingProvider);
                                },
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(title: 'Loading approvals', message: 'Checking pending Community Impact reviews...'),
        error: (error, _) => const Center(child: EmptyStateView(title: 'Approvals unavailable', body: 'Please try again shortly.')),
      ),
    );
  }
}
