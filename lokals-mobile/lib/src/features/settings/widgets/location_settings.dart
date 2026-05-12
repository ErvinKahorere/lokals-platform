import 'package:flutter/material.dart';

import '../../../../core/theme/app_text_styles.dart';
import '../../../config/app_config.dart';
import '../../../widgets/cards.dart';

class LocationSettingsSection extends StatelessWidget {
  const LocationSettingsSection({
    super.key,
    required this.townController,
    required this.areaController,
    required this.radiusController,
  });

  final TextEditingController townController;
  final TextEditingController areaController;
  final TextEditingController radiusController;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Default town and area', style: AppTextStyles.body),
        const SizedBox(height: 12),
        LayoutBuilder(
          builder: (context, constraints) {
            final stackFields = constraints.maxWidth < 420;
            if (stackFields) {
              return Column(
                children: [
                  LokalsTextField(
                    controller: townController,
                    label: 'Town',
                    hint: AppConfig.pilotTown,
                    readOnly: true,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: areaController.text.isEmpty ? null : areaController.text,
                    items: AppConfig.okahandjaAreas
                        .map((value) => DropdownMenuItem(value: value, child: Text(value, overflow: TextOverflow.ellipsis)))
                        .toList(),
                    decoration: const InputDecoration(labelText: 'Area'),
                    onChanged: (value) => areaController.text = value ?? '',
                  ),
                ],
              );
            }

            return Row(
              children: [
                Expanded(
                  child: LokalsTextField(
                    controller: townController,
                    label: 'Town',
                    hint: AppConfig.pilotTown,
                    readOnly: true,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: areaController.text.isEmpty ? null : areaController.text,
                    items: AppConfig.okahandjaAreas
                        .map((value) => DropdownMenuItem(value: value, child: Text(value, overflow: TextOverflow.ellipsis)))
                        .toList(),
                    decoration: const InputDecoration(labelText: 'Area'),
                    onChanged: (value) => areaController.text = value ?? '',
                  ),
                ),
              ],
            );
          },
        ),
        const SizedBox(height: 12),
        LokalsTextField(
          controller: radiusController,
          label: 'Service radius (km)',
          hint: '10',
          keyboardType: TextInputType.number,
          helperText: 'This influences home, services, directory, store, accommodation, news, and events.',
        ),
        const SizedBox(height: 12),
        const Text(
          '${AppConfig.pilotLocationMessage} Town is locked for the pilot, and you can choose your area inside Okahandja.',
          style: AppTextStyles.bodyMuted,
        ),
      ],
    );
  }
}
