import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'community_impact_repository.dart';

class CommunityImpactRewardsScreen extends ConsumerWidget {
  const CommunityImpactRewardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rewards = ref.watch(communityImpactRewardsProvider);

    return LokalsShell(
      title: 'Rewards',
      showBack: true,
      child: rewards.when(
        data: (data) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            const SectionTitle(
              eyebrow: 'Rewards marketplace',
              title: 'Spend approved points carefully',
              subtitle: 'These rewards stay separate from your private contribution history and only spend points after approval.',
            ),
            const SizedBox(height: 16),
            if (data.isEmpty)
              const EmptyStateView(title: 'No rewards yet', body: 'Sponsored rewards will appear here as the pilot grows.')
            else
              ...data.map(
                (reward) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        LokalsListTile(
                          leading: const Icon(Icons.card_giftcard_outlined, color: Colors.amber),
                          title: Text(reward.title),
                          subtitle: Text('${reward.pointsRequired} points • ${reward.sponsorName ?? 'Community sponsor'}'),
                        ),
                        if ((reward.description ?? '').isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(reward.description!),
                        ],
                        const SizedBox(height: 12),
                        AppButton(
                          label: 'Redeem',
                          compact: true,
                          onPressed: () async {
                            await ref.read(communityImpactRepositoryProvider).redeemReward(reward.id);
                            ref.invalidate(communityImpactRedemptionsProvider);
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Reward request sent for approval.')),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(title: 'Loading rewards', message: 'Checking active sponsor rewards...'),
        error: (error, _) => const Center(child: EmptyStateView(title: 'Rewards unavailable', body: 'Please try again shortly.')),
      ),
    );
  }
}
