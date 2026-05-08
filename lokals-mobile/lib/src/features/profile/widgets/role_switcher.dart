import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../widgets/cards.dart';

String formatRoleLabel(String role) {
  return role
      .split('_')
      .map(
        (item) => item.isEmpty
            ? item
            : '${item[0].toUpperCase()}${item.substring(1)}',
      )
      .join(' ');
}

class RoleSwitcher extends StatelessWidget {
  const RoleSwitcher({
    super.key,
    required this.roles,
    required this.currentRole,
    required this.onSelected,
    this.isBusy = false,
  });

  final List<String> roles;
  final String currentRole;
  final ValueChanged<String> onSelected;
  final bool isBusy;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: roles.map((role) {
            final selected = role == currentRole;
            return ChoiceChip(
              selected: selected,
              label: Text(formatRoleLabel(role)),
              onSelected: isBusy || selected ? null : (_) => onSelected(role),
              selectedColor: AppColors.primaryPurple,
              labelStyle: TextStyle(
                color: selected ? Colors.white : AppColors.deepCharcoal,
                fontWeight: FontWeight.w700,
              ),
              backgroundColor: AppColors.surfaceWhite,
              side: BorderSide(
                color: selected ? AppColors.primaryPurple : AppColors.border,
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 14),
        LokalsSurfaceTile(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              const Icon(Icons.badge_outlined, color: AppColors.primaryPurple),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Active role', style: AppTextStyles.body),
                    const SizedBox(height: 2),
                    Text(
                      isBusy
                          ? 'Switching role...'
                          : formatRoleLabel(currentRole),
                      style: AppTextStyles.bodyMuted,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
