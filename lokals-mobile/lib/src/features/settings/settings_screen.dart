import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _townController = TextEditingController(text: 'Windhoek');
  final _areaController = TextEditingController(text: 'Katutura');
  final _radiusController = TextEditingController(text: '10');
  final Map<String, bool> _notificationPreferences = {
    'alerts_from_followed_entities': true,
    'booking_updates': true,
    'job_updates': true,
    'sale_alerts': true,
    'city_alerts': true,
  };
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    final preferences = ref.watch(preferencesProvider);

    return LokalsShell(
      title: 'Settings',
      showBack: true,
      child: preferences.when(
        data: (prefs) {
          _townController.text = prefs.defaultTown ?? _townController.text;
          _areaController.text = prefs.defaultArea ?? _areaController.text;
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const SectionTitle(
                title: 'Location and notifications',
                subtitle: 'Keep your home feed relevant to your area.',
              ),
              const SizedBox(height: 16),
              LokalsCard(
                child: Column(
                  children: [
                    LokalsTextField(controller: _townController, label: 'Town'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _areaController, label: 'Area'),
                    const SizedBox(height: 12),
                    LokalsTextField(
                      controller: _radiusController,
                      label: 'Service radius (km)',
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    ..._notificationPreferences.entries.map(
                      (entry) => SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(entry.key.replaceAll('_', ' ')),
                        value: entry.value,
                        onChanged: (value) {
                          setState(() {
                            _notificationPreferences[entry.key] = value;
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: 16),
                    PrimaryAction(
                      label: 'Save settings',
                      isBusy: _saving,
                      onPressed: () async {
                        setState(() => _saving = true);
                        await ref
                            .read(discoveryRepositoryProvider)
                            .updatePreferences(
                              defaultTown: _townController.text.trim(),
                              defaultArea: _areaController.text.trim(),
                              serviceRadius:
                                  int.tryParse(_radiusController.text.trim()) ??
                                  10,
                              notificationPreferences: _notificationPreferences,
                            );
                        if (!context.mounted) return;
                        setState(() => _saving = false);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Settings saved')),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Failed to load settings: $error')),
      ),
    );
  }
}
