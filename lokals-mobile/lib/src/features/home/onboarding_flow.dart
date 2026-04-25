import 'package:flutter/material.dart';

import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/glass_panel.dart';

class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({super.key, required this.onComplete});

  final VoidCallback onComplete;

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
  int _index = 0;

  static const _slides = [
    (
      Icons.location_city_outlined,
      'Everything in your city.',
      'One app for services, jobs, delivery, alerts, listings, and city life.',
    ),
    (
      Icons.design_services_outlined,
      'Find Help',
      'Book services nearby instantly.',
    ),
    (
      Icons.storefront_outlined,
      'Earn & Sell',
      'Get jobs and sell locally without long forms.',
    ),
    (
      Icons.notifications_active_outlined,
      'Stay Connected',
      'Follow alerts and stay safe.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_index];

    return Container(
      color: Colors.black45,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: GlassPanel(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: Icon(slide.$1, color: Colors.white),
                    ),
                    TextButton(
                      onPressed: widget.onComplete,
                      child: const Text('Skip'),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(slide.$2, style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text(slide.$3, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 18),
                Row(
                  children: List.generate(
                    _slides.length,
                    (index) => Container(
                      width: index == _index ? 28 : 10,
                      height: 10,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        color: index == _index
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).dividerColor,
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                AppButton(
                  label: _index == _slides.length - 1 ? 'Continue' : 'Next',
                  onPressed: () {
                    if (_index == _slides.length - 1) {
                      widget.onComplete();
                      return;
                    }
                    setState(() => _index += 1);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
