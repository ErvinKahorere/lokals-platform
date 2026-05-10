import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class LoadingSkeleton extends StatefulWidget {
  const LoadingSkeleton({
    super.key,
    this.height = 14,
    this.width = double.infinity,
    this.radius = 999,
  });

  final double height;
  final double width;
  final double radius;

  @override
  State<LoadingSkeleton> createState() => _LoadingSkeletonState();
}

class _LoadingSkeletonState extends State<LoadingSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final base = Color.lerp(AppColors.border, AppColors.softBackground, _controller.value) ?? AppColors.border;
        return Container(
          height: widget.height,
          width: widget.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.radius),
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                base.withValues(alpha: 0.92),
                Colors.white,
                base.withValues(alpha: 0.92),
              ],
            ),
          ),
        );
      },
    );
  }
}

class LokalsInlineLoader extends StatelessWidget {
  const LokalsInlineLoader({
    super.key,
    this.label = 'Loading',
    this.color = AppColors.primaryPurple,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(
            strokeWidth: 2.2,
            color: color,
          ),
        ),
        const SizedBox(width: 10),
        Text(
          label,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class LokalsButtonLoader extends StatelessWidget {
  const LokalsButtonLoader({
    super.key,
    this.label = 'Processing...',
    this.color = Colors.white,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          height: 18,
          width: 18,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: color,
          ),
        ),
        const SizedBox(width: 10),
        Text(label),
      ],
    );
  }
}

class LokalsSkeletonCard extends StatelessWidget {
  const LokalsSkeletonCard({
    super.key,
    this.showMedia = true,
  });

  final bool showMedia;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showMedia) ...[
            const LoadingSkeleton(height: 120, radius: 20),
            const SizedBox(height: 14),
          ],
          const LoadingSkeleton(height: 12, width: 96),
          const SizedBox(height: 12),
          const LoadingSkeleton(height: 22, width: 180, radius: 14),
          const SizedBox(height: 10),
          const LoadingSkeleton(height: 12, width: double.infinity, radius: 12),
          const SizedBox(height: 8),
          const LoadingSkeleton(height: 12, width: 210, radius: 12),
          const SizedBox(height: 16),
          Row(
            children: const [
              Expanded(child: LoadingSkeleton(height: 42, radius: 16)),
              SizedBox(width: 12),
              Expanded(child: LoadingSkeleton(height: 42, radius: 16)),
            ],
          ),
        ],
      ),
    );
  }
}

class LokalsSkeletonList extends StatelessWidget {
  const LokalsSkeletonList({
    super.key,
    this.count = 3,
    this.showMedia = true,
  });

  final int count;
  final bool showMedia;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        count,
        (index) => Padding(
          padding: EdgeInsets.only(bottom: index == count - 1 ? 0 : 12),
          child: LokalsSkeletonCard(showMedia: showMedia),
        ),
      ),
    );
  }
}

class LokalsLoadingScreen extends StatelessWidget {
  const LokalsLoadingScreen({
    super.key,
    this.title = 'Loading LOKALS',
    this.message = 'Bringing your city into view...',
    this.showLogo = true,
  });

  final String title;
  final String message;
  final bool showLogo;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (showLogo)
              Container(
                width: 86,
                height: 86,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primaryPurple,
                      AppColors.deepPurple,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryPurple.withValues(alpha: 0.22),
                      blurRadius: 22,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(18),
                child: Image.asset('assets/brand/lokals-icon.png'),
              ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.deepCharcoal,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(
                color: AppColors.mutedText,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 18),
            const LokalsInlineLoader(),
          ],
        ),
      ),
    );
  }
}
