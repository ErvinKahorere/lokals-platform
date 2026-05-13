import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class FeedScreen extends ConsumerStatefulWidget {
  const FeedScreen({super.key});

  @override
  ConsumerState<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends ConsumerState<FeedScreen> {
  String _selectedCategory = '';

  @override
  Widget build(BuildContext context) {
    final feedAsync = ref.watch(communityFeedProvider);

    return LokalsShell(
      title: 'Community feed',
      showBack: true,
      child: ListView(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.viewPaddingOf(context).bottom + 96),
        children: [
          const SectionTitle(
            eyebrow: 'Community feed',
            title: 'Approved local updates',
            subtitle: 'Town notices, events, jobs, marketplace highlights, and community updates in one moderated feed.',
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final item in const [
                ('', 'All'),
                ('announcements', 'Announcements'),
                ('events', 'Events'),
                ('marketplace', 'Marketplace'),
                ('jobs', 'Jobs'),
                ('community-projects', 'Projects'),
              ])
                ChoiceChip(
                  label: Text(item.$2),
                  selected: _selectedCategory == item.$1,
                  onSelected: (_) {
                    setState(() => _selectedCategory = item.$1);
                    ref.invalidate(communityFeedProvider);
                  },
                ),
            ],
          ),
          const SizedBox(height: 16),
          feedAsync.when(
            data: (items) {
              final filtered = _selectedCategory.isEmpty
                  ? items
                  : items.where((item) => ((item['category'] as Map<String, dynamic>?)?['slug']?.toString() ?? '') == _selectedCategory).toList();

              if (filtered.isEmpty) {
                return const EmptyStateView(
                  title: 'No feed updates yet',
                  body: 'Approved town updates, events, jobs, and community posts will appear here.',
                );
              }

              return Column(
                children: filtered.map((item) {
                  final category = Map<String, dynamic>.from((item['category'] as Map?) ?? const {});
                  final source = Map<String, dynamic>.from((item['source'] as Map?) ?? const {});

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: LokalsCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              if ((category['name']?.toString() ?? '').isNotEmpty)
                                AppBadge(label: category['name'].toString(), tone: AppBadgeTone.brand),
                              const Spacer(),
                              if ((item['is_featured'] as bool?) == true)
                                const AppBadge(label: 'Featured', tone: AppBadgeTone.success),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(item['title']?.toString() ?? 'Community update', style: AppTextStyles.h3),
                          if ((item['summary']?.toString() ?? '').isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(item['summary'].toString(), style: AppTextStyles.bodyMuted),
                          ],
                          const SizedBox(height: 10),
                          Text(
                            [
                              source['name']?.toString(),
                              item['area']?.toString(),
                              item['town']?.toString(),
                            ].whereType<String>().where((value) => value.isNotEmpty).join(' • '),
                            style: AppTextStyles.caption,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              );
            },
            loading: () => const LokalsLoadingScreen(
              title: 'Loading community feed',
              message: 'Bringing in approved local posts and town updates...',
            ),
            error: (error, _) => EmptyStateView(
              title: 'Feed unavailable',
              body: 'We could not load the community feed right now.',
              action: AppButton(
                label: 'Retry',
                onPressed: () => ref.invalidate(communityFeedProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
