import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../widgets/cards.dart';

class StatusStepper extends StatelessWidget {
  const StatusStepper({
    super.key,
    required this.steps,
    required this.current,
    this.updatedAt,
  });

  final List<String> steps;
  final String current;
  final String? updatedAt;

  @override
  Widget build(BuildContext context) {
    final currentIndex = steps.indexOf(current).clamp(0, steps.length - 1);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const Spacer(),
              Text(
                updatedAt == null ? 'Waiting for updates' : 'Updated ${updatedAt!.replaceFirst('T', ' ').substring(0, 16)}',
                style: const TextStyle(color: AppColors.mutedText, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 16),
          for (var index = 0; index < steps.length; index++) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: index <= currentIndex ? AppColors.primaryPurple : AppColors.neutralSoft,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${index + 1}',
                        style: TextStyle(
                          color: index <= currentIndex ? Colors.white : AppColors.mutedText,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    if (index < steps.length - 1)
                      Container(
                        width: 2,
                        height: 32,
                        color: index < currentIndex ? AppColors.primaryPurple : AppColors.border,
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _label(steps[index]),
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: steps[index] == current ? AppColors.primaryPurple : AppColors.deepCharcoal,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          steps[index] == current ? 'Current step' : index <= currentIndex ? 'Completed' : 'Pending',
                          style: const TextStyle(color: AppColors.mutedText, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _label(String value) {
    return value
        .split('_')
        .map((part) => part.isEmpty ? part : '${part[0].toUpperCase()}${part.substring(1)}')
        .join(' ');
  }
}
