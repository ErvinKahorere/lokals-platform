import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../services/services_repository.dart';

class NewsDetailsScreen extends ConsumerStatefulWidget {
  const NewsDetailsScreen({super.key, required this.newsId});

  final String newsId;

  @override
  ConsumerState<NewsDetailsScreen> createState() => _NewsDetailsScreenState();
}

class _NewsDetailsScreenState extends ConsumerState<NewsDetailsScreen> {
  bool _followBusy = false;

  String _publishedLabel(String? value) {
    if (value == null || value.isEmpty) return 'Latest update';
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return 'Latest update';
    return DateFormat('EEE, d MMM • HH:mm').format(parsed.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    final details = ref.watch(newsDetailsProvider(widget.newsId));
    final followedOrganizationIds = ref.watch(followedOrganizationIdsProvider).asData?.value ?? <int>{};
    final followedProviderIds = ref.watch(followedProviderIdsProvider).asData?.value ?? <int>{};

    return LokalsShell(
      title: 'News Details',
      showBack: true,
      child: details.when(
        data: (payload) {
          final item = payload['data'] as NewsItemModel;
          final related = payload['related'] as List<NewsItemModel>;
          final sourceEntity = item.sourceEntity;
          final isFollowing = sourceEntity == null
              ? false
              : sourceEntity.type == 'organization'
                  ? followedOrganizationIds.contains(sourceEntity.id)
                  : followedProviderIds.contains(sourceEntity.id);

          Future<void> toggleFollow() async {
            if (sourceEntity == null) {
              return;
            }
            final messenger = ScaffoldMessenger.of(context);
            setState(() => _followBusy = true);
            try {
              if (sourceEntity.type == 'organization') {
                if (isFollowing) {
                  await ref.read(discoveryRepositoryProvider).unfollowOrganization(sourceEntity.id);
                } else {
                  await ref.read(discoveryRepositoryProvider).followOrganization(sourceEntity.id);
                }
                ref.invalidate(followedOrganizationIdsProvider);
              } else {
                if (isFollowing) {
                  await ref.read(servicesRepositoryProvider).unfollowProvider(sourceEntity.id);
                } else {
                  await ref.read(servicesRepositoryProvider).followProvider(sourceEntity.id);
                }
                ref.invalidate(followedProviderIdsProvider);
              }
              if (!mounted) return;
              messenger.showSnackBar(
                SnackBar(content: Text(isFollowing ? 'Unfollowed' : 'Following')),
              );
            } finally {
              if (mounted) {
                setState(() => _followBusy = false);
              }
            }
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  AppBadge(label: item.category.replaceAll('_', ' '), tone: AppBadgeTone.brand),
                  AppBadge(
                    label: [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', ').isEmpty
                        ? 'Okahandja'
                        : [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', '),
                    tone: AppBadgeTone.neutral,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(item.title, style: AppTextStyles.h1),
              const SizedBox(height: 16),
              Container(
                height: 220,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: AppColors.neutralSoft,
                ),
                child: item.imageUrl == null
                    ? const Center(child: Icon(Icons.newspaper_rounded, size: 48, color: AppColors.primaryPurple))
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Image.network(item.imageUrl!, fit: BoxFit.cover, width: double.infinity),
                      ),
              ),
              const SizedBox(height: 16),
              LokalsCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Original source', style: AppTextStyles.h4),
                    const SizedBox(height: 8),
                    Text(item.sourceName, style: AppTextStyles.h4.copyWith(fontSize: 16)),
                    const SizedBox(height: 4),
                    Text(item.sourceDomain ?? item.sourceUrl, style: AppTextStyles.bodyMuted),
                    const SizedBox(height: 4),
                    Text(_publishedLabel(item.publishedAt), style: AppTextStyles.caption),
                    const SizedBox(height: 12),
                    Text(
                      item.complianceNotice ?? 'Content is provided by external sources. LOKALS does not own this content.',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text('Snippet', style: AppTextStyles.h4),
              const SizedBox(height: 8),
              Text(item.summary, style: AppTextStyles.body.copyWith(height: 1.6)),
              const SizedBox(height: 16),
              if (sourceEntity != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: AppButton(
                    label: isFollowing ? 'Following source' : 'Follow source',
                    variant: isFollowing ? AppButtonVariant.primary : AppButtonVariant.secondary,
                    onPressed: _followBusy ? null : toggleFollow,
                  ),
                ),
              AppButton(
                label: 'Read full story on ${item.sourceName}',
                onPressed: () => context.push(
                  '/article?url=${Uri.encodeComponent(item.externalUrl)}&source=${Uri.encodeComponent(item.sourceName)}&title=${Uri.encodeComponent(item.title)}',
                ),
              ),
              const SizedBox(height: 12),
              AppButton(
                label: 'Open original article',
                variant: AppButtonVariant.secondary,
                onPressed: () => context.push(
                  '/article?url=${Uri.encodeComponent(item.externalUrl)}&source=${Uri.encodeComponent(item.sourceName)}&title=${Uri.encodeComponent(item.title)}',
                ),
              ),
              const SizedBox(height: 24),
              const SectionTitle(
                title: 'Related stories',
                subtitle: 'More updates nearby and from similar topics.',
              ),
              const SizedBox(height: 12),
              if (related.isEmpty)
                const EmptyStateView(title: 'No related stories yet', body: 'We will surface nearby and similar updates here.')
              else
                ...related.map((story) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(20),
                        onTap: () => context.pushReplacement('/news/${story.id}'),
                        child: LokalsCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(story.sourceName, style: AppTextStyles.eyebrow.copyWith(color: AppColors.primaryPurple)),
                              const SizedBox(height: 8),
                              Text(story.title, style: AppTextStyles.h4),
                              const SizedBox(height: 8),
                              Text(story.summary, style: AppTextStyles.bodyMuted, maxLines: 3, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                      ),
                    )),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading news story',
          message: 'Fetching the latest local update...',
        ),
        error: (error, _) => const Center(
          child: EmptyStateView(
            title: 'News details unavailable',
            body: 'We could not load this story right now.',
          ),
        ),
      ),
    );
  }
}
