import 'package:flutter/material.dart';

import '../../../src/services/contact_action_service.dart';
import '../app_button.dart';

class QuickCallButton extends StatelessWidget {
  const QuickCallButton({super.key, this.phone, this.compact = false});

  final String? phone;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return AppButton(
      label: 'Call',
      variant: AppButtonVariant.secondary,
      expanded: false,
      compact: compact,
      onPressed: phone == null || phone!.isEmpty
          ? null
          : () => ContactActionService().call(context, phone!),
    );
  }
}
