import 'package:flutter/material.dart';

import 'app_card.dart';

class GlassPanel extends StatelessWidget {
  const GlassPanel({super.key, required this.child, this.padding = const EdgeInsets.all(20)});

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      variant: AppCardVariant.dashboard,
      padding: padding,
      child: child,
    );
  }
}
