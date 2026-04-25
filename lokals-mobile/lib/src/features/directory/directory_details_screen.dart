import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class DirectoryDetailsScreen extends ConsumerWidget {
  const DirectoryDetailsScreen({super.key, required this.directoryId});

  final String directoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final details = ref.watch(directoryDetailsProvider(directoryId));

    return LokalsShell(
      title: 'Directory details',
      showBack: true,
      child: details.when(
        data: (item) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            SectionTitle(
              title: item.name,
              subtitle: item.description ?? 'Trusted local directory profile.',
            ),
            const SizedBox(height: 16),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.category, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text(
                    [item.area, item.town, item.location].whereType<String>().where((value) => value.isNotEmpty).join(', '),
                    style: const TextStyle(color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 8),
                  Text(item.phone ?? 'Call details inside profile'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Services offered', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  if (item.servicesOffered.isEmpty)
                    const Text('This directory profile is still adding service details.')
                  else
                    ...item.servicesOffered.map(
                      (service) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text('• $service'),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Directory details unavailable: $error')),
      ),
    );
  }
}
