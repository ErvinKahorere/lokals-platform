import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/experience_helpers.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../auth/auth_navigation.dart';
import '../discovery/discovery_repository.dart';
import '../../../shared/widgets/job_card.dart';

class JobDetailsScreen extends ConsumerStatefulWidget {
  const JobDetailsScreen({super.key, required this.jobId});

  final String jobId;

  @override
  ConsumerState<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends ConsumerState<JobDetailsScreen> {
  final _messageController = TextEditingController();
  bool _isApplying = false;
  String? _feedback;
  String? _error;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _apply(int jobId) async {
    final auth = ref.read(authControllerProvider);
    if (auth.token == null) {
      if (!mounted) return;
      promptSignIn(
        context,
        next: GoRouterState.of(context).uri.toString(),
      );
      return;
    }

    setState(() {
      _isApplying = true;
      _feedback = null;
      _error = null;
    });

    try {
      await ref.read(discoveryRepositoryProvider).applyToJob(
            jobId,
            message: _messageController.text.trim().isEmpty ? null : _messageController.text.trim(),
          );
      if (!mounted) return;
      setState(() {
        _feedback = 'Application sent. The poster can contact you shortly.';
        _messageController.clear();
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() => _isApplying = false);
      }
    }
  }

  Future<void> _openConversation({
    required int participantId,
    required String subject,
    required String contextKey,
  }) async {
    final auth = ref.read(authControllerProvider);
    if (auth.token == null) {
      if (!mounted) return;
      promptSignIn(
        context,
        next: GoRouterState.of(context).uri.toString(),
      );
      return;
    }

    final scaffold = ScaffoldMessenger.of(context);

    try {
      final payload = await ref.read(discoveryRepositoryProvider).createConversation(
            participantIds: [participantId],
            context: contextKey,
            subject: subject,
          );
      if (!mounted) return;
      final data = Map<String, dynamic>.from((payload['data'] as Map?) ?? payload);
      final conversationId = data['id']?.toString();
      if (conversationId == null || conversationId.isEmpty) {
        scaffold.showSnackBar(
          const SnackBar(content: Text('We could not open this conversation right now.')),
        );
        return;
      }
      context.push('/conversations/$conversationId');
    } catch (_) {
      if (!mounted) return;
      scaffold.showSnackBar(
        const SnackBar(content: Text('We could not open this conversation right now.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final jobs = ref.watch(jobsProvider);
    final contactService = const ContactActionService();

    return LokalsShell(
      title: 'Job details',
      showBack: true,
      floatingActionButton: Builder(
        builder: (context) {
          return Padding(
            padding: const EdgeInsets.only(left: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Expanded(
                  child: AppButton(
                    label: 'Apply',
                    onPressed: jobs.maybeWhen(
                      data: (items) {
                        final match = items.where((item) => item.id.toString() == widget.jobId);
                        if (match.isEmpty) return null;
                        return _isApplying ? null : () => _apply(match.first.id);
                      },
                      orElse: () => null,
                    ),
                    isLoading: _isApplying,
                  ),
                ),
              ],
            ),
          );
        },
      ),
      child: jobs.when(
        data: (items) {
          final match = items.where((item) => item.id.toString() == widget.jobId);
          if (match.isEmpty) {
            return const Center(
              child: EmptyStateView(
                title: 'Job not found',
                body: 'This job may have closed or moved out of the current feed.',
              ),
            );
          }
          final job = match.first;
          final budget = job.compensation != null ? getDisplayPrice(job.compensation) : 'Negotiable';
          final location = getDisplayDistance(job.distanceKm, job.location);
          final relatedJobs = items
              .where((item) => item.id != job.id && (item.skills.any((skill) => job.skills.contains(skill)) || item.employmentType == job.employmentType))
              .take(3)
              .toList();

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            children: [
              AppCard(
                variant: AppCardVariant.job,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        AppBadge(label: job.status == 'open' ? 'Open now' : job.status.replaceAll('_', ' '), tone: job.status == 'open' ? AppBadgeTone.success : AppBadgeTone.warning),
                        AppBadge(label: job.employmentType.replaceAll('_', ' '), tone: AppBadgeTone.info),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(job.title, style: AppTextStyles.h2),
                    const SizedBox(height: 8),
                    Text(job.description, style: AppTextStyles.bodyMuted),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        _DetailPill(icon: Icons.payments_outlined, label: budget),
                        _DetailPill(icon: Icons.place_outlined, label: location),
                        _DetailPill(icon: Icons.schedule_outlined, label: 'Posted recently'),
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
                    Text('Job details', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    _InfoRow(label: 'Location', value: job.location ?? 'Local area'),
                    _InfoRow(label: 'Budget', value: budget),
                    _InfoRow(label: 'Applications', value: '${job.applicationsCount} so far'),
                    if (job.skills.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Text('Skills', style: AppTextStyles.h4),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: job.skills
                            .map((skill) => AppBadge(label: skill, tone: AppBadgeTone.info))
                            .toList(),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Posted by', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: AppColors.purpleSoftAlt,
                          child: Text(
                            (job.posterName ?? job.organizationName ?? 'L').characters.first.toUpperCase(),
                            style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(job.posterName ?? job.organizationName ?? 'Local poster', style: AppTextStyles.h4),
                              const SizedBox(height: 4),
                              Text(job.organizationName ?? 'Local opportunity', style: AppTextStyles.caption),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: AppButton(
                            label: 'Message',
                            variant: AppButtonVariant.secondary,
                            onPressed: job.posterUserId == null
                                ? null
                                : () => _openConversation(
                                      participantId: job.posterUserId!,
                                      subject: job.title,
                                      contextKey: 'job',
                                    ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: AppButton(
                            label: 'Call',
                            onPressed: job.posterPhone == null
                                ? null
                                : () => contactService.call(context, job.posterPhone!),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: AppButton(
                            label: 'WhatsApp',
                            variant: AppButtonVariant.secondary,
                            onPressed: job.posterPhone == null
                                ? null
                                : () => contactService.openWhatsApp(
                                      context,
                                      phone: job.posterPhone!,
                                      name: job.posterName ?? job.organizationName ?? 'Local poster',
                                      message: 'Hi, I am interested in "${job.title}" on LOKALS.',
                                    ),
                          ),
                        ),
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
                    Text('Apply quickly', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    LokalsTextField(
                      controller: _messageController,
                      label: 'Optional message',
                      hint: 'Share a short note about your experience or availability.',
                      maxLines: 4,
                    ),
                    if (_feedback != null) ...[
                      const SizedBox(height: 12),
                      Text(_feedback!, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.primaryGreen)),
                    ],
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.danger)),
                    ],
                  ],
                ),
              ),
              if (relatedJobs.isNotEmpty) ...[
                const SizedBox(height: 16),
                const SectionTitle(
                  title: 'Related jobs',
                  subtitle: 'Similar nearby work you may also want to check.',
                ),
                const SizedBox(height: 12),
                ...relatedJobs.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: JobCard(job: item),
                  ),
                ),
              ],
              const SizedBox(height: 96),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading job details',
          message: 'Pulling in role details and apply actions...',
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Could not load job',
            body: 'Please retry in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(jobsProvider),
            ),
          ),
        ),
      ),
    );
  }
}

class _DetailPill extends StatelessWidget {
  const _DetailPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
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

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: AppTextStyles.caption)),
          Expanded(child: Text(value, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.deepCharcoal))),
        ],
      ),
    );
  }
}
