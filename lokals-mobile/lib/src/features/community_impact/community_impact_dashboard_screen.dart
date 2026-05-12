import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'community_impact_repository.dart';

class CommunityImpactDashboardScreen extends ConsumerWidget {
  const CommunityImpactDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(communityImpactDashboardProvider);

    return LokalsShell(
      title: 'Community Impact',
      showBack: true,
      child: dashboard.when(
        data: (data) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    eyebrow: 'Verified only',
                    title: 'Community Impact Rewards',
                    subtitle: 'Points are awarded only after positive local contributions are reviewed. Nothing here is public unless you choose it.',
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: MetricCard(
                          label: 'Available',
                          value: '${data.account.availablePoints}',
                          color: AppColors.primaryGreen,
                          icon: Icons.stars_rounded,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: MetricCard(
                          label: 'Lifetime',
                          value: '${data.account.lifetimePoints}',
                          color: AppColors.primaryPurple,
                          icon: Icons.workspace_premium_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      LokalsStatusPill(label: data.account.currentLevel, tone: AppBadgeTone.brand),
                      if (data.account.currentBadge != null)
                        LokalsStatusPill(label: data.account.currentBadge!.title, tone: AppBadgeTone.success),
                      LokalsStatusPill(
                        label: data.account.publicLeaderboardOptIn ? 'Leaderboard visible' : 'Leaderboard private',
                        tone: data.account.publicLeaderboardOptIn ? AppBadgeTone.success : AppBadgeTone.neutral,
                      ),
                    ],
                  ),
                  if (data.account.nextBadge != null) ...[
                    const SizedBox(height: 14),
                    Text(
                      'Next milestone: ${data.account.nextBadge!.title} at ${data.account.nextBadge!.pointsThreshold ?? 0} points.',
                      style: AppTextStyles.bodyMuted,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _NavTile(label: 'Points history', icon: Icons.receipt_long_outlined, route: '/community-impact/history'),
                _NavTile(label: 'Rewards', icon: Icons.card_giftcard_outlined, route: '/community-impact/rewards'),
                _NavTile(label: 'My redemptions', icon: Icons.redeem_outlined, route: '/community-impact/redemptions'),
                _NavTile(label: 'Leaderboard', icon: Icons.leaderboard_outlined, route: '/community-impact/leaderboard'),
                _NavTile(label: 'Privacy', icon: Icons.lock_outline_rounded, route: '/community-impact/privacy'),
              ],
            ),
            const SizedBox(height: 16),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    title: 'Recent approved activity',
                    subtitle: 'Only you and reviewing officials can see your detailed reward history.',
                  ),
                  const SizedBox(height: 12),
                  if (data.recentApproved.isEmpty)
                    const EmptyStateView(
                      title: 'No approved points yet',
                      body: 'Verified community contributions will appear here after review.',
                    )
                  else
                    ...data.recentApproved.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: LokalsListTile(
                          leading: const Icon(Icons.check_circle_outline, color: AppColors.primaryGreen),
                          title: Text(item.reason),
                          subtitle: Text('${item.points} points • ${item.category.replaceAll('_', ' ')}'),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    title: 'Awaiting verification',
                    subtitle: 'Pending items do not become spendable until they are approved.',
                  ),
                  const SizedBox(height: 12),
                  if (data.pendingTransactions.isEmpty)
                    const Text('No pending items right now.', style: AppTextStyles.bodyMuted)
                  else
                    ...data.pendingTransactions.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: LokalsListTile(
                          leading: const Icon(Icons.schedule_rounded, color: AppColors.warning),
                          title: Text(item.reason),
                          subtitle: Text('${item.points} points • awaiting review'),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading Community Impact',
          message: 'Bringing in your verified contributions and rewards...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Community Impact unavailable',
            body: 'Try again in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(communityImpactDashboardProvider),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavTile extends StatelessWidget {
  const _NavTile({
    required this.label,
    required this.icon,
    required this.route,
  });

  final String label;
  final IconData icon;
  final String route;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 156,
      child: LokalsSurfaceTile(
        onTap: () => context.go(route),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.purpleSoftAlt,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: AppColors.primaryPurple),
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(label, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700))),
          ],
        ),
      ),
    );
  }
}
