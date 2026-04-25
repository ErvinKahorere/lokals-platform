import 'package:flutter/material.dart';

class ContactActionService {
  const ContactActionService();

  void showCallPlaceholder(BuildContext context, String phone) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Call support is being connected. Use $phone for now.')),
    );
  }
}

