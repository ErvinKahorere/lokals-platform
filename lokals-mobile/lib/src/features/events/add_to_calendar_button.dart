import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../widgets/cards.dart';

class AddToCalendarButton extends StatelessWidget {
  const AddToCalendarButton({super.key, required this.icsUrl});

  final String? icsUrl;

  @override
  Widget build(BuildContext context) {
    return AppButton(
      label: 'Add to calendar',
      expanded: false,
      variant: AppButtonVariant.secondary,
      onPressed: icsUrl == null
          ? null
          : () async {
              final uri = Uri.tryParse(icsUrl!);
              if (uri == null) return;
              final launched = await launchUrl(uri, mode: LaunchMode.platformDefault);
              if (!context.mounted) return;
              if (!launched) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Unable to open the calendar file right now. Try again from My Tickets or your browser.')),
                );
              }
            },
    );
  }
}
