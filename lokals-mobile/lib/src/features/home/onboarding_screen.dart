import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'onboarding_flow.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  static const onboardingKey = 'lokals_onboarding_complete';

  Future<void> _markComplete() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(onboardingKey, true);
  }

  Future<void> _skip(BuildContext context) async {
    await _markComplete();
    if (!context.mounted) return;
    context.go('/home');
  }

  Future<void> _login(BuildContext context) async {
    await _markComplete();
    if (!context.mounted) return;
    context.go('/login');
  }

  Future<void> _register(BuildContext context) async {
    await _markComplete();
    if (!context.mounted) return;
    context.go('/register');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: OnboardingFlow(
        onGetStarted: () => _register(context),
        onSkip: () => _skip(context),
        onLogin: () => _login(context),
      ),
    );
  }
}
