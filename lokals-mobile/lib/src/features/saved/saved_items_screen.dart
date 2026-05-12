import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class SavedItemsScreen extends ConsumerWidget {
  const SavedItemsScreen({super.key});

  static const _groups = [
    ('products', 'Products'),
    ('events', 'Events'),
    ('accommodations', 'Accommodation'),
    ('providers', 'Providers'),
    ('directory', 'Directory'),
    ('news', 'News'),
    ('listings', 'Listings'),
  ];

  String _resolveRoute(String route) {
    if (route.startsWith('/marketplace/')) {
      return '/marketplace';
    }
    return route;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedItems = ref.watch(savedItemsProvider);

    return LokalsShell(
      title: 'Saved items',
      showBack: true,
      child: savedItems.when(
        data: (payload) {
          final items = payload['items'] as List<dynamic>? ?? const [];
          if (items.isEmpty) {
            return const Center(
              child: EmptyStateView(
                title: 'Nothing saved yet.',
                body:
                    'Save products, accommodation, events, and local providers to find them here later.',
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: _groups.map((group) {
              final entries = (payload[group.$1] as List<dynamic>? ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList();
              if (entries.isEmpty) {
                return const SizedBox.shrink();
              }

              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: AppCard(
                  color: AppColors.purpleSoftAlt,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(group.$2, style: AppTextStyles.h3),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '${entries.length}',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.primaryPurple,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ...entries.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(18),
                            onTap: () => context.go(
                              _resolveRoute(item['route']?.toString() ?? '/'),
                            ),
                            child: Ink(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 4,
                                ),
                                title: Text(
                                  item['title']?.toString() ?? 'Saved item',
                                ),
                                subtitle: Text(
                                  [
                                    item['subtitle']?.toString(),
                                    item['area']?.toString(),
                                    item['town']?.toString(),
                                  ]
                                      .whereType<String>()
                                      .where((entry) => entry.isNotEmpty)
                                      .join(' - '),
                                ),
                                trailing: const Icon(
                                  Icons.chevron_right_rounded,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        },
        loading: () => const Center(
          child: LokalsLoadingScreen(
            title: 'Loading saved items',
            message:
                'Pulling together your saved products, places, and updates...',
          ),
        ),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Saved items unavailable',
            body: 'Please try again in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(savedItemsProvider),
            ),
          ),
        ),
      ),
    );
  }
}
