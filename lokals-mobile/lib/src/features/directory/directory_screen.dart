import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class DirectoryScreen extends ConsumerWidget {
  const DirectoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final directory = ref.watch(directoryProvider);

    return LokalsShell(
      title: 'Directory',
      showBack: true,
      child: directory.when(
        data: (items) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const SectionTitle(
              title: 'Trusted local directory',
              subtitle: 'Police, clinics, schools, businesses, and public services.',
            ),
            const SizedBox(height: 16),
            if (items.isEmpty)
              const EmptyStateView(
                title: 'No services nearby',
                body: 'Try changing your location.',
              )
            else
              ...items.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                        child: LokalsCard(
                          child: InkWell(
                            onTap: () => context.push('/directory/${item.id}'),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 6),
                                Text(item.category),
                                const SizedBox(height: 6),
                                Text(item.location ?? 'Windhoek', style: const TextStyle(color: Color(0xFF64748B))),
                              ],
                            ),
                          ),
                        ),
                ),
              ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Directory unavailable: $error')),
      ),
    );
  }
}
