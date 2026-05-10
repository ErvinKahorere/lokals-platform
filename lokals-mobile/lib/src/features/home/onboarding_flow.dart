import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../config/app_config.dart';
import '../../../shared/widgets/app_button.dart';

class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({super.key, required this.onComplete});

  final VoidCallback onComplete;

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
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
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: widget.onComplete,
                      child: const Text(
                        'Login',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const Spacer(),
                  Container(
                    width: 104,
                    height: 104,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                    ),
                    padding: const EdgeInsets.all(22),
                    child: Image.asset('assets/brand/lokals-icon.png'),
                  ),
                  const SizedBox(height: 22),
                  Image.asset('assets/brand/lokals-logo.png', height: 42, color: Colors.white),
                  const SizedBox(height: 12),
                  const Text(
                    'Everything in your town',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '${AppConfig.pilotLocationMessage} Services, jobs, transport, safety, shopping, and local updates all stay in one simple flow.',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.body.copyWith(
                      color: Colors.white.withValues(alpha: 0.82),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    alignment: WrapAlignment.center,
                    children: [
                      _InfoChip(label: AppConfig.pilotTown),
                      const _InfoChip(label: 'Phone-first'),
                      const _InfoChip(label: 'Guest browsing'),
                    ],
                  ),
                  const Spacer(),
                  AppButton(
                    label: 'Enter LOKALS',
                    variant: AppButtonVariant.secondary,
                    onPressed: widget.onComplete,
                  ),
                  const SizedBox(height: 14),
                  TextButton(
                    onPressed: widget.onComplete,
                    child: const Text(
                      'Continue as guest',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                    ),
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
