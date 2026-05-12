import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    super.key,
    required this.imageUrl,
    required this.fallbackIcon,
    this.borderRadius,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.backgroundColor = AppColors.neutralSoft,
  });

  final String? imageUrl;
  final IconData fallbackIcon;
  final BorderRadius? borderRadius;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      width: width,
      height: height,
      color: backgroundColor,
      child: Center(
        child: Icon(fallbackIcon, size: 40, color: AppColors.primaryPurple),
      ),
    );

    final normalized = imageUrl?.trim();
    final hasImage = normalized != null && normalized.isNotEmpty;

    final child = hasImage
        ? Image.network(
            normalized,
            width: width,
            height: height,
            fit: fit,
            errorBuilder: (context, error, stackTrace) => fallback,
            loadingBuilder: (context, child, progress) {
              if (progress == null) {
                return child;
              }

              return Container(
                width: width,
                height: height,
                color: backgroundColor,
                child: const Center(
                  child: SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2.2),
                  ),
                ),
              );
            },
          )
        : fallback;

    if (borderRadius == null) {
      return child;
    }

    return ClipRRect(
      borderRadius: borderRadius!,
      child: child,
    );
  }
}

class AppAvatarImage extends StatelessWidget {
  const AppAvatarImage({
    super.key,
    required this.name,
    this.imageUrl,
    this.radius = 24,
    this.backgroundColor = AppColors.purpleSoftAlt,
    this.foregroundColor = AppColors.primaryPurple,
  });

  final String name;
  final String? imageUrl;
  final double radius;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().isEmpty
        ? 'L'
        : name
            .trim()
            .split(RegExp(r'\s+'))
            .where((part) => part.isNotEmpty)
            .take(2)
            .map((part) => part.characters.first.toUpperCase())
            .join();
    final normalized = imageUrl?.trim();
    final hasImage = normalized != null && normalized.isNotEmpty;

    return CircleAvatar(
      radius: radius,
      backgroundColor: backgroundColor,
      child: ClipOval(
        child: hasImage
            ? Image.network(
                normalized,
                width: radius * 2,
                height: radius * 2,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => _AvatarFallback(
                  initials: initials,
                  radius: radius,
                  foregroundColor: foregroundColor,
                ),
              )
            : _AvatarFallback(
                initials: initials,
                radius: radius,
                foregroundColor: foregroundColor,
              ),
      ),
    );
  }
}

class _AvatarFallback extends StatelessWidget {
  const _AvatarFallback({
    required this.initials,
    required this.radius,
    required this.foregroundColor,
  });

  final String initials;
  final double radius;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: radius * 2,
      height: radius * 2,
      child: Center(
        child: Text(
          initials,
          style: AppTextStyles.h3.copyWith(color: foregroundColor),
        ),
      ),
    );
  }
}
