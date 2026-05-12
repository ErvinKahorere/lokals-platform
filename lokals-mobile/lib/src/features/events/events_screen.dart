import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import '../services/services_repository.dart';
import 'event_card.dart';

class EventsScreen extends ConsumerStatefulWidget {
  const EventsScreen({super.key});

  @override
  ConsumerState<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends ConsumerState<EventsScreen> {
  final _searchController = TextEditingController();
  String _category = 'all';
  String _dateFilter = 'all';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  bool _matchesDate(EventModel event) {
    if (_dateFilter == 'all' || event.startsAt == null) return true;
    final startsAt = DateTime.tryParse(event.startsAt!);
    if (startsAt == null) return true;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    final monthEnd = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
    final normalized = DateTime(startsAt.year, startsAt.month, startsAt.day);

    if (_dateFilter == 'today') return normalized == today;
    if (_dateFilter == 'tomorrow') return normalized == tomorrow;
    if (_dateFilter == 'weekend') {
      return startsAt.weekday == DateTime.saturday || startsAt.weekday == DateTime.sunday;
    }
    if (_dateFilter == 'month') return startsAt.isBefore(monthEnd) && startsAt.isAfter(today.subtract(const Duration(seconds: 1)));
    return true;
  }

  bool _matchesSearchAndCategory(EventModel event) {
    final query = _searchController.text.trim().toLowerCase();
    final matchesSearch = query.isEmpty ||
        event.title.toLowerCase().contains(query) ||
        (event.description?.toLowerCase().contains(query) ?? false) ||
        (event.locationLabel?.toLowerCase().contains(query) ?? false);
    final matchesCategory = _category == 'all' || event.category == _category;
    return matchesSearch && matchesCategory && _matchesDate(event);
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final town = 'Okahandja';
    final events = ref.watch(eventsProvider);
    final eventFeed = events.asData?.value ?? const <EventModel>[];
    final filtered = eventFeed.where(_matchesSearchAndCategory).toList();
    final featured = filtered.firstWhere(
      (event) => event.isFeatured,
      orElse: () => filtered.isNotEmpty ? filtered.first : eventFeed.isNotEmpty ? eventFeed.first : EventModel(id: 0, title: '', category: 'community'),
    );
    final nearby = filtered.take(3).toList();
    final weekend = filtered.where((event) {
      final startsAt = event.startsAt == null ? null : DateTime.tryParse(event.startsAt!);
      return startsAt != null && (startsAt.weekday == DateTime.saturday || startsAt.weekday == DateTime.sunday);
    }).take(3).toList();
    final saved = filtered.where((event) => event.isSaved).take(3).toList();
    final followedOrganizationIds = ref.watch(followedOrganizationIdsProvider).asData?.value ?? <int>{};
    final followedProviderIds = ref.watch(followedProviderIdsProvider).asData?.value ?? <int>{};
    final followed = filtered.where((event) {
      final organizer = event.organizer;
      if (organizer == null) return false;
      return organizer.type == 'organization'
          ? followedOrganizationIds.contains(organizer.id)
          : followedProviderIds.contains(organizer.id);
    }).take(3).toList();

    return LokalsShell(
      title: 'Events',
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(eventsProvider);
          ref.invalidate(followedOrganizationIdsProvider);
          ref.invalidate(followedProviderIdsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            SectionTitle(
              eyebrow: 'Events',
              title: 'What is happening near you?',
              subtitle: 'Browse local events around ${[user?.defaultArea, town].whereType<String>().where((value) => value.isNotEmpty).join(', ')}.',
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.purpleSoftAlt,
                borderRadius: BorderRadius.circular(999),
              ),
                child: Text(
                [user?.defaultArea, town].whereType<String>().where((value) => value.isNotEmpty).join(', ').isEmpty
                    ? town
                    : [user?.defaultArea, town].whereType<String>().where((value) => value.isNotEmpty).join(', '),
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.primaryPurple,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 14),
            AppSearchBar(
              controller: _searchController,
              hintText: 'Search events in Okahandja...',
              recentKey: 'events',
              onChanged: (_) => setState(() {}),
              onValueSelected: (_) => setState(() {}),
              suggestions: const ['Weekend market', 'Workshop', 'Music night', 'Public meeting'],
            ),
            const SizedBox(height: 14),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    title: 'Refine the event feed',
                    subtitle:
                        'Filter by event type and timing without losing the premium local calendar layout.',
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final item in const [
                        'all',
                        'community',
                        'business',
                        'entertainment',
                        'sport',
                        'church',
                        'school',
                        'municipal',
                        'training',
                        'market',
                        'workshop',
                        'health',
                        'charity',
                      ])
                        ChoiceChip(
                          label: Text(item == 'all' ? 'All' : item),
                          selected: _category == item,
                          onSelected: (_) => setState(() => _category = item),
                          selectedColor: AppColors.primaryPurple,
                          labelStyle: TextStyle(
                            color: _category == item ? Colors.white : AppColors.deepCharcoal,
                            fontWeight: FontWeight.w700,
                          ),
                          backgroundColor: AppColors.softBackground,
                          side: const BorderSide(color: AppColors.border),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final item in const [
                        ('all', 'All'),
                        ('today', 'Today'),
                        ('tomorrow', 'Tomorrow'),
                        ('weekend', 'Weekend'),
                        ('month', 'This Month'),
                      ])
                        ChoiceChip(
                          label: Text(item.$2),
                          selected: _dateFilter == item.$1,
                          onSelected: (_) => setState(() => _dateFilter = item.$1),
                          selectedColor: AppColors.primaryPurple,
                          labelStyle: TextStyle(
                            color: _dateFilter == item.$1 ? Colors.white : AppColors.deepCharcoal,
                            fontWeight: FontWeight.w700,
                          ),
                          backgroundColor: AppColors.softBackground,
                          side: const BorderSide(color: AppColors.border),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            if (events.isLoading)
              const LokalsLoadingScreen(
                title: 'Loading events',
                message: 'Fetching upcoming Okahandja events and tickets...',
              )
            else if (events.hasError)
              EmptyStateView(
                title: 'Events unavailable',
                body: 'We could not load events right now.',
                action: AppButton(
                  label: 'Retry',
                  expanded: false,
                  onPressed: () => ref.invalidate(eventsProvider),
                ),
              )
            else if (filtered.isEmpty)
              const EmptyStateView(
                title: 'No events found in your area yet.',
                body: 'Try another date or category.',
              )
            else ...[
              if (featured.id != 0) ...[
                const SectionTitle(
                  title: 'Featured Event',
                  subtitle: 'A strong local pick to act on now.',
                ),
                const SizedBox(height: 12),
                EventCard(event: featured, featured: true),
                const SizedBox(height: 18),
              ],
              _EventsSection(
                title: 'Upcoming events',
                items: nearby,
              ),
              const SizedBox(height: 18),
              _EventsSection(
                title: 'This Weekend',
                items: weekend,
              ),
              const SizedBox(height: 18),
              _EventsSection(
                title: 'Saved Events',
                items: saved,
                emptyTitle: 'No saved events yet.',
              ),
              const SizedBox(height: 18),
              _EventsSection(
                title: 'From Followed Organizers',
                items: followed,
                emptyTitle: 'Follow organizers to see their events here.',
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EventsSection extends StatelessWidget {
  const _EventsSection({
    required this.title,
    required this.items,
    this.emptyTitle,
  });

  final String title;
  final List<EventModel> items;
  final String? emptyTitle;

  @override
  Widget build(BuildContext context) {
    final headline = title == 'Saved Events'
        ? 'Your saved picks'
        : title == 'From Followed Organizers'
            ? 'From organizers you trust'
            : null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.h3),
                  if (headline != null) ...[
                    const SizedBox(height: 4),
                    Text(headline, style: AppTextStyles.bodyMuted),
                  ],
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (items.isEmpty)
          EmptyStateView(
            title: emptyTitle ?? 'No events found.',
            body: 'Try another filter.',
          )
        else
          ...items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: EventCard(event: item),
              )),
      ],
    );
  }
}
