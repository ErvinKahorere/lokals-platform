import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/alert_feed_card.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({super.key});

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen> {
  String _tab = 'all';

  Future<void> _refreshFeeds() async {
    ref.invalidate(alertsFeedProvider);
    ref.invalidate(followingFeedProvider);
  }

  List<_AlertFeedEntry> _buildEntries(
    List<AlertFeedModel> alerts,
    List<Map<String, dynamic>> following,
  ) {
    final alertEntries = alerts
        .map(
          (item) => _AlertFeedEntry(
            id: item.id,
            sourceType: item.sourceType,
            sourceLabel: item.sourceType == 'announcement'
                ? 'Promotion'
                : item.sourceType == 'job'
                    ? 'Job update'
                    : 'Alert',
            title: item.title,
            body: item.body,
            severity: item.severity ?? 'normal',
            location: item.location,
            route: item.sourceType == 'job' ? '/jobs' : '/alerts',
          ),
        )
        .toList();

    final followEntries = following
        .map(
          (item) => _AlertFeedEntry(
            id: 'followed-${item['id'] ?? item['title']}',
            sourceType: 'following',
            sourceLabel: item['type']?.toString() == 'organization'
                ? 'Following'
                : 'Provider update',
            title:
                (item['title'] ?? item['name'] ?? 'Followed update').toString(),
            body: (item['body'] ?? 'Update from a followed source.')
                .toString(),
            severity: item['status']?.toString() ?? 'normal',
            location: item['location']?.toString(),
            route: '/activity',
          ),
        )
        .toList();

    final merged = [...alertEntries, ...followEntries];

    return merged.where((item) {
      switch (_tab) {
        case 'following':
          return item.sourceType == 'following';
        case 'urgent':
          return ['critical', 'high', 'urgent']
              .contains(item.severity.toLowerCase());
        case 'promotions':
          return item.sourceType == 'announcement' ||
              RegExp('sale|promo|discount', caseSensitive: false)
                  .hasMatch('${item.title} ${item.body}');
        default:
          return true;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final alerts = ref.watch(alertsFeedProvider);
    final following = ref.watch(followingFeedProvider);

    return LokalsShell(
      title: 'Alerts',
      showBack: true,
      child: RefreshIndicator(
        onRefresh: _refreshFeeds,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Row(
              children: [
                const Expanded(
                  child: SectionTitle(
                    title: 'Local alerts',
                    subtitle:
                        'Actionable updates from your area, followed sources, and promotions.',
                  ),
                ),
                TextButton.icon(
                  onPressed: () => context.go('/notifications'),
                  icon: const Icon(Icons.notifications_active_outlined),
                  label: const Text('Notifications'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'View',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.mutedText,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _AlertTabChip(
                  label: 'All',
                  isActive: _tab == 'all',
                  onTap: () => setState(() => _tab = 'all'),
                ),
                _AlertTabChip(
                  label: 'Following',
                  isActive: _tab == 'following',
                  onTap: () => setState(() => _tab = 'following'),
                ),
                _AlertTabChip(
                  label: 'Urgent',
                  isActive: _tab == 'urgent',
                  onTap: () => setState(() => _tab = 'urgent'),
                ),
                _AlertTabChip(
                  label: 'Promotions',
                  isActive: _tab == 'promotions',
                  onTap: () => setState(() => _tab = 'promotions'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (alerts.isLoading || following.isLoading)
              const LoadingSkeleton(height: 140)
            else if (alerts.hasError || following.hasError)
              const EmptyStateView(
                title: 'Unable to load alerts right now.',
                body: 'Try again in a moment.',
              )
            else ...[
              Builder(
                builder: (context) {
                  final merged = _buildEntries(
                    alerts.asData?.value ?? const <AlertFeedModel>[],
                    following.asData?.value ??
                        const <Map<String, dynamic>>[],
                  );

                  if (merged.isEmpty) {
                    return const EmptyStateView(
                      title: 'No alerts right now. You\'re all caught up.',
                      body:
                          'Area alerts, followed updates, and promotions will appear here.',
                    );
                  }

                  return Column(
                    children: merged
                        .map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: AlertFeedCard(
                              title: item.title,
                              body: item.body,
                              sourceLabel: item.sourceLabel,
                              severity: item.severity,
                              location: item.location,
                              actionLabel: item.sourceType == 'job'
                                  ? 'View job'
                                  : item.sourceType == 'following'
                                      ? 'Open activity'
                                      : null,
                              onAction: item.sourceType == 'job' ||
                                      item.sourceType == 'following'
                                  ? () => context.go(item.route)
                                  : null,
                            ),
                          ),
                        )
                        .toList(),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AlertTabChip extends StatelessWidget {
  const _AlertTabChip({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: isActive,
      onSelected: (_) => onTap(),
      selectedColor: AppColors.primaryPurple,
      backgroundColor: AppColors.surfaceWhite,
      side: const BorderSide(color: AppColors.border),
      labelStyle: TextStyle(
        color: isActive ? Colors.white : AppColors.deepCharcoal,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

class _AlertFeedEntry {
  const _AlertFeedEntry({
    required this.id,
    required this.sourceType,
    required this.sourceLabel,
    required this.title,
    required this.body,
    required this.severity,
    required this.route,
    this.location,
  });

  final String id;
  final String sourceType;
  final String sourceLabel;
  final String title;
  final String body;
  final String severity;
  final String route;
  final String? location;
}
