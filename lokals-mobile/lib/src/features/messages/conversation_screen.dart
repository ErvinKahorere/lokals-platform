import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class ConversationScreen extends ConsumerStatefulWidget {
  const ConversationScreen({super.key, required this.id});

  final String id;

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final _controller = TextEditingController();
  bool _isSending = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final conversation = ref.watch(conversationProvider(widget.id));
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;

    return LokalsShell(
      title: 'Conversation',
      showBack: true,
      child: ListView(
        padding: EdgeInsets.fromLTRB(20, 20, 20, safeBottom + 96),
        children: [
          conversation.when(
            data: (payload) {
              final data = Map<String, dynamic>.from((payload['data'] as Map?) ?? payload);
              final messages = ((data['messages'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList();

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SectionTitle(
                    eyebrow: 'Messages',
                    title: data['subject']?.toString() ?? 'Conversation',
                    subtitle: 'Live-ready messaging for marketplace, service, project, and support threads.',
                  ),
                  const SizedBox(height: 16),
                  ...messages.map((message) {
                    final isOwn = message['user_id'] != null;
                    return Align(
                      alignment: isOwn ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        constraints: const BoxConstraints(maxWidth: 320),
                        decoration: BoxDecoration(
                          color: isOwn ? AppColors.primaryPurple : AppColors.softBackground,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          message['body']?.toString() ?? '',
                          style: TextStyle(color: isOwn ? Colors.white : AppColors.deepCharcoal),
                        ),
                      ),
                    );
                  }),
                  const SizedBox(height: 12),
                  LokalsCard(
                    child: Column(
                      children: [
                        LokalsTextField(
                          controller: _controller,
                          label: 'Message',
                          hint: 'Write a reply',
                          maxLines: 4,
                        ),
                        const SizedBox(height: 12),
                        AppButton(
                          label: _isSending ? 'Sending...' : 'Send message',
                          onPressed: _isSending ? null : () => _sendMessage(int.parse(widget.id)),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
            loading: () => const LokalsLoadingScreen(title: 'Loading conversation', message: 'Opening your latest thread...'),
            error: (error, _) => EmptyStateView(
              title: 'Conversation unavailable',
              body: 'Please try again in a moment.',
              action: AppButton(label: 'Retry', onPressed: () => ref.invalidate(conversationProvider(widget.id))),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendMessage(int id) async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSending = true);
    try {
      await ref.read(discoveryRepositoryProvider).sendConversationMessage(
            conversationId: id,
            body: text,
          );
      _controller.clear();
      ref.invalidate(conversationProvider(widget.id));
      ref.invalidate(conversationsProvider);
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
      }
    }
  }
}
