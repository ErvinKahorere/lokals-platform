import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class SearchResultsScreen extends ConsumerStatefulWidget {
  const SearchResultsScreen({super.key, this.initialQuery = ''});

  final String initialQuery;

  @override
  ConsumerState<SearchResultsScreen> createState() =>
      _SearchResultsScreenState();
}

class _SearchResultsScreenState extends ConsumerState<SearchResultsScreen> {
  late final TextEditingController _controller;

  static const _sections = [
    ('services', 'Services', '/services', 'name'),
    ('providers', 'Providers', '/services', 'name'),
    ('directory', 'Directory', '/directory', 'name'),
    ('products', 'Products', '/store', 'title'),
    ('jobs', 'Jobs', '/jobs', 'title'),
    ('events', 'Events', '/events', 'title'),
    ('news', 'News', '/news', 'title'),
    ('accommodations', 'Accommodation', '/accommodation', 'title'),
  ];

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialQuery);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _detailRoute(String group, Map<String, dynamic> item, String query) {
    final id = item['id']?.toString();
    if (id == null || id.isEmpty) {
      return '/search?q=${Uri.encodeComponent(query)}';
    }

    switch (group) {
      case 'providers':
        return '/services/$id';
      case 'directory':
        return '/directory/$id';
      case 'products':
        return '/store/$id';
      case 'jobs':
        return '/jobs/$id';
      case 'events':
        return '/events/$id';
      case 'news':
        return '/news/$id';
      case 'accommodations':
        return '/accommodation/$id';
      case 'services':
      default:
        final providerId = item['service_provider_id']?.toString();
        if (providerId != null && providerId.isNotEmpty) {
          return '/services/$providerId';
        }
        return '/services?q=${Uri.encodeComponent(query)}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final query = _controller.text.trim();
    final results = ref.watch(searchResultsProvider(query));

    return LokalsShell(
      title: 'Search',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          AppSearchBar(
            controller: _controller,
            hintText: 'Search services, jobs, products...',
            recentKey: 'global-results',
            onValueSelected: (_) => setState(() {}),
            suggestions: const [
              'Barber nearby',
              'Jobs in Windhoek',
              'Events this weekend',
              'Local news',
            ],
            shortcuts: const ['Services', 'Jobs', 'Products', 'Events'],
          ),
          const SizedBox(height: 16),
          if (query.isEmpty)
            const EmptyStateView(
              title: 'Search across LOKALS',
              body:
                  'Services, providers, products, jobs, events, news, and accommodation will appear here.',
            )
          else
            results.when(
              data: (payload) => Column(
                children: _sections.map((section) {
                  final items = (payload[section.$1] as List<dynamic>? ??
                          const [])
                      .map((item) => Map<String, dynamic>.from(item as Map))
                      .toList();
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  section.$2,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.go(
                                  '${section.$3}?q=${Uri.encodeComponent(query)}',
                                ),
                                child: const Text('View all'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          if (items.isEmpty)
                            const Text(
                              'No matches in this section.',
                              style: TextStyle(color: Colors.grey),
                            )
                          else
                            ...items.take(4).map((item) {
                              final subtitle = [
                                item['category']?.toString(),
                                item['area']?.toString(),
                                item['town']?.toString(),
                                item['location']?.toString(),
                                item['source_name']?.toString(),
                              ]
                                  .whereType<String>()
                                  .where((value) => value.isNotEmpty)
                                  .join(' | ');
                              return ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text(
                                  item[section.$4]?.toString() ??
                                      item['title']?.toString() ??
                                      item['name']?.toString() ??
                                      'Result',
                                ),
                                subtitle: Text(
                                  subtitle.isEmpty
                                      ? 'Open details'
                                      : subtitle,
                                ),
                                onTap: () => context.go(
                                  _detailRoute(section.$1, item, query),
                                ),
                              );
                            }),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
              loading: () => const LoadingSkeleton(height: 180),
              error: (error, _) => EmptyStateView(
                title: 'Search unavailable',
                body: 'Please try again in a moment.',
                action: AppButton(
                  label: 'Retry',
                  expanded: false,
                  onPressed: () =>
                      ref.invalidate(searchResultsProvider(query)),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
