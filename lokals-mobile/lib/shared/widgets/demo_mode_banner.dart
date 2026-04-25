import 'package:flutter/material.dart';

import '../../src/config/app_config.dart';

class DemoModeBanner extends StatelessWidget {
  const DemoModeBanner({super.key});

  @override
  Widget build(BuildContext context) {
    if (!AppConfig.isDemoMode) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: const Color(0x29FACC15),
      child: const Row(
        children: [
          Icon(Icons.science_outlined, size: 18),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Demo Mode: browsing is live, but new submissions are simulated.',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
