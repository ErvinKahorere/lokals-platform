import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_controller.dart';
import '../auth/auth_navigation.dart';
import '../../widgets/cards.dart';
import '../discovery/discovery_repository.dart';

class SaveEventButton extends ConsumerStatefulWidget {
  const SaveEventButton({super.key, required this.eventId, required this.isSaved});

  final int eventId;
  final bool isSaved;

  @override
  ConsumerState<SaveEventButton> createState() => _SaveEventButtonState();
}

class _SaveEventButtonState extends ConsumerState<SaveEventButton> {
  bool _busy = false;
  late bool _isSaved = widget.isSaved;

  @override
  Widget build(BuildContext context) {
    return AppButton(
      label: _isSaved ? 'Saved' : 'Save event',
      expanded: false,
      variant: _isSaved ? AppButtonVariant.primary : AppButtonVariant.secondary,
      isLoading: _busy,
      onPressed: () async {
        final auth = ref.read(authControllerProvider);
        if (auth.token == null) {
          promptSignIn(
            context,
            next: GoRouterState.of(context).uri.toString(),
          );
          return;
        }
        final messenger = ScaffoldMessenger.of(context);
        setState(() => _busy = true);
        try {
          if (_isSaved) {
            await ref.read(discoveryRepositoryProvider).removeSavedEvent(widget.eventId);
          } else {
            await ref.read(discoveryRepositoryProvider).saveEvent(widget.eventId);
          }
          ref.invalidate(eventsProvider);
          ref.invalidate(eventDetailsProvider(widget.eventId.toString()));
          if (!mounted) return;
          final next = !_isSaved;
          setState(() => _isSaved = next);
          messenger.showSnackBar(
            SnackBar(content: Text(next ? 'Saved' : 'Removed from saved')),
          );
        } finally {
          if (mounted) setState(() => _busy = false);
        }
      },
    );
  }
}
