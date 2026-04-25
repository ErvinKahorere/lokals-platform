import 'package:flutter/material.dart';

import '../app_button.dart';
import 'message_placeholder_sheet.dart';
import 'quick_call_button.dart';

class ContactActions extends StatelessWidget {
  const ContactActions({
    super.key,
    required this.name,
    this.phone,
  });

  final String name;
  final String? phone;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        AppButton(
          label: 'Message',
          variant: AppButtonVariant.secondary,
          expanded: false,
          onPressed: () => showMessagePlaceholderSheet(context, name: name, phone: phone),
        ),
        QuickCallButton(phone: phone),
        AppButton(
          label: 'WhatsApp soon',
          variant: AppButtonVariant.secondary,
          expanded: false,
          onPressed: () => showMessagePlaceholderSheet(context, name: name, phone: phone),
        ),
      ],
    );
  }
}

