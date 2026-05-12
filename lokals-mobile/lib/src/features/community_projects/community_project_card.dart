import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../../shared/widgets/app_network_image.dart';

AppBadgeTone communityProjectStatusTone(String status) {
  switch (status) {
    case 'completed':
    case 'fully_funded':
    case 'approved':
      return AppBadgeTone.success;
    case 'rejected':
      return AppBadgeTone.danger;
    case 'pending':
    case 'submitted':
    case 'changes_requested':
      return AppBadgeTone.warning;
    case 'active':
    case 'in_progress':
      return AppBadgeTone.info;
    case 'archived':
      return AppBadgeTone.neutral;
    default:
      return AppBadgeTone.brand;
  }
}

String formatCommunityDate(String? value) {
  if (value == null || value.isEmpty) {
    return 'Flexible timing';
  }

  final parsed = DateTime.tryParse(value);
  if (parsed == null) {
    return value;
  }

  return DateFormat('EEE, d MMM').format(parsed.toLocal());
}

class CommunityProjectCard extends StatelessWidget {
  const CommunityProjectCard({
    super.key,
    required this.project,
    this.onTap,
    this.action,
  });

  final CommunityProjectModel project;
  final VoidCallback? onTap;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final heroImage = project.attachments
        .where((item) => item.fileType == 'image')
        .cast<CommunityProjectAttachmentModel?>()
        .firstWhere((item) => item != null, orElse: () => null);

    return LokalsSurfaceTile(
      onTap: onTap,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppNetworkImage(
            imageUrl: heroImage?.fileUrl,
            fallbackIcon: Icons.volunteer_activism_outlined,
            height: 168,
            width: double.infinity,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
            backgroundColor: AppColors.purpleSoft,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (project.category != null)
                      AppBadge(
                        label: project.category!.name,
                        tone: AppBadgeTone.brand,
                      ),
                    AppBadge(
                      label: _labelize(project.status),
                      tone: communityProjectStatusTone(project.status),
                    ),
                    if (project.isVerified)
                      const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
                    if (project.isFeatured)
                      const AppBadge(label: 'Featured', tone: AppBadgeTone.accent),
                  ],
                ),
                const SizedBox(height: 12),
                Text(project.title, style: AppTextStyles.h3),
                const SizedBox(height: 8),
                Text(project.summary, style: AppTextStyles.bodyMuted),
                const SizedBox(height: 14),
                Row(
                  children: [
                    const Icon(Icons.place_outlined, size: 18, color: AppColors.mutedText),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        [project.area, project.town].whereType<String>().where((item) => item.isNotEmpty).join(', '),
                        style: AppTextStyles.bodyMuted,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${project.progressPercent}%',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.primaryPurple,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: (project.progressPercent.clamp(0, 100)) / 100,
                    minHeight: 8,
                    backgroundColor: AppColors.border,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ...project.supportNeeded.take(3).map(
                      (item) => AppBadge(label: item, tone: AppBadgeTone.neutral),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _MetaPill(
                        icon: Icons.event_outlined,
                        label: formatCommunityDate(project.startsAt),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _MetaPill(
                        icon: Icons.people_outline_rounded,
                        label: '${project.followersCount} following',
                      ),
                    ),
                  ],
                ),
                if (action != null) ...[
                  const SizedBox(height: 14),
                  action!,
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class CommunityProjectCompactTile extends StatelessWidget {
  const CommunityProjectCompactTile({
    super.key,
    required this.project,
    this.onTap,
    this.trailing,
  });

  final CommunityProjectModel project;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return LokalsListTile(
      onTap: onTap,
      leading: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: AppColors.purpleSoft,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.volunteer_activism_outlined, color: AppColors.primaryPurple),
      ),
      title: Text(project.title, maxLines: 1, overflow: TextOverflow.ellipsis),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            [project.area, project.town].whereType<String>().where((item) => item.isNotEmpty).join(', '),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              AppBadge(label: _labelize(project.status), tone: communityProjectStatusTone(project.status)),
              if (project.isVerified) const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
            ],
          ),
        ],
      ),
      trailing: trailing,
    );
  }
}

class _MetaPill extends StatelessWidget {
  const _MetaPill({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.softBackground,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primaryPurple),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.caption.copyWith(
                color: AppColors.deepCharcoal,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _labelize(String value) {
  return value
      .split('_')
      .map((part) => part.isEmpty ? part : '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}
