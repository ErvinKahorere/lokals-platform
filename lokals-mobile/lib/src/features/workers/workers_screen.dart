import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/experience/contact_actions.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class WorkersScreen extends ConsumerWidget {
  const WorkersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workers = ref.watch(workersProvider);
    final organizations = ref.watch(directoryProvider);

    return LokalsShell(
      title: 'Workers',
      child: workers.when(
        data: (items) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const SectionTitle(
              title: 'Workers and local directory',
              subtitle: 'Quick discovery for gigs, providers, and organizations.',
            ),
            const SizedBox(height: 14),
            ...items.map(
              (worker) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GestureDetector(
                  onTap: () => context.push('/workers/${worker.id}'),
                  child: LokalsCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          worker.headline,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(worker.name ?? 'Local worker'),
                        const SizedBox(height: 8),
                        Text(
                          '${worker.location ?? 'Local area'} - ${worker.rate != null ? 'N\$ ${worker.rate}' : 'Rate on request'}',
                          style: const TextStyle(color: Colors.black54),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          worker.skills.isEmpty
                              ? 'General assistance'
                              : worker.skills.join(', '),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            const SectionTitle(title: 'Organizations'),
            const SizedBox(height: 12),
            organizations.when(
              data: (items) => Column(
                children: items
                    .map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: LokalsCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    child: Text(item.name.characters.first.toUpperCase()),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                                        const SizedBox(height: 4),
                                        Text(item.category, style: const TextStyle(color: Color(0xFF64748B))),
                                      ],
                                    ),
                                  ),
                                  AppBadge(
                                    label: item.isVerified ? 'Verified' : 'Directory',
                                    tone: item.isVerified ? AppBadgeTone.success : AppBadgeTone.info,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                '${item.location ?? 'Local'} - ${getDisplayDistance(item.distanceKm, item.location)}',
                                style: const TextStyle(color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 12),
                              ContactActions(name: item.name, phone: item.phone),
                            ],
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
              loading: () => const Padding(
                padding: EdgeInsets.all(12),
                child: CircularProgressIndicator(),
              ),
              error: (error, _) => Text('Directory failed: $error'),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) =>
            Center(child: Text('Failed to load workers: $error')),
      ),
    );
  }
}
