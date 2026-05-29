import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen> {
  final _messageController = TextEditingController();
  bool _isSending = false;
  int? _conversationId;

  @override
  Widget build(BuildContext context) {
    final conversationsAsync = ref.watch(supportConversationsProvider);
    final messenger = ScaffoldMessenger.of(context);

    return LokalsShell(
      title: 'Help and support',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const SectionTitle(
            eyebrow: 'Support',
            title: 'Ask LOKALS for help',
            subtitle: 'Get guided help for reports, services, rides, deliveries, and town information, then escalate to a human when needed.',
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final prompt in const [
                'How do I report a water leak?',
                'Help me find a taxi',
                'How do I track my request?',
              ])
                ActionChip(
                  label: Text(prompt),
                  onPressed: () => _messageController.text = prompt,
                ),
            ],
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LokalsTextField(
                  controller: _messageController,
                  label: 'Message',
                  hint: 'Ask about reports, services, rides, or town contacts',
                  maxLines: 4,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: _isSending ? 'Sending...' : 'Send',
                        onPressed: _isSending ? null : _sendMessage,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: AppButton(
                        label: 'Escalate',
                        variant: AppButtonVariant.secondary,
                        onPressed: _conversationId == null
                            ? null
                            : () async {
                                await ref.read(discoveryRepositoryProvider).escalateSupportConversation(
                                      conversationId: _conversationId!,
                                      reason: 'Resident asked for human help',
                                    );
                                if (!mounted) return;
                                messenger.showSnackBar(
                                  const SnackBar(content: Text('Support request escalated for human follow-up.')),
                                );
                                ref.invalidate(supportConversationsProvider);
                              },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          conversationsAsync.when(
            data: (items) {
              if (items.isEmpty) {
                return const EmptyStateView(
                  title: 'No support conversations yet',
                  body: 'Start a chat above and LOKALS will guide you to the right feature or service desk.',
                );
              }

              final selected = items.firstWhere(
                (item) => item['id'] == _conversationId,
                orElse: () => items.first,
              );
              _conversationId ??= selected['id'] as int?;
              final messages = ((selected['messages'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList();

              return Column(
                children: messages.map((message) {
                  final isUser = message['sender_type'] == 'user';
                  final metadata = Map<String, dynamic>.from((message['metadata'] as Map?) ?? const {});
                  return Align(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      constraints: const BoxConstraints(maxWidth: 320),
                      decoration: BoxDecoration(
                        color: isUser ? AppColors.primaryPurple : AppColors.softBackground,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            message['body']?.toString() ?? '',
                            style: AppTextStyles.body.copyWith(
                              color: isUser ? Colors.white : AppColors.deepCharcoal,
                            ),
                          ),
                          if ((metadata['route_hint']?.toString() ?? '').isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              'Suggested route: ${metadata['route_hint']}',
                              style: AppTextStyles.caption.copyWith(
                                color: isUser ? Colors.white70 : AppColors.mutedText,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                }).toList(),
              );
            },
            loading: () => const LokalsLoadingScreen(
              title: 'Loading support',
              message: 'Checking your recent support conversations...',
            ),
            error: (error, _) => EmptyStateView(
              title: 'Support unavailable',
              body: 'We could not load support conversations right now.',
              action: AppButton(
                label: 'Retry',
                onPressed: () => ref.invalidate(supportConversationsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSending = true);
    try {
      final response = await ref.read(discoveryRepositoryProvider).sendSupportMessage(
            message: text,
            conversationId: _conversationId,
          );
      _conversationId = response['id'] as int?;
      _messageController.clear();
      ref.invalidate(supportConversationsProvider);
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
      }
    }
  }
}
