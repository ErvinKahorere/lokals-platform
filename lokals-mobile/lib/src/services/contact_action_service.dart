import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/experience_helpers.dart';

class ContactActionService {
  const ContactActionService();

  Future<void> call(BuildContext context, String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
      return;
    }

    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Calling is not available right now. Please use $phone.')),
    );
  }

  Future<void> openWhatsApp(BuildContext context, {required String phone, String? name, String? message}) async {
    final href = buildWhatsAppUrl(phone, name: name, message: message);
    if (href == null) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('WhatsApp is not available for this provider yet.')),
      );
      return;
    }

    final uri = Uri.parse(href);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      return;
    }

    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Could not open WhatsApp right now.')),
    );
  }
}
