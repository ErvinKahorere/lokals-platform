import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../config/app_config.dart';
import '../../../shared/widgets/app_button.dart';

class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({
    super.key,
    required this.onGetStarted,
    required this.onSkip,
    required this.onLogin,
  });

  final VoidCallback onGetStarted;
  final VoidCallback onSkip;
  final VoidCallback onLogin;

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
  final _controller = PageController();
  int _index = 0;

  static const _slides = [
    (
      icon: Icons.location_city_rounded,
      title: 'Everything in your city',
      subtitle: 'Find services, jobs, events, alerts and help around Okahandja.',
    ),
    (
      icon: Icons.handshake_outlined,
      title: 'Get help nearby',
      subtitle: 'Book trusted providers, find public services, and contact local businesses.',
    ),
    (
      icon: Icons.notifications_active_outlined,
      title: 'Stay connected',
      subtitle: 'Receive alerts, local news, events and town updates.',
    ),
    (
      icon: Icons.place_outlined,
      title: 'Built for Okahandja',
      subtitle: 'LOKALS is currently piloting in Okahandja.',
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _next() async {
    if (_index == _slides.length - 1) {
      widget.onGetStarted();
      return;
    }

    await _controller.nextPage(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.primaryPurple,
            AppColors.deepPurple,
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: -30,
            top: 100,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            right: -50,
            bottom: 140,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 130,
            child: SizedBox(
              height: 120,
              child: CustomPaint(painter: _SkylinePainter()),
            ),
          ),
          SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 18, 24, 28),
                child: Column(
                  children: [
                    Row(
                      children: [
                        TextButton(
                          onPressed: widget.onSkip,
                          child: const Text(
                            'Skip',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                          ),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed: widget.onLogin,
                          child: const Text(
                            'Login',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                    Expanded(
                      child: PageView.builder(
                        controller: _controller,
                        itemCount: _slides.length,
                        onPageChanged: (index) => setState(() => _index = index),
                        itemBuilder: (context, index) {
                          final slide = _slides[index];
                          return Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 240),
                                width: 112,
                                height: 112,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(34),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.08),
                                      blurRadius: 28,
                                      offset: const Offset(0, 12),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  slide.icon,
                                  color: Colors.white,
                                  size: 44,
                                ),
                              ),
                              const SizedBox(height: 24),
                              Image.asset('assets/brand/lokals-logo.png', height: 42, color: Colors.white),
                              const SizedBox(height: 20),
                              Text(
                                slide.title,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  height: 1.1,
                                ),
                              ),
                              const SizedBox(height: 14),
                              Text(
                                slide.subtitle,
                                textAlign: TextAlign.center,
                                style: AppTextStyles.body.copyWith(
                                  color: Colors.white.withValues(alpha: 0.85),
                                  fontSize: 16,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 20),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                alignment: WrapAlignment.center,
                                children: [
                                  _InfoChip(label: AppConfig.pilotTown),
                                  const _InfoChip(label: 'Purple local flow'),
                                  const _InfoChip(label: 'Guest browsing'),
                                ],
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _slides.length,
                        (index) => AnimatedContainer(
                          duration: const Duration(milliseconds: 220),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          height: 10,
                          width: index == _index ? 30 : 10,
                          decoration: BoxDecoration(
                            color: index == _index ? Colors.white : Colors.white.withValues(alpha: 0.32),
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    AppButton(
                      label: _index == _slides.length - 1 ? 'Get Started' : 'Next',
                      variant: AppButtonVariant.secondary,
                      onPressed: _next,
                    ),
                    const SizedBox(height: 14),
                    const LokalsInlineLoader(
                      label: 'Smooth start for Okahandja',
                      color: Colors.white,
                    ),
                  ],
                ),
              ),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: 12,
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
    for (var i = 0; i < widths.length; i++) {
      final height = 26.0 + (i % 4) * 18;
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, size.height - height, widths[i], height),
          const Radius.circular(4),
        ),
        paint,
      );
      x += widths[i] + 10;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
