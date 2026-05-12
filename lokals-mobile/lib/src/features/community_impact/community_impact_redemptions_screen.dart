import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'community_impact_repository.dart';

class CommunityImpactRedemptionsScreen extends ConsumerWidget {
  const CommunityImpactRedemptionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final redemptions = ref.watch(communityImpactRedemptionsProvider);

    return LokalsShell(
      title: 'My Redemptions',
      showBack: true,
      child: redemptions.when(
        data: (data) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            const SectionTitle(
              eyebrow: 'Reward requests',
              title: 'My redemptions',
              subtitle: 'Requests move through approval before points are fully spent or rewards are fulfilled.',
            ),
            const SizedBox(height: 16),
            if (data.isEmpty)
              const EmptyStateView(title: 'No reward requests yet', body: 'Redeemed rewards will appear here.')
            else
              ...data.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsCard(
                    child: LokalsListTile(
                      leading: const Icon(Icons.redeem_outlined),
                      title: Text(item.reward?.title ?? 'Reward'),
                      subtitle: Text('${item.pointsSpent} points • ${item.status.replaceAll('_', ' ')}'),
                    ),
                  ),
                ),
              ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(title: 'Loading redemptions', message: 'Checking your reward requests...'),
        error: (error, _) => const Center(child: EmptyStateView(title: 'Redemptions unavailable', body: 'Please try again shortly.')),
      ),
    );
  }
}
