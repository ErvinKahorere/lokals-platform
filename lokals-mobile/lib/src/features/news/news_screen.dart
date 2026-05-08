import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'news_card.dart';
import 'news_category_chips.dart';

class NewsScreen extends ConsumerStatefulWidget {
  const NewsScreen({super.key});

  @override
  ConsumerState<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends ConsumerState<NewsScreen> {
  final _searchController = TextEditingController();
  String _category = 'all';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final localParams = {
      if (_category != 'all') 'category': _category,
      if (_searchController.text.trim().isNotEmpty) 'search': _searchController.text.trim(),
      if ((user?.defaultTown ?? '').isNotEmpty) 'town': user!.defaultTown!,
      if ((user?.defaultArea ?? '').isNotEmpty) 'area': user!.defaultArea!,
    };
    final localNews = ref.watch(newsProvider(localParams));
    final trendingNews = ref.watch(newsTrendingProvider);
    final feedNews = ref.watch(newsFeedProvider);
    final notifications = ref.watch(notificationsProvider).asData?.value ?? const [];
    final unreadCount = notifications.where((item) => item.readAt == null).length;

    return LokalsShell(
      title: 'News',
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(newsProvider(localParams));
          ref.invalidate(newsTrendingProvider);
          ref.invalidate(newsFeedProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Row(
              children: [
                const Expanded(
                  child: SectionTitle(
                    eyebrow: 'Verified sources',
                    title: 'Local News',
                    subtitle: 'Aggregated snippets with links back to the original publisher.',
                  ),
                ),
                if (unreadCount > 0)
                  InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () => context.go('/notifications'),
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Text('$unreadCount unread', style: AppTextStyles.caption),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            AppSearchBar(
              controller: _searchController,
              hintText: 'Search local news...',
              recentKey: 'news',
              suggestions: const ['Windhoek updates', 'Clinic notices', 'Transport news', 'Public notice'],
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 16),
            NewsCategoryChips(
              selected: _category,
              onSelected: (value) => setState(() => _category = value),
            ),
            const SizedBox(height: 18),
            if ((user?.defaultTown ?? '').isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: Text(
                  'Showing news for ${[user?.defaultArea, user?.defaultTown].whereType<String>().where((item) => item.isNotEmpty).join(', ')}',
                  style: AppTextStyles.caption,
                ),
              ),
            const SectionTitle(
              title: 'Featured story',
              subtitle: 'Trending updates from trusted external publishers.',
            ),
            const SizedBox(height: 12),
            trendingNews.when(
              data: (items) => items.isEmpty
                  ? const EmptyStateView(title: 'No featured stories right now.', body: 'Try again later for the latest updates.')
                  : NewsCard(item: items.first),
              loading: () => const LoadingSkeleton(height: 220),
              error: (error, _) => const EmptyStateView(
                title: 'Trending news unavailable',
                body: 'Try again in a moment for the latest stories.',
              ),
            ),
            const SizedBox(height: 18),
            const SectionTitle(
              title: 'Latest near you',
              subtitle: 'Your town and area shape this feed first.',
            ),
            const SizedBox(height: 12),
            localNews.when(
              data: (items) => items.isEmpty
                  ? const EmptyStateView(title: 'No local news found for your area yet.', body: 'Try another category or refresh in a few minutes.')
                  : Column(
                      children: items.take(5).map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: NewsCard(item: item),
                      )).toList(),
                    ),
              loading: () => const LoadingSkeleton(height: 180),
              error: (error, _) => const EmptyStateView(
                title: 'Local news unavailable',
                body: 'We could not load local stories right now.',
              ),
            ),
            const SizedBox(height: 18),
            const SectionTitle(
              title: 'From followed sources',
              subtitle: 'Stories influenced by the places and providers you follow.',
            ),
            const SizedBox(height: 12),
            feedNews.when(
              data: (items) {
                final followedItems = items.where((item) => item.feedReason == 'from followed places').take(3).toList();
                if (followedItems.isEmpty) {
                  return const EmptyStateView(
                    title: 'No followed-source news yet.',
                    body: 'Follow local organizations and providers to shape this section.',
                  );
                }
                return Column(
                  children: followedItems.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: NewsCard(item: item),
                  )).toList(),
                );
              },
              loading: () => const LoadingSkeleton(height: 180),
              error: (error, _) => const EmptyStateView(
                title: 'Followed-source news unavailable',
                body: 'Try again in a moment.',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
