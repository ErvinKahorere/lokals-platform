import 'package:flutter/material.dart';

import '../../../src/services/contact_action_service.dart';
import '../app_button.dart';
import 'message_placeholder_sheet.dart';
import 'quick_call_button.dart';

class ContactActions extends StatelessWidget {
  const ContactActions({
    super.key,
    required this.name,
    this.phone,
    this.whatsapp,
    this.whatsappMessage,
    this.compact = false,
  });

  final String name;
  final String? phone;
  final String? whatsapp;
  final String? whatsappMessage;
  final bool compact;

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
          compact: compact,
          onPressed: () => showMessagePlaceholderSheet(context, name: name, phone: phone),
        ),
        QuickCallButton(phone: phone, compact: compact),
        AppButton(
          label: 'WhatsApp',
          variant: AppButtonVariant.secondary,
          expanded: false,
          compact: compact,
          onPressed: whatsapp == null && phone == null
              ? () => showMessagePlaceholderSheet(context, name: name, phone: whatsapp ?? phone)
              : () => ContactActionService().openWhatsApp(context, phone: whatsapp ?? phone ?? '', name: name, message: whatsappMessage),
        ),
      ],
    );
  }
}
