import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'community_impact_repository.dart';

class CommunityImpactLeaderboardScreen extends ConsumerStatefulWidget {
  const CommunityImpactLeaderboardScreen({super.key});

  @override
  ConsumerState<CommunityImpactLeaderboardScreen> createState() => _CommunityImpactLeaderboardScreenState();
}

class _CommunityImpactLeaderboardScreenState extends ConsumerState<CommunityImpactLeaderboardScreen> {
  String _period = 'all_time';

  @override
  Widget build(BuildContext context) {
    final entries = ref.watch(communityImpactLeaderboardProvider(_period));

    return LokalsShell(
      title: 'Leaderboard',
      showBack: true,
      child: entries.when(
        data: (data) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            const SectionTitle(
              eyebrow: 'Opt-in only',
              title: 'Positive community leaderboard',
              subtitle: 'Only residents who choose visibility appear here. Detailed deeds stay private.',
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              children: [
                for (final item in const [('weekly', 'Weekly'), ('monthly', 'Monthly'), ('all_time', 'All time')])
                  ChoiceChip(
                    label: Text(item.$2),
                    selected: _period == item.$1,
                    onSelected: (_) => setState(() => _period = item.$1),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (data.isEmpty)
              const EmptyStateView(title: 'No public entries yet', body: 'Residents can choose to appear here from Community Impact privacy settings.')
            else
              ...data.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsCard(
                    child: LokalsListTile(
                      leading: CircleAvatar(child: Text(item.avatarPlaceholder ?? '#')),
                      title: Text('#${item.rank} • ${item.displayName}'),
                      subtitle: Text('${item.points} points • ${item.level}'),
                    ),
                  ),
                ),
              ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(title: 'Loading leaderboard', message: 'Checking positive community momentum...'),
        error: (error, _) => const Center(child: EmptyStateView(title: 'Leaderboard unavailable', body: 'Please try again shortly.')),
      ),
    );
  }
}
