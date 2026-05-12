import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'community_impact_repository.dart';

class CommunityImpactHistoryScreen extends ConsumerWidget {
  const CommunityImpactHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(communityImpactTransactionsProvider);

    return LokalsShell(
      title: 'My Points History',
      showBack: true,
      child: items.when(
        data: (data) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            const SectionTitle(
              eyebrow: 'Private history',
              title: 'My points history',
              subtitle: 'Only you and authorized reviewers can see the detailed reasons behind these records.',
            ),
            const SizedBox(height: 16),
            ...data.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: LokalsCard(
                  child: LokalsListTile(
                    leading: Icon(
                      item.verificationStatus == 'approved' ? Icons.check_circle_outline : Icons.schedule_outlined,
                    ),
                    title: Text(item.reason),
                    subtitle: Text('${item.points} points • ${item.verificationStatus.replaceAll('_', ' ')}'),
                  ),
                ),
              ),
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(title: 'Loading history', message: 'Pulling in your verified and pending records...'),
        error: (error, _) => const Center(child: EmptyStateView(title: 'History unavailable', body: 'Please try again shortly.')),
      ),
    );
  }
}
