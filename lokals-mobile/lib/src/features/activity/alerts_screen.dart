import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class AlertsScreen extends ConsumerWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alerts = ref.watch(alertsFeedProvider);
    final notifications = ref.watch(notificationsProvider);

    return LokalsShell(
      title: 'Alerts',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(
            children: [
              const Expanded(
                child: SectionTitle(
                  title: 'Alerts and notifications',
                  subtitle: 'City alerts, followed updates, and account notifications in one place.',
                ),
              ),
              AppButton(
                label: 'Mark all read',
                expanded: false,
                variant: AppButtonVariant.secondary,
                onPressed: () async {
                  await ref.read(discoveryRepositoryProvider).markAllNotificationsRead();
                  ref.invalidate(notificationsProvider);
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          notifications.when(
            data: (items) => items.isEmpty
                ? const EmptyStateView(
                    title: 'No notifications yet',
                    body: 'Updates will appear here when activity reaches your account.',
                  )
                : Column(
                    children: items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: LokalsCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 8),
                            Text(item.body),
                          ],
                        ),
                      ),
                    )).toList(),
                  ),
            loading: () => const LoadingSkeleton(height: 120),
            error: (error, _) => Text('Notifications unavailable: $error'),
          ),
          const SizedBox(height: 16),
          alerts.when(
            data: (items) => items.isEmpty
                ? const EmptyStateView(
                    title: 'No alerts nearby',
                    body: 'City and area alerts will appear here.',
                  )
                : Column(
                    children: items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: LokalsCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 8),
                            Text(item.body),
                            const SizedBox(height: 8),
                            Text(item.location ?? 'Windhoek', style: const TextStyle(color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                    )).toList(),
                  ),
            loading: () => const LoadingSkeleton(height: 120),
            error: (error, _) => Text('Alerts unavailable: $error'),
          ),
        ],
      ),
    );
  }
}
