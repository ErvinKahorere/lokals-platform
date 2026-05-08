import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../src/core/experience_helpers.dart';
import '../../src/core/models.dart';
import 'app_badge.dart';
import 'app_button.dart';
import 'app_card.dart';

class WorkerCard extends StatelessWidget {
  const WorkerCard({
    super.key,
    required this.worker,
    this.onCall,
  });

  final WorkerModel worker;
  final VoidCallback? onCall;

  @override
  Widget build(BuildContext context) {
    final name = worker.name ?? worker.headline;
    final location = getDisplayDistance(worker.distanceKm, worker.location);
    final skillLabel = worker.skills.isNotEmpty ? worker.skills.first : 'General help';
    final rateLabel = worker.rate != null ? 'N\$ ${worker.rate}' : 'Rate on request';

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.purpleSoftAlt,
                child: Text(
                  name.characters.first.toUpperCase(),
                  style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: AppTextStyles.h4),
                    const SizedBox(height: 4),
                    Text(worker.headline, style: AppTextStyles.caption, maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              AppBadge(
                label: worker.isAvailable ? 'Available' : 'Busy',
                tone: worker.isAvailable ? AppBadgeTone.success : AppBadgeTone.warning,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _MetaChip(icon: Icons.star_rounded, label: '4.8'),
              _MetaChip(icon: Icons.work_outline_rounded, label: skillLabel),
              _MetaChip(icon: Icons.place_outlined, label: location),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(rateLabel, style: AppTextStyles.h4),
                    const SizedBox(height: 2),
                    Text(
                      worker.experienceYears != null ? '${worker.experienceYears} years experience' : 'Local worker profile',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
              ),
              if (onCall != null)
                IconButton(
                  onPressed: onCall,
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.purpleSoftAlt,
                    foregroundColor: AppColors.primaryPurple,
                  ),
                  icon: const Icon(Icons.call_outlined),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'View Profile',
                  variant: AppButtonVariant.secondary,
                  onPressed: () => context.push('/workers/${worker.id}'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppButton(
                  label: 'Hire',
                  onPressed: () => context.push('/workers/${worker.id}'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});

  final IconData icon;
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
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primaryPurple),
          const SizedBox(width: 6),
          Text(label, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
