import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/experience/nearby_service_card.dart';
import '../../config/app_config.dart';
import '../../core/experience_helpers.dart';
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
  String _homeEventFilter = 'this_week';

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

  bool _matchesHomeEventFilter(EventModel event) {
    if (_homeEventFilter == 'all' || event.startsAt == null) {
      return true;
    }

    final startsAt = DateTime.tryParse(event.startsAt!);
    if (startsAt == null) {
      return true;
    }

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDay = DateTime(startsAt.year, startsAt.month, startsAt.day);
    final currentWeekStart = today.subtract(Duration(days: today.weekday - 1));
    final nextWeekStart = currentWeekStart.add(const Duration(days: 7));
    final nextWeekEnd = nextWeekStart.add(const Duration(days: 7));
    final monthEnd = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
    final yearEnd = DateTime(now.year, 12, 31, 23, 59, 59);

    switch (_homeEventFilter) {
      case 'today':
        return eventDay == today;
      case 'this_week':
        return !startsAt.isBefore(currentWeekStart) &&
            startsAt.isBefore(nextWeekStart);
      case 'next_week':
        return !startsAt.isBefore(nextWeekStart) &&
            startsAt.isBefore(nextWeekEnd);
      case 'this_month':
        return !startsAt.isBefore(today) && startsAt.isBefore(monthEnd);
      case 'this_year':
        return !startsAt.isBefore(today) && startsAt.isBefore(yearEnd);
      default:
        return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;
    final homeScrollBottomPadding = safeBottom + 88;
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
    final localNewsSource =
        auth.token == null ? newsProvider(localNewsParams) : newsFeedProvider;
    final newsFeed = ref.watch(localNewsSource);
    final role =
        user?.currentRole ??
        (user?.roles.isNotEmpty == true ? user!.roles.first : 'guest');
    final localNews =
        newsFeed.asData?.value.take(3).toList() ?? const <NewsItemModel>[];
    final providerItems =
        providers.asData?.value.toList() ?? const <ProviderModel>[];
    final allEventItems = events.asData?.value ?? const <EventModel>[];
    final eventItems = allEventItems
        .where(_matchesHomeEventFilter)
        .take(5)
        .toList();
    final productItems =
        products.asData?.value.take(3).toList() ?? const <ProductModel>[];
    final jobItems = jobs.asData?.value.take(3).toList() ?? const <JobModel>[];
    final sortedAlertItems =
        [...(alertsFeed.asData?.value ?? const <AlertFeedModel>[])]
          ..sort((a, b) {
            final urgency = <String, int>{
              'critical': 4,
              'high': 3,
              'urgent': 3,
              'medium': 2,
              'normal': 1,
            };
            final leftWeight =
                (a.sourceType == 'municipal_alert' ? 10 : 0) +
                (urgency[a.severity?.toLowerCase() ?? 'normal'] ?? 0);
            final rightWeight =
                (b.sourceType == 'municipal_alert' ? 10 : 0) +
                (urgency[b.severity?.toLowerCase() ?? 'normal'] ?? 0);
            if (leftWeight != rightWeight) {
              return rightWeight.compareTo(leftWeight);
            }
            final leftTime =
                DateTime.tryParse(a.timestamp ?? '') ??
                DateTime.fromMillisecondsSinceEpoch(0);
            final rightTime =
                DateTime.tryParse(b.timestamp ?? '') ??
                DateTime.fromMillisecondsSinceEpoch(0);
            return rightTime.compareTo(leftTime);
          });

    final baseUpdates = [
      ...sortedAlertItems
          .take(2)
          .map(
            (item) => (
              title: item.title,
              source: item.location ?? 'Local alert',
              type: 'alert',
              route: '/alerts',
              time: item.timestamp,
              status: item.severity ?? 'urgent',
              weight: 3,
            ),
          ),
      ...localNews
          .take(2)
          .map(
            (item) => (
              title: item.title,
              source: item.sourceName,
              type: 'news',
              route: '/news/${item.id}',
              time: item.publishedAt,
              status: item.category,
              weight: 2,
            ),
          ),
      ...(followingFeed.asData?.value
              .take(2)
              .map(
                (item) => (
                  title:
                      item['title']?.toString() ??
                      item['name']?.toString() ??
                      item['body']?.toString() ??
                      'Followed organization update',
                  source:
                      item['category']?.toString() ??
                      item['location']?.toString() ??
                      'Followed update',
                  type: 'followed',
                  route: '/activity',
                  time:
                      item['timestamp']?.toString() ??
                      item['created_at']?.toString(),
                  status: item['status']?.toString() ?? 'following',
                  weight: 1,
                ),
              ) ??
          const []),
    ];
    final remainingUpdateSlots = baseUpdates.length >= 4
        ? 0
        : 4 - baseUpdates.length;
    final localUpdates = [
      ...baseUpdates,
      ...eventItems
          .take(baseUpdates.length >= 4 ? 0 : 1)
          .map(
            (item) => (
              title: item.title,
              source:
                  item.venueName ??
                  item.locationLabel ??
                  item.location ??
                  'Local event',
              type: 'event',
              route: '/events/${item.id}',
              time: item.startsAt,
              status: item.category,
              weight: 1,
            ),
          ),
      ...localNews
          .skip(2)
          .take(remainingUpdateSlots)
          .map(
            (item) => (
              title: item.title,
              source: item.sourceName,
              type: 'news',
              route: '/news/${item.id}',
              time: item.publishedAt,
              status: item.category,
              weight: 1,
            ),
          ),
    ]..sort((a, b) => b.weight.compareTo(a.weight));

    return LokalsShell(
      title: 'LOKALS',
      bodyBottomInset: 10,
      child: ListView(
        padding: EdgeInsets.fromLTRB(20, 12, 20, homeScrollBottomPadding),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 10),
                          Text(
                            'What do you need in Okahandja today?',
                            style: const TextStyle(
                              fontSize: 30,
                              fontWeight: FontWeight.w800,
                              color: AppColors.deepCharcoal,
                              height: 1.04,
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
                      label: AppConfig.pilotLocationMessage,
                      tone: AppBadgeTone.success,
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
                    child: const Icon(
                      Icons.login_rounded,
                      color: AppColors.primaryPurple,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Sign in for a more personal feed',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Keep your area, activity, and local updates synced across the app.',
                          style: AppTextStyles.bodyMuted,
                        ),
                      ],
                    ),
                  ),
                  const AppBadge(label: 'Sign in', tone: AppBadgeTone.brand),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          const HomeHeroCard(),
          const SizedBox(height: 20),
          HomeQuickActions(role: role, isGuest: user == null),
          const SizedBox(height: 20),
          RoleHomeCard(role: role, isGuest: user == null),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'Local updates',
            title: 'What is happening near you',
            actionLabel: 'View All',
            onAction: () => context.go('/alerts'),
            isLoading:
                alertsFeed.isLoading ||
                newsFeed.isLoading ||
                followingFeed.isLoading,
            errorText:
                (alertsFeed.hasError ||
                    newsFeed.hasError ||
                    followingFeed.hasError)
                ? 'Please try again in a moment.'
                : null,
            emptyTitle: localUpdates.isEmpty
                ? 'No alerts right now. You are all caught up.'
                : null,
            emptyBody: localUpdates.isEmpty
                ? 'Local alerts, followed updates, and news will appear here.'
                : null,
            onRetry: () {
              ref.invalidate(alertsFeedProvider);
              ref.invalidate(newsFeedProvider);
              ref.invalidate(followingFeedProvider);
            },
            child: Column(
              children: localUpdates
                  .take(5)
                  .map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: LocalUpdateCard(
                        title: item.title,
                        source: item.source,
                        type: item.type,
                        route: item.route,
                        time: item.time,
                        status: item.status,
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'Nearby services',
            title: 'Trusted providers around you',
            actionLabel: 'View All',
            onAction: () => context.go('/services'),
            isLoading: providers.isLoading,
            errorText: providers.hasError
                ? 'Services unavailable right now.'
                : null,
            emptyTitle: providerItems.isEmpty
                ? 'No nearby services yet.'
                : null,
            emptyBody: providerItems.isEmpty
                ? 'Trusted local providers will appear here.'
                : null,
            onRetry: () => ref.invalidate(servicesProvider),
            child: providerItems.isEmpty
                ? const SizedBox.shrink()
                : SizedBox(
                    height: 328,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: providerItems.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(width: 12),
                      itemBuilder: (context, index) => SizedBox(
                        width: 320,
                        child: NearbyServiceCard(
                          provider: providerItems[index],
                        ),
                      ),
                    ),
                  ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'Events near you',
            title: 'Upcoming events nearby',
            actionLabel: 'View All',
            onAction: () => context.go('/events'),
            isLoading: events.isLoading,
            errorText: events.hasError ? 'Events unavailable right now.' : null,
            emptyTitle: eventItems.isEmpty ? 'No events nearby yet.' : null,
            emptyBody: eventItems.isEmpty
                ? 'Upcoming local events will show up here.'
                : null,
            onRetry: () => ref.invalidate(eventsProvider),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      for (final item in const [
                        ('today', 'Today'),
                        ('this_week', 'This week'),
                        ('next_week', 'Next week'),
                        ('this_month', 'This month'),
                        ('this_year', 'This year'),
                        ('all', 'All'),
                      ])
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(item.$2),
                            selected: _homeEventFilter == item.$1,
                            onSelected: (_) => setState(() => _homeEventFilter = item.$1),
                            selectedColor: AppColors.primaryPurple,
                            labelStyle: TextStyle(
                              color: _homeEventFilter == item.$1
                                  ? Colors.white
                                  : AppColors.deepCharcoal,
                              fontWeight: FontWeight.w700,
                            ),
                            backgroundColor: AppColors.softBackground,
                            side: const BorderSide(color: AppColors.border),
                          ),
                        ),
                    ],
                  ),
                ),
                if (eventItems.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 586,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: eventItems.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(width: 12),
                      itemBuilder: (context, index) => SizedBox(
                        width: 320,
                        child: EventCard(event: eventItems[index]),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'Store deals',
            title: 'Local products and offers',
            actionLabel: 'View All',
            onAction: () => context.go('/store'),
            isLoading: products.isLoading,
            errorText: products.hasError
                ? 'Store deals unavailable right now.'
                : null,
            emptyTitle: productItems.isEmpty
                ? 'No store deals in your area today.'
                : null,
            emptyBody: productItems.isEmpty
                ? 'Local products and sale alerts will appear here.'
                : null,
            onRetry: () => ref.invalidate(storeProductsProvider),
            child: Column(
              children: productItems
                  .map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(24),
                        onTap: () => context.go('/store/${item.id}'),
                        child: AppCard(
                          padding: EdgeInsets.zero,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AppNetworkImage(
                                imageUrl: resolveMediaUrl(item.imageUrl),
                                fallbackIcon: Icons.shopping_bag_outlined,
                                height: 148,
                                width: double.infinity,
                                borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(20),
                                ),
                                backgroundColor: AppColors.neutralSoft,
                              ),
                              Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.title,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 18,
                                        height: 1.25,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      item.businessName ??
                                          item.userName ??
                                          'Local seller',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: AppColors.mutedText,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      item.salePrice ?? item.price,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 18,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: role == 'worker' ? 'Work first' : 'Work opportunities',
            title: 'Jobs near you',
            actionLabel: 'View All',
            onAction: () => context.go('/jobs'),
            isLoading: jobs.isLoading,
            errorText: jobs.hasError ? 'Jobs unavailable right now.' : null,
            emptyTitle: jobItems.isEmpty
                ? 'No nearby work opportunities right now.'
                : null,
            emptyBody: jobItems.isEmpty
                ? 'Fresh local jobs will appear here.'
                : null,
            onRetry: () => ref.invalidate(jobsProvider),
            child: Column(
              children: jobItems
                  .map(
                    (item) => Padding(
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
                                child: const Icon(
                                  Icons.work_outline_rounded,
                                  color: AppColors.primaryPurple,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.title,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.location ??
                                          [
                                            area,
                                            town,
                                          ].whereType<String>().join(', '),
                                      style: const TextStyle(
                                        color: AppColors.mutedText,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      item.compensation ?? 'Pay not listed',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 20),
          newsFeed.when(
            data: (items) => NewsFeedSection(
              title: 'Local news',
              subtitle:
                  'Aggregated local stories with clear source attribution.',
              items: items.take(3).toList(),
              horizontal: true,
            ),
            loading: () => const LoadingSkeleton(height: 180),
            error: (error, _) => EmptyStateView(
              title: 'News unavailable',
              body: 'Please try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                variant: AppButtonVariant.secondary,
                onPressed: () => ref.invalidate(localNewsSource),
              ),
            ),
          ),
          const SizedBox(height: 20),
          AppCard(
            child: Row(
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Explore more in your area',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
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
