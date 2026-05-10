import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/worker_card.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class WorkersScreen extends ConsumerStatefulWidget {
  const WorkersScreen({super.key});

  @override
  ConsumerState<WorkersScreen> createState() => _WorkersScreenState();
}

class _WorkersScreenState extends ConsumerState<WorkersScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final workers = ref.watch(workersProvider);

    return LokalsShell(
      title: 'Workers',
      child: workers.when(
        data: (items) {
          final query = _searchController.text.trim().toLowerCase();
          final filtered = items.where((worker) {
            return query.isEmpty ||
                worker.headline.toLowerCase().contains(query) ||
                (worker.name?.toLowerCase().contains(query) ?? false) ||
                worker.skills.any((skill) => skill.toLowerCase().contains(query));
          }).toList();

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            children: [
              const SectionTitle(
                title: 'Available workers',
                subtitle: 'Browse local people who are ready to help with quick jobs and ongoing support.',
              ),
              const SizedBox(height: 16),
              AppSearchBar(
                controller: _searchController,
                hintText: 'Search workers...',
                recentKey: 'workers',
                suggestions: const ['Cleaner', 'Painter', 'Driver', 'Tutor'],
                shortcuts: const ['Available now', 'Verified', 'Near me'],
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 16),
              if (filtered.isEmpty)
                const EmptyStateView(
                  title: 'No workers found nearby',
                  body: 'No workers found nearby. Try another skill.',
                )
              else
                ...filtered.map(
                  (worker) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: WorkerCard(worker: worker),
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: EmptyStateView(
            title: 'Workers could not load',
            body: 'Please retry in a moment.',
            action: AppButton(
              label: 'Retry',
              expanded: false,
              onPressed: () => ref.invalidate(workersProvider),
            ),
          ),
        ),
      ),
    );
  }
}
