import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MobileBottomNav extends StatelessWidget {
  const MobileBottomNav({super.key, required this.currentIndex});

  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: NavigationBar(
          selectedIndex: currentIndex,
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.home_repair_service_outlined), label: 'Services'),
            NavigationDestination(icon: Icon(Icons.work_outline), label: 'Work'),
            NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Market'),
            NavigationDestination(icon: Icon(Icons.person_outline_rounded), label: 'Profile'),
          ],
          onDestinationSelected: (index) {
            switch (index) {
              case 0:
                context.go('/');
                break;
              case 1:
                context.go('/services');
                break;
              case 2:
                context.go('/jobs');
                break;
              case 3:
                context.go('/store');
                break;
              case 4:
                context.go('/profile');
                break;
            }
          },
        ),
      ),
    );
  }
}
