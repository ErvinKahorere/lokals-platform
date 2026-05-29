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
import '../services/services_repository.dart';
import 'widgets/home_section.dart';
import 'widgets/local_update_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();

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

  String _greetingLabel() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final preferences = ref.watch(preferencesProvider);
    final providers = ref.watch(servicesProvider);
    final alertsFeed = ref.watch(alertsFeedProvider);
    final products = ref.watch(storeProductsProvider(null));
    final followingFeed = ref.watch(followingFeedProvider);
    final preferenceData = preferences.asData?.value;
    final town = AppConfig.pilotTown;
    final area = preferenceData?.defaultArea ?? user?.defaultArea;
    final locationLabel = [if (area != null && area.isNotEmpty) area, town].join(', ');
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
        providers.asData?.value.take(4).toList() ?? const <ProviderModel>[];
    final productItems =
        products.asData?.value.take(3).toList() ?? const <ProductModel>[];
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
    final followedItems =
        (followingFeed.asData?.value ?? const <dynamic>[])
            .map((item) => Map<String, dynamic>.from(item as Map))
            .take(3)
            .toList();

    final localUpdates = [
      ...sortedAlertItems.take(2).map(
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
      ...localNews.take(2).map(
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
      ...followedItems.map(
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
          ),
    ]..sort((a, b) => b.weight.compareTo(a.weight));

    final firstName = user?.name.split(' ').first ?? 'there';

    return LokalsShell(
      title: 'LOKALS',
      bodyBottomInset: 10,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_greetingLabel()}, $firstName',
                  style: AppTextStyles.bodyMuted.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Your City Command Center',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: AppColors.deepCharcoal,
                    height: 1.05,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'City alerts, trusted services, marketplace highlights, and useful local updates for $locationLabel.',
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
                    AppBadge(
                      label: _formatRoleLabel(role),
                      tone: AppBadgeTone.brand,
                    ),
                    AppBadge(
                      label: locationLabel,
                      tone: AppBadgeTone.neutral,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                AppSearchBar(
                  controller: _searchController,
                  hintText: 'Search services, products, and city updates...',
                  recentKey: 'home',
                  onValueSelected: _routeSearch,
                  suggestions: const [
                    'Services near me',
                    'Taxi in Okahandja',
                    'Parcel delivery',
                    'Town updates',
                    'Products nearby',
                  ],
                  shortcuts: const [
                    'Services',
                    'Taxi',
                    'Delivery',
                    'Store',
                    'Alerts',
                  ],
                ),
                if (user == null) ...[
                  const SizedBox(height: 14),
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
                                'Sign in for a more personal city feed',
                                style: TextStyle(fontWeight: FontWeight.w700),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Keep follows, area preferences, and local activity in sync.',
                                style: AppTextStyles.bodyMuted,
                              ),
                            ],
                          ),
                        ),
                        const AppBadge(
                          label: 'Sign in',
                          tone: AppBadgeTone.brand,
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _PulseStat(
                      label: 'Active alerts',
                      value: '${sortedAlertItems.length}',
                      detail: sortedAlertItems.isEmpty
                          ? 'No urgent alert right now'
                          : sortedAlertItems.first.title,
                      icon: Icons.notifications_active_outlined,
                      iconBackground: AppColors.dangerSoft,
                      iconColor: AppColors.danger,
                    ),
                    _PulseStat(
                      label: 'Nearby services',
                      value: '${providerItems.length}',
                      detail: providerItems.isEmpty
                          ? 'Providers will appear here'
                          : providerItems.first.name,
                      icon: Icons.home_repair_service_outlined,
                      iconBackground: AppColors.successSoft,
                      iconColor: AppColors.primaryGreen,
                    ),
                    _PulseStat(
                      label: 'Market picks',
                      value: '${productItems.length}',
                      detail: productItems.isEmpty
                          ? 'Fresh offers will show here'
                          : productItems.first.title,
                      icon: Icons.storefront_outlined,
                      iconBackground: AppColors.warningSoft,
                      iconColor: AppColors.warning,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'Priority actions',
            title: 'Move fast on the essentials',
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: const [
                _CommandActionTile(
                  label: 'Report Issue',
                  detail: 'Roads, water, waste, and public concerns',
                  route: '/report-issue',
                  icon: Icons.report_problem_outlined,
                  iconBackground: AppColors.warningSoft,
                  iconColor: Color(0xFFD97706),
                ),
                _CommandActionTile(
                  label: 'Request Taxi',
                  detail: 'Book a ride around town in a few taps',
                  route: '/ride',
                  icon: Icons.local_taxi_outlined,
                  iconBackground: AppColors.infoSoft,
                  iconColor: AppColors.softBlue,
                ),
                _CommandActionTile(
                  label: 'Send Parcel',
                  detail: 'Arrange quick local delivery',
                  route: '/delivery',
                  icon: Icons.local_shipping_outlined,
                  iconBackground: AppColors.successSoft,
                  iconColor: AppColors.primaryGreen,
                ),
                _CommandActionTile(
                  label: 'SOS',
                  detail: 'Reach emergency help immediately',
                  route: '/sos',
                  icon: Icons.shield_outlined,
                  iconBackground: AppColors.dangerSoft,
                  iconColor: AppColors.danger,
                ),
                _CommandActionTile(
                  label: 'Browse Services',
                  detail: 'Trusted local providers near you',
                  route: '/services',
                  icon: Icons.auto_awesome_outlined,
                  iconBackground: AppColors.purpleSoftAlt,
                  iconColor: AppColors.primaryPurple,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'City alerts',
            title: 'Smart city alerts and announcements',
            actionLabel: 'View all',
            onAction: () => context.go('/alerts'),
            isLoading: alertsFeed.isLoading || newsFeed.isLoading,
            errorText: (alertsFeed.hasError || newsFeed.hasError)
                ? 'Please try again in a moment.'
                : null,
            emptyTitle: sortedAlertItems.isEmpty && localNews.isEmpty
                ? 'No active alerts right now'
                : null,
            emptyBody: sortedAlertItems.isEmpty && localNews.isEmpty
                ? 'Official notices and local announcements will appear here as soon as they are published.'
                : null,
            emptyAction: AppButton(
              label: 'Open local news',
              expanded: false,
              variant: AppButtonVariant.secondary,
              onPressed: () => context.go('/news'),
            ),
            onRetry: () {
              ref.invalidate(alertsFeedProvider);
              ref.invalidate(localNewsSource);
            },
            child: Column(
              children: [
                ...sortedAlertItems.take(3).map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _AlertAnnouncementTile(
                      title: item.title,
                      body: item.body,
                      location: item.location ?? locationLabel,
                      severity: item.severity ?? 'notice',
                    ),
                  ),
                ),
                if (sortedAlertItems.isEmpty)
                  ...localNews.take(2).map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _AlertAnnouncementTile(
                        title: item.title,
                        body: item.sourceName,
                        location: locationLabel,
                        severity: item.category,
                        route: '/news/${item.id}',
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'Nearby services',
            title: 'Trusted providers around you',
            actionLabel: 'Browse all',
            onAction: () => context.go('/services'),
            isLoading: providers.isLoading,
            errorText: providers.hasError
                ? 'Services unavailable right now.'
                : null,
            emptyTitle: providerItems.isEmpty ? 'No nearby services yet.' : null,
            emptyBody: providerItems.isEmpty
                ? 'Trusted providers will appear here as soon as they are available in your area.'
                : null,
            emptyAction: AppButton(
              label: 'Browse services',
              expanded: false,
              variant: AppButtonVariant.secondary,
              onPressed: () => context.go('/services'),
            ),
            onRetry: () => ref.invalidate(servicesProvider),
            child: providerItems.isEmpty
                ? const SizedBox.shrink()
                : Column(
                    children: providerItems
                        .map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: NearbyServiceCard(provider: item),
                          ),
                        )
                        .toList(),
                  ),
          ),
          const SizedBox(height: 20),
          HomeSection(
            eyebrow: 'Market picks',
            title: 'Marketplace highlights',
            actionLabel: 'Open store',
            onAction: () => context.go('/store'),
            isLoading: products.isLoading,
            errorText: products.hasError
                ? 'Marketplace unavailable right now.'
                : null,
            emptyTitle: productItems.isEmpty ? 'No local offers yet.' : null,
            emptyBody: productItems.isEmpty
                ? 'Fresh products and popular offers will appear here when sellers publish them.'
                : null,
            emptyAction: AppButton(
              label: 'Browse marketplace',
              expanded: false,
              variant: AppButtonVariant.secondary,
              onPressed: () => context.go('/store'),
            ),
            onRetry: () => ref.invalidate(storeProductsProvider(null)),
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
                                height: 160,
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
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            item.title,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 18,
                                              height: 1.25,
                                            ),
                                          ),
                                        ),
                                        const AppBadge(
                                          label: 'Popular',
                                          tone: AppBadgeTone.accent,
                                        ),
                                      ],
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
            eyebrow: 'Recent activity',
            title: 'Status updates that matter',
            actionLabel: 'Open activity',
            onAction: () => context.go('/activity'),
            isLoading:
                alertsFeed.isLoading || newsFeed.isLoading || followingFeed.isLoading,
            errorText:
                (alertsFeed.hasError || newsFeed.hasError || followingFeed.hasError)
                ? 'Please try again in a moment.'
                : null,
            emptyTitle: localUpdates.isEmpty ? 'No recent movement yet.' : null,
            emptyBody: localUpdates.isEmpty
                ? 'Your city feed will collect alerts, followed updates, and useful notices here.'
                : null,
            emptyAction: AppButton(
              label: 'Check alerts',
              expanded: false,
              variant: AppButtonVariant.secondary,
              onPressed: () => context.go('/alerts'),
            ),
            onRetry: () {
              ref.invalidate(alertsFeedProvider);
              ref.invalidate(localNewsSource);
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
            eyebrow: 'Follow',
            title: followedItems.isNotEmpty
                ? 'Followed organizations'
                : 'Suggested organizations',
            actionLabel: 'Manage',
            onAction: () => context.go('/following-organizations'),
            isLoading: followingFeed.isLoading,
            errorText: followingFeed.hasError
                ? 'Followed updates are unavailable right now.'
                : null,
            emptyTitle: null,
            onRetry: () => ref.invalidate(followingFeedProvider),
            child: Column(
              children: (followedItems.isNotEmpty
                      ? followedItems
                      : _suggestedOrganizations)
                  .map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _FollowTile(
                        title: item['title']?.toString() ?? 'Suggested organization',
                        body:
                            item['body']?.toString() ??
                            'Official and trusted local voices will appear here.',
                        badge:
                            item['badge']?.toString() ??
                            item['status']?.toString() ??
                            'Following',
                        route: item['route']?.toString() ??
                            '/following-organizations',
                        subtitle:
                            item['category']?.toString() ??
                            item['location']?.toString() ??
                            item['subtitle']?.toString() ??
                            'Suggested for your feed',
                        tone: item['badge'] == null
                            ? AppBadgeTone.success
                            : AppBadgeTone.accent,
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

const _suggestedOrganizations = [
  {
    'title': 'Town notices',
    'body':
        'Follow municipal announcements, service notices, and verified public updates.',
    'badge': 'Official',
    'subtitle': 'Suggested for your feed',
    'route': '/following-organizations',
  },
  {
    'title': 'Community groups',
    'body':
        'See updates from local organizers, projects, and public-interest initiatives.',
    'badge': 'Community',
    'subtitle': 'Suggested for your feed',
    'route': '/following-organizations',
  },
  {
    'title': 'Trusted businesses',
    'body':
        'Keep nearby service providers and verified local brands in your regular feed.',
    'badge': 'Business',
    'subtitle': 'Suggested for your feed',
    'route': '/directory',
  },
];

String _formatRoleLabel(String role) {
  final words = role.split('_').where((part) => part.isNotEmpty);
  return words
      .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}

class _PulseStat extends StatelessWidget {
  const _PulseStat({
    required this.label,
    required this.value,
    required this.detail,
    required this.icon,
    required this.iconBackground,
    required this.iconColor,
  });

  final String label;
  final String value;
  final String detail;
  final IconData icon;
  final Color iconBackground;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 156,
      child: LokalsSurfaceTile(
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
                      Text(label, style: AppTextStyles.bodyMuted),
                      const SizedBox(height: 8),
                      Text(
                        value,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: AppColors.deepCharcoal,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: iconBackground,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(icon, color: iconColor),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              detail,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodyMuted,
            ),
          ],
        ),
      ),
    );
  }
}

class _CommandActionTile extends StatelessWidget {
  const _CommandActionTile({
    required this.label,
    required this.detail,
    required this.route,
    required this.icon,
    required this.iconBackground,
    required this.iconColor,
  });

  final String label;
  final String detail;
  final String route;
  final IconData icon;
  final Color iconBackground;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 164,
      child: LokalsSurfaceTile(
        onTap: () => context.go(route),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: iconBackground,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: iconColor),
            ),
            const SizedBox(height: 14),
            Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                color: AppColors.deepCharcoal,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              detail,
              style: AppTextStyles.bodyMuted,
            ),
          ],
        ),
      ),
    );
  }
}

class _AlertAnnouncementTile extends StatelessWidget {
  const _AlertAnnouncementTile({
    required this.title,
    required this.body,
    required this.location,
    required this.severity,
    this.route = '/alerts',
  });

  final String title;
  final String body;
  final String location;
  final String severity;
  final String route;

  @override
  Widget build(BuildContext context) {
    return LokalsSurfaceTile(
      onTap: () => context.go(route),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: _severityBackground(severity),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              Icons.notifications_active_outlined,
              color: _severityColor(severity),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    AppBadge(
                      label: severity,
                      tone: _severityTone(severity),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.bodyMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.deepCharcoal,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  body,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.bodyMuted,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FollowTile extends StatelessWidget {
  const _FollowTile({
    required this.title,
    required this.body,
    required this.badge,
    required this.route,
    required this.subtitle,
    required this.tone,
  });

  final String title;
  final String body;
  final String badge;
  final String route;
  final String subtitle;
  final AppBadgeTone tone;

  @override
  Widget build(BuildContext context) {
    return LokalsSurfaceTile(
      onTap: () => context.go(route),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.purpleSoftAlt,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.groups_2_outlined,
              color: AppColors.primaryPurple,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.deepCharcoal,
                        ),
                      ),
                    ),
                    AppBadge(label: badge, tone: tone),
                  ],
                ),
                const SizedBox(height: 8),
                Text(body, style: AppTextStyles.bodyMuted),
                const SizedBox(height: 8),
                Text(
                  subtitle,
                  style: AppTextStyles.bodyMuted.copyWith(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

AppBadgeTone _severityTone(String severity) {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
    case 'urgent':
      return AppBadgeTone.danger;
    case 'medium':
      return AppBadgeTone.warning;
    default:
      return AppBadgeTone.info;
  }
}

Color _severityBackground(String severity) {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
    case 'urgent':
      return AppColors.dangerSoft;
    case 'medium':
      return AppColors.warningSoft;
    default:
      return AppColors.infoSoft;
  }
}

Color _severityColor(String severity) {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
    case 'urgent':
      return AppColors.danger;
    case 'medium':
      return AppColors.warning;
    default:
      return AppColors.softBlue;
  }
}
