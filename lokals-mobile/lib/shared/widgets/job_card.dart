import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../src/core/experience_helpers.dart';
import '../../src/core/models.dart';
import 'app_badge.dart';
import 'app_button.dart';
import 'app_card.dart';

class JobCard extends StatelessWidget {
  const JobCard({
    super.key,
    required this.job,
    this.onApply,
    this.onView,
  });

  final JobModel job;
  final VoidCallback? onApply;
  final VoidCallback? onView;

  @override
  Widget build(BuildContext context) {
    final budgetLabel = job.compensation != null ? getDisplayPrice(job.compensation) : 'Budget TBC';
    final locationLabel = getDisplayDistance(job.distanceKm, job.location);
    final statusLabel = job.status == 'open' ? 'New' : job.status.replaceAll('_', ' ');

    return AppCard(
      variant: AppCardVariant.job,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: AppColors.purpleSoftAlt,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.work_outline_rounded, color: AppColors.primaryPurple),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(job.title, style: AppTextStyles.h3),
                    const SizedBox(height: 6),
                    Text(job.description, style: AppTextStyles.bodyMuted, maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              AppBadge(label: statusLabel, tone: job.status == 'open' ? AppBadgeTone.info : AppBadgeTone.warning),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _JobMeta(label: budgetLabel),
              _JobMeta(label: locationLabel),
              const _JobMeta(label: 'Posted recently'),
            ],
          ),
          if (job.skills.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(job.skills.take(3).join(', '), style: AppTextStyles.caption),
          ],
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'View',
                  variant: AppButtonVariant.secondary,
                  onPressed: onView ?? () => context.push('/jobs/${job.id}'),
                ),
              ),
              if (onApply != null) ...[
                const SizedBox(width: 10),
                Expanded(
                  child: AppButton(
                    label: 'Apply',
                    onPressed: onApply,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _JobMeta extends StatelessWidget {
  const _JobMeta({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(label, style: AppTextStyles.caption),
    );
  }
}
