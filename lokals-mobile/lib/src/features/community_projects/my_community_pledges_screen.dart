import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class MyCommunityPledgesScreen extends ConsumerWidget {
  const MyCommunityPledgesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pledgesAsync = ref.watch(myCommunityPledgesProvider);

    return LokalsShell(
      title: 'My pledges',
      showBack: true,
      child: pledgesAsync.when(
        data: (pledges) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
          children: [
            const SectionTitle(
              title: 'Support I pledged',
              subtitle: 'Keep track of the local projects you offered money, items, volunteer time, or services to.',
            ),
            const SizedBox(height: 16),
            if (pledges.isEmpty)
              const EmptyStateView(
                title: 'No pledges yet',
                body: 'When you support a project, your pledge history will appear here.',
              )
            else
              ...pledges.map(
                (pledge) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(pledge.project?.title ?? 'Community project', style: AppTextStyles.h3),
                        const SizedBox(height: 8),
                        Text(pledge.pledgeDescription, style: AppTextStyles.body),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            AppBadge(label: pledge.pledgeType, tone: AppBadgeTone.brand),
                            if (pledge.status != null)
                              AppBadge(label: pledge.status!, tone: AppBadgeTone.info),
                            if (pledge.amount != null)
                              AppBadge(label: 'N\$ ${pledge.amount}', tone: AppBadgeTone.success),
                          ],
                        ),
                        const SizedBox(height: 12),
                        AppButton(
                          label: 'Open project',
                          expanded: false,
                          compact: true,
                          variant: AppButtonVariant.secondary,
                          onPressed: pledge.project == null
                              ? null
                              : () => context.push('/get-involved/${pledge.project!.slug}'),
                        ),
                      ],
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
              label: 'Retry loading pledges',
              expanded: false,
              compact: true,
              onPressed: () => ref.invalidate(myCommunityPledgesProvider),
            ),
          ),
        ),
      ),
    );
  }
}
