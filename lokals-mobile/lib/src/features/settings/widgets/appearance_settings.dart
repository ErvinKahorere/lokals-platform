import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';

class AppearanceSettingsSection extends StatelessWidget {
  const AppearanceSettingsSection({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    const modes = {
      'light': 'Light',
      'system': 'System',
      'dark': 'Dark',
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: modes.entries.map((entry) {
            final selected = value == entry.key;
            return ChoiceChip(
              selected: selected,
              label: Text(entry.value),
              onSelected: (_) => onChanged(entry.key),
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
        const SizedBox(height: 12),
        const Text(
          'Theme preference is saved on this device. LOKALS still defaults to the polished light experience while dark mode support keeps maturing.',
          style: AppTextStyles.bodyMuted,
        ),
      ],
    );
  }
}
