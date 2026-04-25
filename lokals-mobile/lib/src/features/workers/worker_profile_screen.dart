import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class WorkerProfileScreen extends ConsumerWidget {
  const WorkerProfileScreen({super.key, required this.workerId});

  final String workerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workers = ref.watch(workersProvider);

    return LokalsShell(
      title: 'Worker profile',
      showBack: true,
      child: workers.when(
        data: (items) {
          final worker = items.firstWhere(
            (item) => item.id.toString() == workerId,
            orElse: () => items.first,
          );

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 38,
                      child: Text(
                        (worker.name ?? worker.headline).characters.first.toUpperCase(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(worker.name ?? 'Local worker', style: AppTextStyles.h2),
                    const SizedBox(height: 4),
                    Text(worker.headline, style: AppTextStyles.bodyMuted),
                    const SizedBox(height: 10),
                    const Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        AppBadge(label: '4.8 rating', tone: AppBadgeTone.accent),
                        AppBadge(label: 'Verified', tone: AppBadgeTone.success),
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
                    Text('About', style: AppTextStyles.h3),
                    const SizedBox(height: 10),
                    Text(
                      '${worker.headline} available in ${worker.location ?? 'your area'}. Experience details can be expanded later as the worker profile grows.',
                      style: AppTextStyles.bodyMuted,
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: worker.skills
                          .map((skill) => AppBadge(label: skill, tone: AppBadgeTone.info))
                          .toList(),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Location: ${worker.location ?? 'Local area'}',
                      style: AppTextStyles.bodyMuted,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Rate: ${worker.rate != null ? 'N\$ ${worker.rate}' : 'On request'}',
                      style: AppTextStyles.bodyMuted,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Message',
                      variant: AppButtonVariant.secondary,
                      onPressed: () {},
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppButton(
                      label: 'Call',
                      onPressed: () {},
                    ),
                  ),
                ],
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Failed to load worker: $error')),
      ),
    );
  }
}
