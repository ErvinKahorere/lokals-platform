import 'package:flutter/material.dart';

import '../../../src/services/contact_action_service.dart';
import '../app_button.dart';

class QuickCallButton extends StatelessWidget {
  const QuickCallButton({super.key, this.phone});

  final String? phone;

  @override
  Widget build(BuildContext context) {
    return AppButton(
      label: 'Call',
      variant: AppButtonVariant.secondary,
      expanded: false,
      onPressed: phone == null || phone!.isEmpty
          ? null
          : () => const ContactActionService().showCallPlaceholder(context, phone!),
    );
  }
}
