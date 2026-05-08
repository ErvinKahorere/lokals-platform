import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
  ];

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
                body: 'Save products, accommodation, events, and local providers to find them here later.',
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(group.$2, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      ...entries.map((item) => ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(item['title']?.toString() ?? 'Saved item'),
                            subtitle: Text([
                              item['subtitle']?.toString(),
                              item['area']?.toString(),
                              item['town']?.toString(),
                            ].whereType<String>().where((entry) => entry.isNotEmpty).join(' • ')),
                            onTap: () => context.go(item['route']?.toString() ?? '/'),
                          )),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
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
