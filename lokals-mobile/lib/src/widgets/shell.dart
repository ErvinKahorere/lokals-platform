import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets/demo_mode_banner.dart';
import '../../shared/widgets/mobile_bottom_nav.dart';

class LokalsShell extends StatelessWidget {
  const LokalsShell({
    super.key,
    required this.title,
    required this.child,
    this.showBack = false,
    this.actions,
    this.floatingActionButton,
  });

  final String title;
  final Widget child;
  final bool showBack;
  final List<Widget>? actions;
  final Widget? floatingActionButton;

  int _currentIndex(BuildContext context) {
    final path = GoRouterState.of(context).matchedLocation;
    if (path.startsWith('/services') || path.startsWith('/book')) return 1;
    if (path.startsWith('/jobs') || path.startsWith('/workers')) return 2;
    if (path.startsWith('/marketplace') || path.startsWith('/store')) return 3;
    if (path.startsWith('/more')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(title),
        actions: actions,
        leading: showBack
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new),
                onPressed: () => context.pop(),
              )
            : null,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const DemoModeBanner(),
            Expanded(child: child),
          ],
        ),
      ),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: MobileBottomNav(currentIndex: _currentIndex(context)),
    );
  }
}
