import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../config/app_config.dart';
import '../../core/role_routing.dart';
import '../auth/auth_controller.dart';
import '../home/onboarding_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  bool? _onboardingComplete;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    _loadOnboardingState();
  }

  Future<void> _loadOnboardingState() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _onboardingComplete = prefs.getBool(OnboardingScreen.onboardingKey) == true;
    });
  }

  void _maybeNavigate(AuthState auth) {
    if (_navigated || !auth.hasRestored || _onboardingComplete == null || auth.isRestoring) {
      return;
    }

    final nextRoute = !_onboardingComplete!
        ? '/onboarding'
        : auth.token == null
            ? '/login'
            : roleHomePath(
                auth.user?.currentRole ??
                    (auth.user?.roles.isNotEmpty == true ? auth.user!.roles.first : null),
              );

    _navigated = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.go(nextRoute);
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    _maybeNavigate(auth);

    final showError = auth.startupError != null && auth.hasRestored;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primaryPurple,
              AppColors.deepPurple,
            ],
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              left: -40,
              top: 90,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              right: -50,
              bottom: 160,
              child: Container(
                width: 210,
                height: 210,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 100,
              child: SizedBox(
                height: 130,
                child: CustomPaint(painter: _SkylinePainter()),
              ),
            ),
            SafeArea(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 108,
                        height: 108,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(32),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 26,
                              offset: const Offset(0, 16),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(22),
                        child: Image.asset('assets/brand/lokals-icon.png'),
                      ),
                      const SizedBox(height: 24),
                      Image.asset('assets/brand/lokals-logo.png', height: 40, color: Colors.white),
                      const SizedBox(height: 14),
                      const Text(
                        'Everything in your city',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text(
                          'Okahandja Pilot',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        showError ? 'Couldn\'t load LOKALS' : 'Everything in your city',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        showError
                            ? 'Check your connection and try again.'
                            : 'Restoring your local city experience.',
                        style: AppTextStyles.body.copyWith(
                          color: Colors.white.withValues(alpha: 0.82),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 22),
                      if (showError) ...[
                        AppButton(
                          label: 'Retry',
                          variant: AppButtonVariant.secondary,
                          onPressed: () async {
                            _navigated = false;
                            await ref.read(authControllerProvider.notifier).restore();
                            await _loadOnboardingState();
                          },
                        ),
                        if (AppConfig.isDemoMode) ...[
                          const SizedBox(height: 12),
                          AppButton(
                            label: 'Continue offline/demo',
                            variant: AppButtonVariant.accent,
                            onPressed: () => context.go('/home'),
                          ),
                        ],
                      ] else ...[
                        const LokalsInlineLoader(
                          label: 'Loading LOKALS',
                          color: Colors.white,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SkylinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.1);
    final widths = [26.0, 38.0, 18.0, 28.0, 22.0, 34.0, 24.0, 42.0];
    double x = 0;
    for (var index = 0; index < widths.length; index++) {
      final height = 26.0 + (index % 4) * 18;
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, size.height - height, widths[index], height),
          const Radius.circular(4),
        ),
        paint,
      );
      x += widths[index] + 10;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
