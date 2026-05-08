import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'my_reports_screen.dart';

final reportDetailsProvider = FutureProvider.family<ReportModel, int>((ref, reportId) async {
  return ref.read(discoveryRepositoryProvider).fetchReport(reportId);
});

class ReportDetailsScreen extends ConsumerStatefulWidget {
  const ReportDetailsScreen({super.key, required this.reportId});

  final int reportId;

  @override
  ConsumerState<ReportDetailsScreen> createState() => _ReportDetailsScreenState();
}

class _ReportDetailsScreenState extends ConsumerState<ReportDetailsScreen> {
  String _status = 'open';
  final _noteController = TextEditingController();
  bool _isSaving = false;

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final report = ref.watch(reportDetailsProvider(widget.reportId));
    final user = ref.watch(authControllerProvider).user;
    final canManage = user?.roles.contains('town_manager') == true ||
        user?.roles.contains('municipality_admin') == true ||
        user?.roles.contains('super_admin') == true ||
        user?.roles.contains('operator') == true;

    return LokalsShell(
      title: 'Report Details',
      showBack: true,
      child: report.when(
        data: (item) {
          _status = _status == 'open' ? item.status : _status;

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              SectionTitle(
                title: item.title,
                subtitle: item.location ?? [item.area, item.town].whereType<String>().join(', '),
              ),
              const SizedBox(height: 16),
              LokalsCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppBadge(
                      label: item.status.replaceAll('_', ' '),
                      tone: item.status == 'resolved'
                          ? AppBadgeTone.success
                          : item.status == 'rejected'
                              ? AppBadgeTone.danger
                              : AppBadgeTone.warning,
                    ),
                    const SizedBox(height: 12),
                    Text(item.description, style: Theme.of(context).textTheme.bodyLarge),
                    if ((item.resolutionNotes ?? '').isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('Latest update', style: TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      Text(item.resolutionNotes!),
                    ],
                  ],
                ),
              ),
              if (canManage) ...[
                const SizedBox(height: 16),
                LokalsCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SectionTitle(
                        title: 'Manage report',
                        subtitle: 'Update status and leave a short public note.',
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        initialValue: _status,
                        items: const [
                          DropdownMenuItem(value: 'open', child: Text('Open')),
                          DropdownMenuItem(value: 'in_progress', child: Text('In progress')),
                          DropdownMenuItem(value: 'resolved', child: Text('Resolved')),
                          DropdownMenuItem(value: 'rejected', child: Text('Rejected')),
                        ],
                        onChanged: (value) => setState(() => _status = value ?? _status),
                        decoration: const InputDecoration(labelText: 'Status'),
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(
                        controller: _noteController,
                        label: 'Public update note',
                        maxLines: 4,
                      ),
                      const SizedBox(height: 16),
                      PrimaryAction(
                        label: 'Save update',
                        isBusy: _isSaving,
                        onPressed: () async {
                          final messenger = ScaffoldMessenger.of(context);
                          setState(() => _isSaving = true);
                          await ref.read(discoveryRepositoryProvider).updateReportStatus(
                                reportId: item.id,
                                status: _status,
                                resolutionNotes: _noteController.text.trim(),
                              );
                          ref.invalidate(reportDetailsProvider(widget.reportId));
                          ref.invalidate(myReportsProvider);
                          if (!mounted) return;
                          setState(() => _isSaving = false);
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Report updated.')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Unable to load this report.',
            body: 'Please try again in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(reportDetailsProvider(widget.reportId)),
            ),
          ),
        ),
      ),
    );
  }
}
