import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../reports/my_reports_screen.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class TownManagerDashboardScreen extends ConsumerStatefulWidget {
  const TownManagerDashboardScreen({super.key});

  @override
  ConsumerState<TownManagerDashboardScreen> createState() => _TownManagerDashboardScreenState();
}

class _TownManagerDashboardScreenState extends ConsumerState<TownManagerDashboardScreen> {
  final _alertTitleController = TextEditingController();
  final _alertBodyController = TextEditingController();
  String _alertType = 'municipal_alert';
  bool _isPublishing = false;

  @override
  void dispose() {
    _alertTitleController.dispose();
    _alertBodyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(municipalityDashboardProvider);

    return LokalsShell(
      title: 'Okahandja Town Manager Portal',
      child: dashboard.when(
        data: (data) => DashboardScaffold(
          title: 'Okahandja town manager portal',
          subtitle: 'Reports, municipal alerts, public services, and urgent issues in one action-focused space.',
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? const {}),
          quickActions: buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
          pendingTasks: ((data['pending_tasks'] as List?) ?? const [])
              .map((item) => Map<String, dynamic>.from(item as Map))
              .toList(),
          recentActivity: ((data['recent_activity'] as List?) ?? const [])
              .map((item) => Map<String, dynamic>.from(item as Map))
              .toList(),
          extraSections: [
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    title: 'Publish municipal alert',
                    subtitle: 'Use the existing alerts system so residents see urgent service updates in the normal app flow.',
                  ),
                  const SizedBox(height: 12),
                  LokalsTextField(controller: _alertTitleController, label: 'Alert title'),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _alertType,
                    items: const [
                      DropdownMenuItem(value: 'municipal_alert', child: Text('Municipal alert')),
                      DropdownMenuItem(value: 'public_notice', child: Text('Public notice')),
                      DropdownMenuItem(value: 'service_update', child: Text('Service update')),
                      DropdownMenuItem(value: 'emergency_alert', child: Text('Emergency alert')),
                    ],
                    decoration: const InputDecoration(labelText: 'Alert type'),
                    onChanged: (value) => setState(() => _alertType = value ?? 'municipal_alert'),
                  ),
                  const SizedBox(height: 12),
                  LokalsTextField(
                    controller: _alertBodyController,
                    label: 'Alert message',
                    maxLines: 4,
                  ),
                  const SizedBox(height: 16),
                  PrimaryAction(
                    label: 'Publish alert',
                    isBusy: _isPublishing,
                    onPressed: () async {
                      final messenger = ScaffoldMessenger.of(context);
                      setState(() => _isPublishing = true);
                      await ref.read(discoveryRepositoryProvider).createMunicipalAlert(
                            title: _alertTitleController.text.trim(),
                            body: _alertBodyController.text.trim(),
                            type: _alertType,
                          );
                      ref.invalidate(municipalityDashboardProvider);
                      ref.invalidate(alertsFeedProvider);
                      ref.invalidate(notificationsProvider);
                      if (!mounted) return;
                      setState(() {
                        _isPublishing = false;
                        _alertTitleController.clear();
                        _alertBodyController.clear();
                        _alertType = 'municipal_alert';
                      });
                      messenger.showSnackBar(
                        const SnackBar(content: Text('Alert sent successfully')),
                      );
                    },
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
                    title: 'Recent reports',
                    subtitle: 'The latest citizen issues from across Okahandja.',
                  ),
                  const SizedBox(height: 12),
                  ...(((data['recent_reports'] as List?) ?? const [])
                      .map((item) => Map<String, dynamic>.from(item as Map))
                      .take(4)
                      .map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: DashboardQuickActionTile(
                              label: item['title']?.toString() ?? 'Report',
                              body: '${item['category'] ?? 'issue'} | ${item['status'] ?? 'open'}',
                              icon: Icons.assignment_outlined,
                              onTap: () => context.go('/reports/${item['id']}'),
                            ),
                          ))),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Consumer(
              builder: (context, ref, _) {
                final reports = ref.watch(myReportsProvider).asData?.value ?? const [];
                final resolvedReports = reports.where((report) => report.status == 'resolved').take(2).toList();

                return LokalsCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SectionTitle(
                        title: 'Resolved updates',
                        subtitle: 'Use this to show that residents can see outcomes after council action.',
                      ),
                      const SizedBox(height: 12),
                      if (resolvedReports.isEmpty)
                        const Text('Resolved reports will appear here after the first demo status update.')
                      else
                        ...resolvedReports.map(
                          (report) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: DashboardQuickActionTile(
                              label: report.title,
                              body: report.resolutionNotes?.isNotEmpty == true
                                  ? report.resolutionNotes!
                                  : 'Resolved and visible to the reporting resident.',
                              icon: Icons.check_circle_outline,
                              onTap: () => context.go('/reports/${report.id}'),
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
        loading: () => const LokalsLoadingScreen(
          title: 'Loading town manager portal',
          message: 'Bringing in Okahandja reports, alerts, and urgent issues...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Dashboard unavailable',
            body: 'Try again in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(municipalityDashboardProvider),
            ),
          ),
        ),
      ),
    );
  }
}
