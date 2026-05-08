import 'package:flutter/material.dart';

import '../../../src/services/contact_action_service.dart';
import '../../../src/services/messaging_service.dart';
import '../app_button.dart';

Future<void> showMessagePlaceholderSheet(
  BuildContext context, {
  required String name,
  String? phone,
}) {
  final message = const MessagingService().getPlaceholderMessage(name);
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (context) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Contact $name', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            Text(message),
            const SizedBox(height: 16),
            if (phone != null && phone.isNotEmpty)
              AppButton(
                label: 'Call instead',
                expanded: true,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await ContactActionService().call(context, phone);
                },
              ),
          ],
        ),
      );
    },
  );
}
