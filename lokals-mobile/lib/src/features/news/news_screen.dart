import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
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
    final town = AppConfig.pilotTown;
    final area = (user?.defaultArea ?? '').trim();
    final localParams = {
      if (_category != 'all') 'category': _category,
      if (_searchController.text.trim().isNotEmpty) 'search': _searchController.text.trim(),
      'town': town,
      if (area.isNotEmpty) 'area': area,
    };
    final localNews = ref.watch(newsProvider(localParams));
    final trendingNews = ref.watch(newsTrendingProvider);
    final feedNews = ref.watch(newsFeedProvider);
    final notifications = ref.watch(notificationsProvider).asData?.value ?? const [];
    final unreadCount = notifications.where((item) => item.readAt == null).length;
    final localItems = localNews.asData?.value ?? const <NewsItemModel>[];
    final featuredItems = trendingNews.asData?.value ?? const <NewsItemModel>[];
    final featuredStory = featuredItems.isNotEmpty
        ? featuredItems.first
        : (localItems.isNotEmpty ? localItems.first : null);
    final latestItems = localItems
        .where((item) => item.id != featuredStory?.id)
        .take(4)
        .toList();
    final publicNoticeItems = localItems
        .where((item) => item.category == 'public_notice')
        .take(3)
        .toList();
    final communityItems = [
      ...localItems.where((item) => item.category == 'community'),
      ...(feedNews.asData?.value ?? const <NewsItemModel>[])
          .where((item) => item.feedReason == 'from followed places')
          .take(2),
    ].take(3).toList();

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
                    subtitle: 'Trusted local snippets, public notices, and community updates for Okahandja.',
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
              hintText: 'Search local news in Okahandja...',
              recentKey: 'news',
              suggestions: const ['Water notice', 'Clinic update', 'Taxi rank transport', 'School event'],
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 16),
            NewsCategoryChips(
              selected: _category,
              onSelected: (value) => setState(() => _category = value),
            ),
            const SizedBox(height: 18),
            Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  AppBadge(
                    label: area.isEmpty ? town : '$area, $town',
                    tone: AppBadgeTone.neutral,
                  ),
                  const AppBadge(
                    label: 'Source-attributed snippets only',
                    tone: AppBadgeTone.brand,
                  ),
                ],
              ),
            ),
            const SectionTitle(
              title: 'Featured story',
              subtitle: 'A trusted local highlight with clear attribution and a link back to the original source.',
            ),
            const SizedBox(height: 12),
            trendingNews.when(
              data: (_) => featuredStory == null
                  ? const EmptyStateView(title: 'No featured stories right now.', body: 'Try again later for the latest updates.')
                  : NewsCard(item: featuredStory),
              loading: () => const LoadingSkeleton(height: 220),
              error: (error, _) => const EmptyStateView(
                title: 'Trending news unavailable',
                body: 'Try again in a moment for the latest stories.',
              ),
            ),
            const SizedBox(height: 18),
            const SectionTitle(
              title: 'Latest near you',
              subtitle: 'Latest local stories around Okahandja and your selected area.',
            ),
            const SizedBox(height: 12),
            localNews.when(
              data: (_) => latestItems.isEmpty
                  ? const EmptyStateView(title: 'No local news found for your area yet.', body: 'Try another category or refresh in a few minutes.')
                  : Column(
                      children: latestItems.map((item) => Padding(
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
              title: 'Public notices',
              subtitle: 'Official notices, service updates, and practical local information.',
            ),
            const SizedBox(height: 12),
            localNews.when(
              data: (_) {
                if (publicNoticeItems.isEmpty) {
                  return const EmptyStateView(
                    title: 'No public notices right now.',
                    body: 'Official notices and service bulletins will appear here.',
                  );
                }
                return Column(
                  children: publicNoticeItems.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: NewsCard(item: item),
                  )).toList(),
                );
              },
              loading: () => const LoadingSkeleton(height: 180),
              error: (error, _) => const EmptyStateView(
                title: 'Public notices unavailable',
                body: 'Try again in a moment.',
              ),
            ),
            const SizedBox(height: 18),
            const SectionTitle(
              title: 'Community updates',
              subtitle: 'Local stories from community life, followed places, and nearby events.',
            ),
            const SizedBox(height: 12),
            if (feedNews.isLoading && communityItems.isEmpty)
              const LoadingSkeleton(height: 180)
            else if (feedNews.hasError && communityItems.isEmpty)
              const EmptyStateView(
                title: 'Community updates unavailable',
                body: 'Try again in a moment.',
              )
            else if (communityItems.isEmpty)
              const EmptyStateView(
                title: 'No community updates yet.',
                body: 'Community and followed-source stories will appear here.',
              )
            else
              Column(
                children: communityItems.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: NewsCard(item: item),
                )).toList(),
              ),
          ],
        ),
      ),
    );
  }
}
