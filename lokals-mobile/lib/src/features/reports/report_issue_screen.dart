import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class ReportIssueScreen extends ConsumerStatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  ConsumerState<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends ConsumerState<ReportIssueScreen> {
  final _titleController = TextEditingController();
  final _categoryController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  XFile? _photo;
  bool _isBusy = false;
  String? _message;

  @override
  Widget build(BuildContext context) {
    return LokalsShell(
      title: 'Report issue',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Report a city issue',
            subtitle: 'Short forms keep civic reporting usable on slower connections.',
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              children: [
                LokalsTextField(controller: _titleController, label: 'Title'),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _categoryController,
                  label: 'Category',
                  hint: 'Pothole, water issue, streetlight...',
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
                          category: _categoryController.text.trim(),
                          description: _descriptionController.text.trim(),
                          location: _locationController.text.trim(),
                          photo: _photo,
                        );
                    if (!mounted) return;
                    setState(() {
                      _isBusy = false;
                      _message = 'Report submitted successfully.';
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
