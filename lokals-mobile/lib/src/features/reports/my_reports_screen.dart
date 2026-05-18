import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';

final myReportsProvider = FutureProvider<List<ReportModel>>((ref) async {
  final user = ref.watch(authControllerProvider).user;
  final repository = ref.read(discoveryRepositoryProvider);
  final isTownManager = user?.roles.contains('town_manager') == true || user?.roles.contains('municipality_admin') == true;
  return isTownManager ? repository.fetchManagedReports() : repository.fetchMyReports();
});

class MyReportsScreen extends ConsumerWidget {
  const MyReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reports = ref.watch(myReportsProvider);
    final user = ref.watch(authControllerProvider).user;
    final isTownManager = user?.roles.contains('town_manager') == true || user?.roles.contains('municipality_admin') == true;

    return LokalsShell(
      title: isTownManager ? 'Manage Reports' : 'My Reports',
      showBack: true,
      child: reports.when(
        data: (items) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            SectionTitle(
              title: isTownManager ? 'Town reports' : 'Track your reports',
              subtitle: isTownManager
                  ? 'Review open issues, urgent items, and resident updates for your area.'
                  : 'See issue progress and status updates in one place.',
            ),
            const SizedBox(height: 16),
            if (items.isEmpty)
              const EmptyStateView(
                title: 'No reports yet.',
                body: 'Reported issues will show here once they are submitted.',
              )
            else
              ...items.map((report) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: LokalsSurfaceTile(
                      onTap: () => context.go('/reports/${report.id}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  report.title,
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ),
                              AppBadge(
                                label: report.status.replaceAll('_', ' '),
                                tone: report.status == 'resolved' || report.status == 'closed'
                                    ? AppBadgeTone.success
                                    : report.status == 'rejected'
                                        ? AppBadgeTone.danger
                                        : report.status == 'in_progress' || report.status == 'assigned'
                                            ? AppBadgeTone.info
                                            : AppBadgeTone.warning,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(report.description, style: Theme.of(context).textTheme.bodyMedium),
                          const SizedBox(height: 8),
                          Text(
                            report.location ?? [report.area, report.town].whereType<String>().join(', '),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  )),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading reports',
          message: 'Gathering your submitted city issues...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Reports unavailable',
            body: 'We could not load report activity right now. Try refreshing in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(myReportsProvider),
            ),
          ),
        ),
      ),
    );
  }
}
