import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class InboxScreen extends ConsumerWidget {
  const InboxScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversations = ref.watch(conversationsProvider);

    return LokalsShell(
      title: 'Inbox',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const SectionTitle(
            eyebrow: 'Messages',
            title: 'Inbox',
            subtitle: 'Marketplace chats, service requests, support replies, and local collaboration in one place.',
          ),
          const SizedBox(height: 16),
          conversations.when(
            data: (items) {
              if (items.isEmpty) {
                return const EmptyStateView(
                  title: 'No conversations yet',
                  body: 'Messages from marketplace, services, projects, and support will appear here.',
                );
              }

              return Column(
                children: items.map((item) {
                  final lastMessage = Map<String, dynamic>.from((item['last_message'] as Map?) ?? const {});
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(22),
                      onTap: () => context.go('/conversations/${item['id']}'),
                      child: LokalsCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                AppBadge(label: (item['context']?.toString() ?? 'general').replaceAll('_', ' '), tone: AppBadgeTone.brand),
                                const Spacer(),
                                AppBadge(label: item['status']?.toString() ?? 'active'),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(item['subject']?.toString() ?? 'Conversation', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 8),
                            Text(lastMessage['body']?.toString() ?? 'Open the thread to continue.', style: AppTextStyles.bodyMuted),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              );
            },
            loading: () => const LokalsLoadingScreen(title: 'Loading inbox', message: 'Checking your latest messages...'),
            error: (error, _) => EmptyStateView(
              title: 'Inbox unavailable',
              body: 'Please try again in a moment.',
              action: AppButton(label: 'Retry', onPressed: () => ref.invalidate(conversationsProvider)),
            ),
          ),
        ],
      ),
    );
  }
}
