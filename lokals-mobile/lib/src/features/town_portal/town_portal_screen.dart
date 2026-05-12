import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../config/app_config.dart';
import '../../features/discovery/discovery_repository.dart';
import '../dashboard/widgets/dashboard_common.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';

class TownPortalScreen extends ConsumerWidget {
  const TownPortalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alerts = ref.watch(alertsFeedProvider);
    final directory = ref.watch(directoryProvider);
    final events = ref.watch(eventsProvider);
    final news = ref.watch(newsProvider(const {'town': AppConfig.pilotTown}));

    return LokalsShell(
      title: 'Okahandja Portal',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        children: [
          const SectionTitle(
            title: 'Okahandja Town',
            subtitle: 'Your digital town hub',
            eyebrow: 'Town portal',
          ),
          const SizedBox(height: 16),
          AppCard(
            variant: AppCardVariant.dashboard,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const AppBadge(label: 'Okahandja pilot', tone: AppBadgeTone.brand),
                const SizedBox(height: 10),
                Text('LOKALS ${AppConfig.pilotTown}', style: const TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                const Text('Town alerts, services, public updates, and local action in one place.'),
                const SizedBox(height: 10),
                const Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    AppBadge(label: 'Official', tone: AppBadgeTone.neutral),
                    AppBadge(label: 'Municipality-ready', tone: AppBadgeTone.success),
                  ],
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    AppButton(label: 'Report Issue', expanded: false, onPressed: () => context.go('/report-issue')),
                    AppButton(label: 'View Alerts', expanded: false, variant: AppButtonVariant.secondary, onPressed: () => context.go('/alerts')),
                    AppButton(label: 'Find Public Service', expanded: false, variant: AppButtonVariant.secondary, onPressed: () => context.go('/directory')),
                    AppButton(label: 'Contact Council', expanded: false, variant: AppButtonVariant.secondary, onPressed: () => context.go('/directory')),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: MetricCard(
                  label: 'Town alerts',
                  value: '${(alerts.asData?.value ?? const []).length}',
                  color: AppColors.primaryPurple,
                  icon: Icons.notifications_active_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: MetricCard(
                  label: 'Public services',
                  value: '${(directory.asData?.value ?? const []).where((item) => item.isPublicService).length}',
                  color: AppColors.primaryGreen,
                  icon: Icons.account_balance_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: MetricCard(
                  label: 'Events',
                  value: '${(events.asData?.value ?? const []).length}',
                  color: AppColors.warning,
                  icon: Icons.event_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: MetricCard(
                  label: 'News',
                  value: '${(news.asData?.value ?? const []).length}',
                  color: AppColors.primaryPurple,
                  icon: Icons.newspaper_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _PortalSection(
            title: 'Town Alerts',
            subtitle: 'Recent council and service notices.',
            child: alerts.when(
              data: (items) => Column(
                children: items.take(4).map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: DashboardQuickActionTile(
                    label: item.title,
                    body: item.location ?? AppConfig.pilotTown,
                    icon: Icons.notifications_active_outlined,
                    onTap: () => context.go('/alerts'),
                  ),
                )).toList(),
              ),
              loading: () => const LoadingSkeleton(height: 120),
              error: (error, _) => const Text('Alerts unavailable right now.'),
            ),
          ),
          const SizedBox(height: 16),
          _PortalSection(
            title: 'Public Services',
            subtitle: 'Council, police, clinics, and facilities.',
            child: directory.when(
              data: (items) => Column(
                children: items.where((item) => item.isPublicService).take(5).map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: DashboardQuickActionTile(
                    label: item.name,
                    body: '${item.category} | ${item.area ?? item.town ?? item.location}',
                    icon: Icons.account_balance_outlined,
                    onTap: () => context.go('/directory/${item.id}'),
                  ),
                )).toList(),
              ),
              loading: () => const LoadingSkeleton(height: 120),
              error: (error, _) => const Text('Directory unavailable right now.'),
            ),
          ),
          const SizedBox(height: 16),
          _PortalSection(
            title: 'Emergency Contacts',
            subtitle: 'Tap through to call or WhatsApp.',
            child: directory.when(
              data: (items) => Column(
                children: items.where((item) => item.emergencyContact || item.category.toLowerCase().contains('police') || item.category.toLowerCase().contains('health')).take(4).map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: DashboardQuickActionTile(
                    label: item.name,
                    body: item.phone ?? 'Call details available from the council desk',
                    icon: Icons.call_outlined,
                    onTap: () => context.go('/directory/${item.id}'),
                  ),
                )).toList(),
              ),
              loading: () => const LoadingSkeleton(height: 120),
              error: (error, _) => const Text('Emergency contacts unavailable right now.'),
            ),
          ),
          const SizedBox(height: 16),
          _PortalSection(
            title: 'Events and News',
            subtitle: 'Fresh local updates for the pilot.',
            child: Column(
              children: [
                events.when(
                  data: (items) => DashboardQuickActionTile(
                    label: 'Events',
                    body: '${items.take(3).length} local events ready',
                    icon: Icons.event_outlined,
                    onTap: () => context.go('/events'),
                  ),
                  loading: () => const LoadingSkeleton(height: 68),
                  error: (error, _) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 10),
                news.when(
                  data: (items) => DashboardQuickActionTile(
                    label: 'News',
                    body: '${items.take(3).length} local news items ready',
                    icon: Icons.newspaper_outlined,
                    onTap: () => context.go('/news'),
                  ),
                  loading: () => const LoadingSkeleton(height: 68),
                  error: (error, _) => const SizedBox.shrink(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PortalSection extends StatelessWidget {
  const _PortalSection({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(title: title, subtitle: subtitle),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}
