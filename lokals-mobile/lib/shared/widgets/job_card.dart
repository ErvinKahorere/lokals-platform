import 'package:flutter/material.dart';

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
  });

  final JobModel job;
  final VoidCallback? onApply;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      variant: AppCardVariant.job,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFEDE9FE),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.work_outline_rounded,
                  color: AppColors.primaryPurple,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(job.title, style: AppTextStyles.h3),
                    const SizedBox(height: 8),
                    Text(
                      job.description,
                      style: AppTextStyles.bodyMuted,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              AppBadge(label: job.employmentType, tone: AppBadgeTone.info),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _JobMeta(
                label: job.compensation != null
                    ? getDisplayPrice(job.compensation)
                    : 'Budget TBC',
              ),
              _JobMeta(label: getDisplayDistance(job.distanceKm, job.location)),
              const _JobMeta(label: 'Posted today'),
            ],
          ),
          const SizedBox(height: 14),
          if (onApply != null) AppButton(label: 'Apply', onPressed: onApply),
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
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(label, style: AppTextStyles.caption),
    );
  }
}
