import 'package:flutter/material.dart';

import 'distance_pill.dart';
import 'rating_pill.dart';
import 'verified_badge.dart';

class TrustRow extends StatelessWidget {
  const TrustRow({
    super.key,
    required this.ratingLabel,
    required this.distanceLabel,
    this.verified = false,
    this.completedLabel,
    this.responseLabel,
  });

  final bool verified;
  final String ratingLabel;
  final String distanceLabel;
  final String? completedLabel;
  final String? responseLabel;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        VerifiedBadge(verified: verified),
        RatingPill(label: ratingLabel),
        DistancePill(label: distanceLabel),
        if (completedLabel != null)
          _MiniPill(label: completedLabel!, color: const Color(0xFFDCFCE7), textColor: const Color(0xFF166534)),
        if (responseLabel != null)
          _MiniPill(label: responseLabel!, color: const Color(0xFFDBEAFE), textColor: const Color(0xFF1D4ED8)),
      ],
    );
  }
}

class _MiniPill extends StatelessWidget {
  const _MiniPill({
    required this.label,
    required this.color,
    required this.textColor,
  });

  final String label;
  final Color color;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}

