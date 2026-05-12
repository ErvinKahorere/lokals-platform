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
    this.compact = false,
  });

  final bool verified;
  final String ratingLabel;
  final String distanceLabel;
  final String? completedLabel;
  final String? responseLabel;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: compact ? 6 : 8,
      runSpacing: compact ? 6 : 8,
      children: [
        VerifiedBadge(verified: verified, compact: compact),
        RatingPill(label: ratingLabel, compact: compact),
        DistancePill(label: distanceLabel, compact: compact),
        if (completedLabel != null)
          _MiniPill(
            label: completedLabel!,
            color: const Color(0xFFDCFCE7),
            textColor: const Color(0xFF166534),
            compact: compact,
          ),
        if (responseLabel != null)
          _MiniPill(
            label: responseLabel!,
            color: const Color(0xFFDBEAFE),
            textColor: const Color(0xFF1D4ED8),
            compact: compact,
          ),
      ],
    );
  }
}

class _MiniPill extends StatelessWidget {
  const _MiniPill({
    required this.label,
    required this.color,
    required this.textColor,
    required this.compact,
  });

  final String label;
  final Color color;
  final Color textColor;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: compact ? 8 : 10, vertical: compact ? 5 : 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w700,
          fontSize: compact ? 11 : 12,
        ),
      ),
    );
  }
}
