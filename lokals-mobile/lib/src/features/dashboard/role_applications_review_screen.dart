import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_text_styles.dart';
import '../discovery/discovery_repository.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';

class RoleApplicationsReviewScreen extends ConsumerWidget {
  const RoleApplicationsReviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final applications = ref.watch(adminRoleApplicationsProvider);

    return LokalsShell(
      title: 'Pending Approvals',
      child: applications.when(
        data: (items) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          children: [
            const SectionTitle(
              title: 'Role approvals queue',
              subtitle: 'Review driver, courier, provider, business, and organisation applications in one place.',
            ),
            const SizedBox(height: 16),
            if (items.isEmpty)
              const LokalsCard(child: Padding(padding: EdgeInsets.all(18), child: Text('No role applications are waiting right now.')))
            else
              ...items.map((application) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: LokalsCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${application.fullName} - ${application.requestedRole.replaceAll('_', ' ')}',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                          ),
                          AppBadge(label: application.status.replaceAll('_', ' '), tone: AppBadgeTone.neutral),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('${application.phone} | ${application.townName ?? 'Okahandja'}', style: AppTextStyles.bodyMuted),
                      if ((application.address ?? '').isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(application.address!, style: AppTextStyles.bodyMuted),
                      ],
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              label: 'Approve',
                              onPressed: () async {
                                await ref.read(discoveryRepositoryProvider).reviewRoleApplication(id: application.id, action: 'approve');
                                ref.invalidate(adminRoleApplicationsProvider);
                              },
                              compact: true,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: AppButton(
                              label: 'Request changes',
                              variant: AppButtonVariant.secondary,
                              onPressed: () async {
                                await ref.read(discoveryRepositoryProvider).reviewRoleApplication(
                                  id: application.id,
                                  action: 'request-changes',
                                  reason: 'Please update the missing supporting information.',
                                );
                                ref.invalidate(adminRoleApplicationsProvider);
                              },
                              compact: true,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => const Center(child: Text('Approval queue unavailable')),
      ),
    );
  }
}
