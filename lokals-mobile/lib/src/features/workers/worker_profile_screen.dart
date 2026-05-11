import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class WorkerProfileScreen extends ConsumerWidget {
  const WorkerProfileScreen({super.key, required this.workerId});

  final String workerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workers = ref.watch(workersProvider);
    final contactService = const ContactActionService();

    return LokalsShell(
      title: 'Worker profile',
      showBack: true,
      child: workers.when(
        data: (items) {
          final matches = items.where((item) => item.id.toString() == workerId);
          if (matches.isEmpty) {
            return const Center(
              child: EmptyStateView(
                title: 'Worker not found',
                body: 'This worker profile may no longer be available.',
              ),
            );
          }

          final worker = matches.first;
          final name = worker.name ?? worker.headline;
          final phone = worker.phone;
          final whatsapp = worker.whatsapp ?? worker.phone;
          final experience = worker.experienceYears != null ? '${worker.experienceYears}+ years' : 'Local experience';
          final rate = worker.rate != null ? 'N\$ ${worker.rate}' : 'Rate on request';

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            children: [
              AppCard(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 42,
                      backgroundColor: AppColors.purpleSoftAlt,
                      child: Text(
                        name.characters.first.toUpperCase(),
                        style: AppTextStyles.h2.copyWith(color: AppColors.primaryPurple),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      alignment: WrapAlignment.center,
                      children: [
                        AppBadge(label: worker.isAvailable ? 'Available now' : 'Busy', tone: worker.isAvailable ? AppBadgeTone.success : AppBadgeTone.warning),
                        const AppBadge(label: '4.8 rating', tone: AppBadgeTone.accent),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(name, style: AppTextStyles.h2, textAlign: TextAlign.center),
                    const SizedBox(height: 4),
                    Text(worker.headline, style: AppTextStyles.bodyMuted, textAlign: TextAlign.center),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(child: _InfoTile(icon: Icons.place_outlined, label: 'Location', value: worker.location ?? 'Local area')),
                        const SizedBox(width: 10),
                        Expanded(child: _InfoTile(icon: Icons.work_history_outlined, label: 'Experience', value: experience)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Skills', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: (worker.skills.isEmpty ? ['General help'] : worker.skills)
                          .map((skill) => AppBadge(label: skill, tone: AppBadgeTone.info))
                          .toList(),
                    ),
                    const SizedBox(height: 14),
                    Text('About', style: AppTextStyles.h3),
                    const SizedBox(height: 8),
                    Text(
                      '${worker.headline}. ${worker.name ?? 'This worker'} is available in ${worker.location ?? 'the local area'} and can discuss scope, timing, and rates directly.',
                      style: AppTextStyles.bodyMuted,
                    ),
                    const SizedBox(height: 14),
                    _DetailRow(label: 'Rate', value: rate),
                    _DetailRow(label: 'Completed jobs', value: 'Growing local track record'),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Invite to job',
                      variant: AppButtonVariant.secondary,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Invite flow will connect through posting or direct contact for now.')),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: 'Call',
                      onPressed: phone == null ? null : () => contactService.call(context, phone),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ContactActions(
                name: worker.name ?? worker.headline,
                phone: phone,
                whatsapp: whatsapp,
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading worker',
          message: 'Preparing skills, availability, and contact options...',
        ),
        error: (error, _) => const Center(
          child: EmptyStateView(
            title: 'Could not load worker',
            body: 'Please retry in a moment.',
          ),
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.softBackground,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.primaryPurple),
          const SizedBox(height: 10),
          Text(label, style: AppTextStyles.caption),
          const SizedBox(height: 4),
          Text(value, style: AppTextStyles.h4),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 110, child: Text(label, style: AppTextStyles.caption)),
          Expanded(child: Text(value, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.deepCharcoal))),
        ],
      ),
    );
  }
}
