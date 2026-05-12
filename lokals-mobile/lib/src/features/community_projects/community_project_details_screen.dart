import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../../services/contact_action_service.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'community_project_card.dart';

class CommunityProjectDetailsScreen extends ConsumerStatefulWidget {
  const CommunityProjectDetailsScreen({
    super.key,
    required this.slug,
  });

  final String slug;

  @override
  ConsumerState<CommunityProjectDetailsScreen> createState() => _CommunityProjectDetailsScreenState();
}

class _CommunityProjectDetailsScreenState extends ConsumerState<CommunityProjectDetailsScreen> {
  bool _isWorking = false;
  final _contactActions = const ContactActionService();

  Future<void> _toggleFollow(CommunityProjectModel project) async {
    setState(() => _isWorking = true);
    try {
      if (project.isFollowing) {
        await ref.read(discoveryRepositoryProvider).unfollowCommunityProject(project.id);
      } else {
        await ref.read(discoveryRepositoryProvider).followCommunityProject(project.id);
      }
      ref.invalidate(communityProjectDetailsProvider(widget.slug));
      ref.invalidate(featuredCommunityProjectsProvider);
      ref.invalidate(communityProjectsProvider(const {'featured': false}));
    } finally {
      if (mounted) {
        setState(() => _isWorking = false);
      }
    }
  }

  Future<void> _showPledgeSheet(CommunityProjectModel project, String pledgeType) async {
    final descriptionController = TextEditingController();
    final amountController = TextEditingController();
    final quantityController = TextEditingController();
    final contactPhoneController = TextEditingController(text: ref.read(authControllerProvider).user?.phone ?? '');
    final contactEmailController = TextEditingController(text: ref.read(authControllerProvider).user?.email ?? '');
    var isSubmitting = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Offer ${_pledgeLabel(pledgeType)}', style: AppTextStyles.h2),
                      const SizedBox(height: 8),
                      Text(
                        'Tell the organiser what you can contribute and how they can reach you.',
                        style: AppTextStyles.bodyMuted,
                      ),
                      const SizedBox(height: 16),
                      LokalsTextField(
                        controller: descriptionController,
                        label: 'What are you offering?',
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      if (pledgeType == 'money')
                        LokalsTextField(
                          controller: amountController,
                          label: 'Amount (N\$)',
                          keyboardType: TextInputType.number,
                        ),
                      if (pledgeType == 'item') ...[
                        LokalsTextField(
                          controller: quantityController,
                          label: 'Quantity',
                          keyboardType: TextInputType.number,
                        ),
                        const SizedBox(height: 12),
                      ],
                      if (pledgeType == 'money') const SizedBox(height: 12),
                      LokalsTextField(
                        controller: contactPhoneController,
                        label: 'Contact phone',
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(
                        controller: contactEmailController,
                        label: 'Contact email',
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 16),
                      AppButton(
                        label: 'Send pledge',
                        isLoading: isSubmitting,
                        onPressed: () async {
                          setSheetState(() => isSubmitting = true);
                          try {
                            await ref.read(discoveryRepositoryProvider).createCommunityProjectPledge(
                                  projectId: project.id,
                                  pledgeType: pledgeType,
                                  description: descriptionController.text.trim(),
                                  amount: amountController.text.trim(),
                                  quantity: int.tryParse(quantityController.text.trim()),
                                  contactPhone: contactPhoneController.text.trim(),
                                  contactEmail: contactEmailController.text.trim(),
                                );
                            ref.invalidate(communityProjectDetailsProvider(widget.slug));
                            if (!mounted) return;
                            Navigator.of(context).pop();
                            ScaffoldMessenger.of(this.context).showSnackBar(
                              const SnackBar(content: Text('Support pledge sent to the organiser.')),
                            );
                          } finally {
                            if (mounted) {
                              setSheetState(() => isSubmitting = false);
                            }
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final projectAsync = ref.watch(communityProjectDetailsProvider(widget.slug));
    final currentUser = ref.watch(authControllerProvider).user;

    return LokalsShell(
      title: 'Project details',
      showBack: true,
      child: projectAsync.when(
        data: (project) {
          final isOwner = currentUser?.id == (project.user?['id'] as int?);
          final canReview = const {'town_manager', 'municipality_admin', 'super_admin', 'operator'}
              .contains(currentUser?.currentRole ?? '');

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
            children: [
              CommunityProjectCard(
                project: project,
                action: Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: project.isFollowing ? 'Following' : 'Follow',
                        compact: true,
                        variant: AppButtonVariant.secondary,
                        isLoading: _isWorking,
                        onPressed: () => _toggleFollow(project),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: AppButton(
                        label: 'Updates',
                        compact: true,
                        onPressed: () => context.push('/get-involved/${project.slug}/updates'),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              LokalsCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Support needed', style: AppTextStyles.h3),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: project.supportNeeded
                          .map((item) => AppBadge(label: item, tone: AppBadgeTone.neutral))
                          .toList(),
                    ),
                    const SizedBox(height: 14),
                    Text(project.description, style: AppTextStyles.body),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        if (project.targetAmount != null)
                          _SummaryStat(label: 'Funding goal', value: 'N\$ ${project.targetAmount}'),
                        if (project.currentAmount != null)
                          _SummaryStat(label: 'Raised', value: 'N\$ ${project.currentAmount}'),
                        if (project.targetVolunteers != null)
                          _SummaryStat(label: 'Volunteer goal', value: '${project.targetVolunteers}'),
                        if (project.currentVolunteers != null)
                          _SummaryStat(label: 'Volunteers', value: '${project.currentVolunteers}'),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              LokalsCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Offer support', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        AppButton(
                          label: 'Donate',
                          expanded: false,
                          compact: true,
                          onPressed: () => _showPledgeSheet(project, 'money'),
                        ),
                        AppButton(
                          label: 'Volunteer',
                          expanded: false,
                          compact: true,
                          variant: AppButtonVariant.secondary,
                          onPressed: () => _showPledgeSheet(project, 'volunteer'),
                        ),
                        AppButton(
                          label: 'Offer service',
                          expanded: false,
                          compact: true,
                          variant: AppButtonVariant.secondary,
                          onPressed: () => _showPledgeSheet(project, 'service'),
                        ),
                        AppButton(
                          label: 'Contact organiser',
                          expanded: false,
                          compact: true,
                          variant: AppButtonVariant.secondary,
                          onPressed: () async {
                            if (project.contactWhatsapp != null && project.contactWhatsapp!.isNotEmpty) {
                              await _contactActions.openWhatsApp(
                                context,
                                phone: project.contactWhatsapp!,
                                name: project.contactName,
                                message: 'Hello, I want to support ${project.title} on LOKALS.',
                              );
                              return;
                            }

                            if (project.contactPhone != null && project.contactPhone!.isNotEmpty) {
                              await _contactActions.call(context, project.contactPhone!);
                            }
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              LokalsCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Organiser and verification', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    CommunityProjectCompactTile(
                      project: project,
                      trailing: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          if (project.contactPhone != null)
                            Text(project.contactPhone!, style: AppTextStyles.bodyMuted),
                          if (project.contactEmail != null)
                            Text(project.contactEmail!, style: AppTextStyles.bodyMuted),
                        ],
                      ),
                    ),
                    if (project.verificationNotes != null && project.verificationNotes!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(project.verificationNotes!, style: AppTextStyles.bodyMuted),
                    ],
                    if (project.rejectionReason != null && project.rejectionReason!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        project.rejectionReason!,
                        style: AppTextStyles.body.copyWith(color: AppColors.danger),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SectionTitle(
                title: 'Progress updates',
                subtitle: 'Latest milestones from the organiser and Town Manager review flow.',
                action: TextButton(
                  onPressed: () => context.push('/get-involved/${project.slug}/updates'),
                  child: const Text('Open'),
                ),
              ),
              const SizedBox(height: 10),
              if (project.updates.isEmpty)
                const EmptyStateView(
                  title: 'No updates yet',
                  body: 'The organiser has not posted a public progress update yet.',
                )
              else
                Column(
                  children: project.updates.take(3).map((update) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: LokalsListTile(
                        title: Text(update.title),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(update.body),
                            const SizedBox(height: 6),
                            Text(update.createdAt ?? '', style: AppTextStyles.caption),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              if (isOwner || canReview) ...[
                const SizedBox(height: 16),
                AppButton(
                  label: 'Post progress update',
                  expanded: false,
                  compact: true,
                  onPressed: () => context.push('/get-involved/${project.slug}/updates'),
                ),
              ],
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: AppCard(
            child: AppButton(
              label: 'Retry loading project',
              expanded: false,
              compact: true,
              onPressed: () => ref.invalidate(communityProjectDetailsProvider(widget.slug)),
            ),
          ),
        ),
      ),
    );
  }
}

class _SummaryStat extends StatelessWidget {
  const _SummaryStat({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 118),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.softBackground,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption),
          const SizedBox(height: 4),
          Text(value, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

String _pledgeLabel(String type) {
  switch (type) {
    case 'money':
      return 'a donation';
    case 'volunteer':
      return 'your time';
    case 'service':
      return 'a skill or service';
    case 'item':
      return 'an item';
    default:
      return 'support';
  }
}
