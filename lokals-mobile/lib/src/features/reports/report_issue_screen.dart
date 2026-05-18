import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'my_reports_screen.dart';
import '../../../shared/widgets/location_picker_map.dart';

class ReportIssueScreen extends ConsumerStatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  ConsumerState<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends ConsumerState<ReportIssueScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  XFile? _photo;
  LocationPointModel? _coordinates;
  bool _isBusy = false;
  bool _isAnalyzing = false;
  String? _message;
  String _category = 'water';
  String _priority = 'medium';

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    if (_locationController.text.isEmpty) {
      _locationController.text = [user?.defaultArea, user?.defaultTown].whereType<String>().join(', ');
    }

    return LokalsShell(
      title: 'Report issue',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Report a city issue',
            subtitle: 'Keep it short: category, what happened, and where it is.',
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              children: [
                LokalsTextField(controller: _titleController, label: 'Short title'),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _category,
                  items: const [
                    DropdownMenuItem(value: 'water', child: Text('Water')),
                    DropdownMenuItem(value: 'electricity', child: Text('Electricity')),
                    DropdownMenuItem(value: 'roads', child: Text('Roads')),
                    DropdownMenuItem(value: 'waste', child: Text('Waste')),
                    DropdownMenuItem(value: 'safety', child: Text('Safety')),
                    DropdownMenuItem(value: 'other', child: Text('Other')),
                  ],
                  decoration: const InputDecoration(labelText: 'Category'),
                  onChanged: (value) => setState(() => _category = value ?? 'water'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _priority,
                  items: const [
                    DropdownMenuItem(value: 'low', child: Text('Low')),
                    DropdownMenuItem(value: 'medium', child: Text('Medium')),
                    DropdownMenuItem(value: 'high', child: Text('High')),
                  ],
                  decoration: const InputDecoration(labelText: 'Priority'),
                  onChanged: (value) => setState(() => _priority = value ?? 'medium'),
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _descriptionController,
                  label: 'Description',
                  maxLines: 4,
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _locationController,
                  label: 'Location',
                ),
                const SizedBox(height: 12),
                LocationPickerMap(
                  label: 'Issue map pin',
                  value: _coordinates,
                  onChanged: (value) => setState(() => _coordinates = value),
                  helpText: 'Tap to place the issue pin. Manual address entry still works if you skip the map.',
                ),
                const SizedBox(height: 12),
                AppButton(
                  label: _photo == null ? 'Add issue photo' : 'Change issue photo',
                  expanded: false,
                  variant: AppButtonVariant.secondary,
                  onPressed: () async {
                    final file = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 82);
                    if (file == null) return;
                    setState(() => _photo = file);
                  },
                ),
                const SizedBox(height: 12),
                AppButton(
                  label: _isAnalyzing ? 'Analyzing...' : 'Analyze with AI',
                  expanded: false,
                  variant: AppButtonVariant.secondary,
                  onPressed: _isAnalyzing
                      ? null
                      : () async {
                          setState(() => _isAnalyzing = true);
                          try {
                            final response = await ref.read(discoveryRepositoryProvider).requestAiAssist(
                                  module: 'issue-report',
                                  title: _titleController.text.trim(),
                                  description: _descriptionController.text.trim(),
                                  location: _locationController.text.trim(),
                                  media: _photo,
                                );
                            final suggestions = ((response['suggestions'] as List?) ?? const []);
                            final suggestion = suggestions.isEmpty
                                ? const <String, dynamic>{}
                                : Map<String, dynamic>.from((suggestions.first as Map)['content'] as Map? ?? const {});

                            setState(() {
                              if ((_titleController.text.trim()).isEmpty && (suggestion['title']?.toString() ?? '').isNotEmpty) {
                                _titleController.text = suggestion['title'].toString();
                              }
                              if ((_descriptionController.text.trim()).isEmpty && (suggestion['description']?.toString() ?? '').isNotEmpty) {
                                _descriptionController.text = suggestion['description'].toString();
                              }
                              if ((suggestion['category']?.toString() ?? '').isNotEmpty) {
                                _category = suggestion['category'].toString();
                              }
                              _message = 'AI suggestions added. Review and edit before submitting.';
                            });
                          } finally {
                            if (mounted) {
                              setState(() => _isAnalyzing = false);
                            }
                          }
                        },
                ),
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  Text(_message!, style: const TextStyle(color: Colors.green)),
                ],
                const SizedBox(height: 16),
                PrimaryAction(
                  label: 'Submit report',
                  isBusy: _isBusy,
                  onPressed: () async {
                    setState(() => _isBusy = true);
                    await ref.read(discoveryRepositoryProvider).createReport(
                          title: _titleController.text.trim(),
                          category: _category,
                          description: _descriptionController.text.trim(),
                          location: _locationController.text.trim(),
                          town: user?.defaultTown ?? AppConfig.pilotTown,
                          area: user?.defaultArea,
                          priority: _priority,
                          photo: _photo,
                          coordinates: _coordinates,
                        );
                    ref.invalidate(myReportsProvider);
                    if (!mounted) return;
                    setState(() {
                      _isBusy = false;
                      _message = 'Report submitted to the Okahandja service desk.';
                      _titleController.clear();
                      _descriptionController.clear();
                      _photo = null;
                    });
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
