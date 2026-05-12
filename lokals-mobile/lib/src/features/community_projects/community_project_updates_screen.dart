import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';

class CommunityProjectUpdatesScreen extends ConsumerStatefulWidget {
  const CommunityProjectUpdatesScreen({
    super.key,
    required this.slug,
  });

  final String slug;

  @override
  ConsumerState<CommunityProjectUpdatesScreen> createState() => _CommunityProjectUpdatesScreenState();
}

class _CommunityProjectUpdatesScreenState extends ConsumerState<CommunityProjectUpdatesScreen> {
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  final _progressController = TextEditingController();
  final List<XFile> _attachments = [];
  String _status = 'active';
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final projectAsync = ref.watch(communityProjectDetailsProvider(widget.slug));

    return LokalsShell(
      title: 'Project updates',
      showBack: true,
      child: projectAsync.when(
        data: (project) {
          final currentUser = ref.watch(authControllerProvider).user;
          final canPost = currentUser?.id == (project.user?['id'] as int?) ||
              const {'town_manager', 'municipality_admin', 'super_admin', 'operator'}
                  .contains(currentUser?.currentRole ?? '');

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
            children: [
              SectionTitle(
                title: project.title,
                subtitle: 'Timeline updates, milestones, and support progress.',
                action: TextButton(
                  onPressed: () => context.pop(),
                  child: const Text('Back'),
                ),
              ),
              if (canPost) ...[
                const SizedBox(height: 16),
                LokalsCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Post an update', style: AppTextStyles.h3),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: _titleController, label: 'Update title'),
                      const SizedBox(height: 12),
                      LokalsTextField(
                        controller: _bodyController,
                        label: 'What changed?',
                        maxLines: 4,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        initialValue: _status,
                        items: const [
                          DropdownMenuItem(value: 'active', child: Text('Active')),
                          DropdownMenuItem(value: 'in_progress', child: Text('In progress')),
                          DropdownMenuItem(value: 'needs_support', child: Text('Needs support')),
                          DropdownMenuItem(value: 'fully_funded', child: Text('Fully funded')),
                          DropdownMenuItem(value: 'completed', child: Text('Completed')),
                        ],
                        decoration: const InputDecoration(labelText: 'Status after update'),
                        onChanged: (value) => setState(() => _status = value ?? 'active'),
                      ),
                      const SizedBox(height: 12),
                      LokalsTextField(
                        controller: _progressController,
                        label: 'Progress percent',
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          AppButton(
                            label: _attachments.isEmpty ? 'Add photos' : '${_attachments.length} media attached',
                            expanded: false,
                            compact: true,
                            variant: AppButtonVariant.secondary,
                            onPressed: () async {
                              final files = await ImagePicker().pickMultiImage(imageQuality: 82);
                              if (files.isEmpty) return;
                              setState(() => _attachments.addAll(files));
                            },
                          ),
                          AppButton(
                            label: 'Post update',
                            expanded: false,
                            compact: true,
                            isLoading: _isSubmitting,
                            onPressed: () async {
                              setState(() => _isSubmitting = true);
                              try {
                                await ref.read(discoveryRepositoryProvider).postCommunityProjectUpdate(
                                      projectId: project.id,
                                      title: _titleController.text.trim(),
                                      body: _bodyController.text.trim(),
                                      statusAfterUpdate: _status,
                                      progressPercent: int.tryParse(_progressController.text.trim()),
                                      attachments: _attachments,
                                    );
                                ref.invalidate(communityProjectDetailsProvider(widget.slug));
                                if (!mounted) return;
                                _titleController.clear();
                                _bodyController.clear();
                                _progressController.clear();
                                setState(() => _attachments.clear());
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Project update posted.')),
                                );
                              } finally {
                                if (mounted) {
                                  setState(() => _isSubmitting = false);
                                }
                              }
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),
              if (project.updates.isEmpty)
                const EmptyStateView(
                  title: 'No updates yet',
                  body: 'Once the organiser posts milestones, the timeline will appear here.',
                )
              else
                ...project.updates.map(
                  (update) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: LokalsCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(update.title, style: AppTextStyles.h3),
                          const SizedBox(height: 8),
                          Text(update.body, style: AppTextStyles.body),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if (update.statusAfterUpdate != null)
                                AppBadge(label: update.statusAfterUpdate!, tone: AppBadgeTone.info),
                              if (update.progressPercent != null)
                                AppBadge(label: '${update.progressPercent}%', tone: AppBadgeTone.brand),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(update.createdAt ?? '', style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: AppCard(
            child: AppButton(
              label: 'Retry loading updates',
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
