import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/experience/nearby_service_card.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import '../events/event_card.dart';
import '../news/news_feed_section.dart';
import '../services/services_repository.dart';
import 'widgets/home_hero_card.dart';
import 'widgets/home_quick_actions.dart';
import 'widgets/home_section.dart';
import 'widgets/local_update_card.dart';
import 'widgets/role_home_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _routeSearch(String value) {
    final query = value.trim();
    if (query.isEmpty) return;
    context.go('/search?q=${Uri.encodeComponent(query)}');
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final preferences = ref.watch(preferencesProvider);
    final providers = ref.watch(servicesProvider);
    final events = ref.watch(eventsProvider);
    final alertsFeed = ref.watch(alertsFeedProvider);
    final products = ref.watch(storeProductsProvider);
    final jobs = ref.watch(jobsProvider);
    final followingFeed = ref.watch(followingFeedProvider);
    final preferenceData = preferences.asData?.value;
    final town = AppConfig.pilotTown;
    final area = preferenceData?.defaultArea ?? user?.defaultArea;
    final localNewsParams = {
      'town': town,
      ...?(area == null ? null : {'area': area}),
    };
    final newsFeed = ref.watch(auth.token == null ? newsProvider(localNewsParams) : newsFeedProvider);
    final role = user?.currentRole ?? (user?.roles.isNotEmpty == true ? user!.roles.first : 'guest');

    final localNews = newsFeed.asData?.value.take(3).toList() ?? const <NewsItemModel>[];
    final providerItems = providers.asData?.value.take(4).toList() ?? const <ProviderModel>[];
    final eventItems = events.asData?.value.take(3).toList() ?? const <EventModel>[];
    final productItems = products.asData?.value.take(3).toList() ?? const <ProductModel>[];
    final jobItems = jobs.asData?.value.take(3).toList() ?? const <JobModel>[];

    final baseUpdates = [
      ...(alertsFeed.asData?.value.take(2).map((item) => (
            title: item.title,
            source: item.location ?? 'Local alert',
            type: 'alert',
            route: '/alerts',
            time: item.timestamp,
            status: item.severity ?? 'urgent',
            weight: 3,
          )) ??
          const []),
      ...(followingFeed.asData?.value.take(2).map((item) => (
            title: item['title']?.toString() ?? item['name']?.toString() ?? item['body']?.toString() ?? 'Followed organization update',
            source: item['category']?.toString() ?? item['location']?.toString() ?? 'Followed update',
            type: 'followed',
            route: '/activity',
            time: item['timestamp']?.toString() ?? item['created_at']?.toString(),
            status: item['status']?.toString() ?? 'following',
            weight: 2,
          )) ??
          const []),
    ];
    final remainingUpdateSlots = baseUpdates.length >= 4 ? 0 : 4 - baseUpdates.length;
    final localUpdates = [
      ...baseUpdates,
      ...eventItems.take(baseUpdates.length >= 4 ? 0 : 1).map((item) => (
            title: item.title,
            source: item.venueName ?? item.locationLabel ?? item.location ?? 'Local event',
            type: 'event',
            route: '/events/${item.id}',
            time: item.startsAt,
            status: item.category,
            weight: 2,
          )),
      ...localNews.take(remainingUpdateSlots).map((item) => (
            title: item.title,
            source: item.sourceName,
            type: 'news',
            route: '/news/${item.id}',
            time: item.publishedAt,
            status: item.category,
            weight: 1,
          )),
    ]..sort((a, b) => b.weight.compareTo(a.weight));

    return LokalsShell(
      title: 'LOKALS',
      child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        LokalsAvatar(label: user?.name ?? 'Lokals'),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user == null ? 'Welcome to LOKALS' : 'Good day, ${user.name}',
                                style: AppTextStyles.bodyMuted,
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'What do you need in Okahandja today?',
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.deepCharcoal,
                                  height: 1.08,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Search trusted local services, daily essentials, events, jobs, and civic updates without leaving one clean flow.',
                      style: AppTextStyles.bodyMuted,
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        AppBadge(
                          label: [area, town].whereType<String>().join(', '),
                          tone: AppBadgeTone.neutral,
                        ),
                        AppBadge(
                          label: AppConfig.pilotLocationMessage,
                          tone: AppBadgeTone.success,
                        ),
                        AppBadge(
                          label: user == null ? 'Guest mode' : role.replaceAll('_', ' '),
                          tone: AppBadgeTone.brand,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              AppSearchBar(
                controller: _searchController,
                hintText: 'Search services, jobs, products...',
                recentKey: 'home',
                onValueSelected: _routeSearch,
                suggestions: const [
                  'Services near me',
                  'Jobs in Okahandja',
                  'Products nearby',
                  'Events this weekend',
                  'Local news',
                ],
                shortcuts: const ['Services', 'Jobs', 'Market', 'Events', 'News'],
              ),
              if (user == null) ...[
                const SizedBox(height: 12),
                LokalsSurfaceTile(
                  onTap: () => context.go('/login'),
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.purpleSoftAlt,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.login_rounded, color: AppColors.primaryPurple),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Sign in for a more personal feed', style: TextStyle(fontWeight: FontWeight.w700)),
                            SizedBox(height: 4),
                            Text('Keep your area, activity, and local updates synced across the app.', style: AppTextStyles.bodyMuted),
                          ],
                        ),
                      ),
                      const AppBadge(label: 'Sign in', tone: AppBadgeTone.brand),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 18),
              const HomeHeroCard(),
              const SizedBox(height: 18),
              const HomeQuickActions(),
              const SizedBox(height: 18),
              RoleHomeCard(role: role, isGuest: user == null),
              const SizedBox(height: 18),
              HomeSection(
                eyebrow: 'Local updates',
                title: 'What is happening near you',
                actionLabel: 'View All',
                onAction: () => context.go('/alerts'),
                isLoading: alertsFeed.isLoading || newsFeed.isLoading || followingFeed.isLoading,
                errorText: (alertsFeed.hasError || newsFeed.hasError || followingFeed.hasError)
                    ? 'Please try again in a moment.'
                    : null,
                emptyTitle: localUpdates.isEmpty ? 'No alerts right now. You are all caught up.' : null,
                emptyBody: localUpdates.isEmpty ? 'Local alerts, followed updates, and news will appear here.' : null,
                onRetry: () {
                  ref.invalidate(alertsFeedProvider);
                  ref.invalidate(newsFeedProvider);
                  ref.invalidate(followingFeedProvider);
                },
                child: Column(
                  children: localUpdates.take(5).map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: LocalUpdateCard(
                      title: item.title,
                      source: item.source,
                      type: item.type,
                      route: item.route,
                      time: item.time,
                      status: item.status,
                    ),
                  )).toList(),
                ),
              ),
              const SizedBox(height: 18),
              HomeSection(
                eyebrow: 'Nearby services',
                title: 'Trusted providers around you',
                actionLabel: 'View All',
                onAction: () => context.go('/services'),
                isLoading: providers.isLoading,
                errorText: providers.hasError ? 'Services unavailable right now.' : null,
                emptyTitle: providerItems.isEmpty ? 'No nearby services yet.' : null,
                emptyBody: providerItems.isEmpty ? 'Trusted local providers will appear here.' : null,
                onRetry: () => ref.invalidate(servicesProvider),
                child: Column(
                  children: providerItems.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: NearbyServiceCard(provider: item),
                  )).toList(),
                ),
              ),
              const SizedBox(height: 18),
              HomeSection(
                eyebrow: 'Events near you',
                title: 'Upcoming events nearby',
                actionLabel: 'View All',
                onAction: () => context.go('/events'),
                isLoading: events.isLoading,
                errorText: events.hasError ? 'Events unavailable right now.' : null,
                emptyTitle: eventItems.isEmpty ? 'No events nearby yet.' : null,
                emptyBody: eventItems.isEmpty ? 'Upcoming local events will show up here.' : null,
                onRetry: () => ref.invalidate(eventsProvider),
                child: Column(
                  children: eventItems.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: EventCard(event: item),
                  )).toList(),
                ),
              ),
              const SizedBox(height: 18),
              HomeSection(
                eyebrow: 'Store deals',
                title: 'Local products and offers',
                actionLabel: 'View All',
                onAction: () => context.go('/store'),
                isLoading: products.isLoading,
                errorText: products.hasError ? 'Store deals unavailable right now.' : null,
                emptyTitle: productItems.isEmpty ? 'No store deals in your area today.' : null,
                emptyBody: productItems.isEmpty ? 'Local products and sale alerts will appear here.' : null,
                onRetry: () => ref.invalidate(storeProductsProvider),
                child: Column(
                  children: productItems.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(24),
                      onTap: () => context.go('/store/${item.id}'),
                      child: AppCard(
                        child: Row(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: AppColors.greenSoft,
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: const Icon(Icons.shopping_bag_outlined, color: AppColors.lokalsGreen),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 4),
                                  Text(item.businessName ?? item.userName ?? 'Local seller', style: const TextStyle(color: AppColors.mutedText)),
                                  const SizedBox(height: 8),
                                  Text(item.salePrice ?? item.price, style: const TextStyle(fontWeight: FontWeight.w800)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )).toList(),
                ),
              ),
              const SizedBox(height: 18),
              HomeSection(
                eyebrow: role == 'worker' ? 'Work first' : 'Work opportunities',
                title: 'Jobs near you',
                actionLabel: 'View All',
                onAction: () => context.go('/jobs'),
                isLoading: jobs.isLoading,
                errorText: jobs.hasError ? 'Jobs unavailable right now.' : null,
                emptyTitle: jobItems.isEmpty ? 'No nearby work opportunities right now.' : null,
                emptyBody: jobItems.isEmpty ? 'Fresh local jobs will appear here.' : null,
                onRetry: () => ref.invalidate(jobsProvider),
                child: Column(
                  children: jobItems.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(24),
                      onTap: () => context.go('/jobs'),
                      child: AppCard(
                        child: Row(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: const Color(0xFFEEF2FF),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: const Icon(Icons.work_outline_rounded, color: AppColors.primaryPurple),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 4),
                                  Text(item.location ?? [area, town].whereType<String>().join(', '), style: const TextStyle(color: AppColors.mutedText)),
                                  const SizedBox(height: 8),
                                  Text(item.compensation ?? 'Pay not listed', style: const TextStyle(fontWeight: FontWeight.w800)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )).toList(),
                ),
              ),
              const SizedBox(height: 18),
              newsFeed.when(
                data: (items) => NewsFeedSection(
                  title: 'Local news',
                  subtitle: 'Aggregated local stories with clear source attribution.',
                  items: items.take(3).toList(),
                ),
                loading: () => const LoadingSkeleton(height: 180),
                error: (error, _) => const EmptyStateView(
                  title: 'News unavailable',
                  body: 'Please try again in a moment.',
                ),
              ),
              const SizedBox(height: 18),
              AppCard(
                child: Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Explore more in your area',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Browse more local services, shops, directory entries, and updates.',
                            style: TextStyle(color: AppColors.mutedText),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    AppButton(
                      label: 'More',
                      expanded: false,
                      variant: AppButtonVariant.secondary,
                      onPressed: () => context.go('/more'),
                    ),
                  ],
                ),
              ),
            ],
          ),
    );
  }
}
