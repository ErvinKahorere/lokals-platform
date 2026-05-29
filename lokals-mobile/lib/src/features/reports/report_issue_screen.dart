import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/location_picker_map.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'my_reports_screen.dart';

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
  String? _errorMessage;
  String? _infoMessage;
  String? _titleError;
  String? _descriptionError;
  String? _locationError;
  String _category = 'water';
  String _priority = 'medium';
  String _area = 'Nau-Aib';
  int _step = 0;
  _ReportSuccess? _success;

  static const _steps = [
    ('Issue', 'Category and urgency'),
    ('Location', 'Area and map pin'),
    ('Details', 'Description and photo'),
    ('Review', 'Check before sending'),
  ];

  static const _categories = [
    _IssueCategory(
      value: 'water',
      label: 'Water',
      detail: 'Leaks, burst pipes, no supply, or pressure issues.',
      icon: Icons.water_drop_outlined,
      background: Color(0xFFE0F2FE),
      foreground: Color(0xFF0369A1),
    ),
    _IssueCategory(
      value: 'roads',
      label: 'Roads',
      detail: 'Potholes, blocked access, signage, or surface damage.',
      icon: Icons.add_road_outlined,
      background: Color(0xFFFEF3C7),
      foreground: Color(0xFFD97706),
    ),
    _IssueCategory(
      value: 'electricity',
      label: 'Electricity',
      detail: 'Power cuts, exposed wires, or broken municipal lighting.',
      icon: Icons.bolt_outlined,
      background: Color(0xFFFEF9C3),
      foreground: Color(0xFFCA8A04),
    ),
    _IssueCategory(
      value: 'waste',
      label: 'Waste',
      detail: 'Missed collection, overflowing bins, or dumping.',
      icon: Icons.delete_outline_rounded,
      background: AppColors.successSoft,
      foreground: AppColors.primaryGreen,
    ),
    _IssueCategory(
      value: 'safety',
      label: 'Safety',
      detail: 'Unsafe areas, damaged public assets, or risk to residents.',
      icon: Icons.shield_outlined,
      background: AppColors.dangerSoft,
      foreground: AppColors.danger,
    ),
    _IssueCategory(
      value: 'other',
      label: 'Other',
      detail: 'Use when the issue does not fit the listed city services.',
      icon: Icons.report_problem_outlined,
      background: AppColors.neutralSoft,
      foreground: AppColors.deepCharcoal,
    ),
  ];

  static const _priorities = [
    _IssuePriority(
      value: 'low',
      label: 'Low',
      detail: 'Useful to log, but not urgent today.',
      background: AppColors.neutralSoft,
      foreground: AppColors.mutedText,
    ),
    _IssuePriority(
      value: 'medium',
      label: 'Medium',
      detail: 'Needs attention soon and affects normal use.',
      background: AppColors.warningSoft,
      foreground: AppColors.warning,
    ),
    _IssuePriority(
      value: 'high',
      label: 'High',
      detail: 'Urgent or unsafe and should reach the town team quickly.',
      background: AppColors.dangerSoft,
      foreground: AppColors.danger,
    ),
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  bool _validateStep(int step) {
    String? titleError;
    String? descriptionError;
    String? locationError;

    if (step >= 1 && _locationController.text.trim().isEmpty) {
      locationError =
          'Add the address, area, or landmark residents can recognize.';
    }
    if (step >= 2 && _titleController.text.trim().isEmpty) {
      titleError = 'Add a short clear title for the issue.';
    }
    if (step >= 2 && _descriptionController.text.trim().isEmpty) {
      descriptionError = 'Describe what happened and what residents should know.';
    }

    setState(() {
      _titleError = titleError;
      _descriptionError = descriptionError;
      _locationError = locationError;
    });

    return titleError == null &&
        descriptionError == null &&
        locationError == null;
  }

  void _goNext() {
    final target = (_step + 1).clamp(0, _steps.length - 1);
    if (!_validateStep(target - 1)) return;
    setState(() => _step = target);
  }

  Future<void> _pickPhoto() async {
    final file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 82,
    );
    if (file == null) return;
    setState(() => _photo = file);
  }

  Future<void> _analyzeWithAi() async {
    setState(() {
      _isAnalyzing = true;
      _errorMessage = null;
      _infoMessage = null;
    });

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
          : Map<String, dynamic>.from(
              (suggestions.first as Map)['content'] as Map? ?? const {},
            );

      if (!mounted) return;
      setState(() {
        if (_titleController.text.trim().isEmpty &&
            (suggestion['title']?.toString() ?? '').isNotEmpty) {
          _titleController.text = suggestion['title'].toString();
        }
        if (_descriptionController.text.trim().isEmpty &&
            (suggestion['description']?.toString() ?? '').isNotEmpty) {
          _descriptionController.text = suggestion['description'].toString();
        }
        if ((suggestion['category']?.toString() ?? '').isNotEmpty) {
          _category = suggestion['category'].toString();
        }
        _infoMessage =
            'AI suggestions added. Review and edit before sending it to the town team.';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _errorMessage =
            'AI suggestions are unavailable right now. You can still submit manually.';
      });
    } finally {
      if (mounted) {
        setState(() => _isAnalyzing = false);
      }
    }
  }

  Future<void> _submit() async {
    if (!_validateStep(_steps.length - 1)) {
      setState(() => _step = 0);
      return;
    }

    final user = ref.read(authControllerProvider).user;

    setState(() {
      _isBusy = true;
      _errorMessage = null;
      _infoMessage = null;
    });

    try {
      final response = await ref.read(discoveryRepositoryProvider).createReport(
            title: _titleController.text.trim(),
            category: _category,
            description: _descriptionController.text.trim(),
            location: _locationController.text.trim(),
            town: user?.defaultTown ?? AppConfig.pilotTown,
            area: _area,
            priority: _priority,
            photo: _photo,
            coordinates: _coordinates,
          );

      ref.invalidate(myReportsProvider);
      if (!mounted) return;
      setState(() {
        _isBusy = false;
        _success = _ReportSuccess(
          reference:
              response['data']?['reference_code']?.toString() ??
              response['reference_code']?.toString(),
          status:
              response['data']?['status']?.toString() ??
              response['status']?.toString() ??
              'submitted',
        );
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isBusy = false;
        _errorMessage =
            'We could not submit this report right now. Please try again.';
      });
    }
  }

  void _resetForm() {
    setState(() {
      _success = null;
      _step = 0;
      _category = 'water';
      _priority = 'medium';
      _area = 'Nau-Aib';
      _photo = null;
      _coordinates = null;
      _errorMessage = null;
      _infoMessage = null;
      _titleError = null;
      _descriptionError = null;
      _locationError = null;
      _titleController.clear();
      _descriptionController.clear();
      _locationController.text = 'Nau-Aib, Okahandja';
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    if (_locationController.text.isEmpty) {
      _area = user?.defaultArea ?? 'Nau-Aib';
      _locationController.text =
          [user?.defaultArea ?? _area, user?.defaultTown ?? AppConfig.pilotTown]
              .whereType<String>()
              .join(', ');
    }

    if (_success != null) {
      return LokalsShell(
        title: 'Report issue',
        showBack: true,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            AppCard(
              variant: AppCardVariant.dashboard,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.successSoft,
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: const Icon(
                      Icons.check_circle_outline_rounded,
                      color: AppColors.primaryGreen,
                      size: 34,
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Report sent',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.deepCharcoal,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Sent to relevant town team. Track status from your activity and report history as updates come in.',
                    style: AppTextStyles.bodyMuted,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: _MetricStatusCard(
                          label: 'Reference',
                          value: _success!.reference ?? 'Pending assignment',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MetricStatusCard(
                          label: 'Status',
                          value: _formatLabel(_success!.status),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const _TrustCueList(),
                  const SizedBox(height: 18),
                  AppButton(
                    label: 'Open activity',
                    icon: Icons.history_rounded,
                    onPressed: () => context.go('/activity'),
                  ),
                  const SizedBox(height: 12),
                  AppButton(
                    label: 'View my reports',
                    expanded: true,
                    variant: AppButtonVariant.secondary,
                    onPressed: () => context.go('/my-reports'),
                  ),
                  const SizedBox(height: 12),
                  AppButton(
                    label: 'Report another issue',
                    expanded: true,
                    variant: AppButtonVariant.secondary,
                    onPressed: _resetForm,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return LokalsShell(
      title: 'Report issue',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            eyebrow: 'Resident services',
            title: 'Report City Issue',
            subtitle:
                'A guided civic report flow with clear category, location, evidence, and review steps.',
          ),
          const SizedBox(height: 16),
          AppCard(
            variant: AppCardVariant.dashboard,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Progress',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.deepCharcoal,
                  ),
                ),
                const SizedBox(height: 12),
                ...List.generate(_steps.length, (index) {
                  final step = _steps[index];
                  final active = index == _step;
                  final complete = index < _step;
                  return Padding(
                    padding: EdgeInsets.only(bottom: index == _steps.length - 1 ? 0 : 10),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () {
                        if (index <= _step || _validateStep(index - 1)) {
                          setState(() => _step = index);
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: active
                              ? AppColors.successSoft
                              : complete
                                  ? AppColors.purpleSoftAlt
                                  : AppColors.surfaceWhite,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: active
                                ? AppColors.primaryGreen.withValues(alpha: 0.24)
                                : complete
                                    ? AppColors.primaryPurple.withValues(alpha: 0.18)
                                    : AppColors.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: active
                                    ? AppColors.primaryGreen
                                    : complete
                                        ? AppColors.primaryPurple
                                        : AppColors.neutralSoft,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '${index + 1}',
                                style: TextStyle(
                                  color: active || complete
                                      ? Colors.white
                                      : AppColors.mutedText,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    step.$1,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.deepCharcoal,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    step.$2,
                                    style: AppTextStyles.bodyMuted,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 16),
                const _TrustCueList(),
              ],
            ),
          ),
          const SizedBox(height: 16),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_step == 0) ...[
                  const _StepHeader(
                    step: 'Step 1',
                    title: 'What kind of issue is this?',
                    body:
                        'Choose the issue category and urgency so it reaches the right municipal queue first.',
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: _categories
                        .map(
                          (item) => _CategoryCard(
                            item: item,
                            selected: _category == item.value,
                            onTap: () => setState(() => _category = item.value),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Urgency',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.deepCharcoal,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Column(
                    children: _priorities
                        .map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _PriorityCard(
                              item: item,
                              selected: _priority == item.value,
                              onTap: () => setState(() => _priority = item.value),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ],
                if (_step == 1) ...[
                  const _StepHeader(
                    step: 'Step 2',
                    title: 'Where is the issue?',
                    body:
                        'Set the area, write the landmark or address, and place a map pin if you can.',
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: AppConfig.okahandjaAreas
                        .map(
                          (item) => ChoiceChip(
                            label: Text(item),
                            selected: _area == item,
                            onSelected: (_) {
                              setState(() {
                                _area = item;
                                if (_locationController.text.trim().isEmpty ||
                                    _locationController.text.contains(
                                      AppConfig.pilotTown,
                                    )) {
                                  _locationController.text =
                                      '$item, ${AppConfig.pilotTown}';
                                }
                              });
                            },
                            selectedColor: AppColors.successSoft,
                            backgroundColor: AppColors.softBackground,
                            side: BorderSide(
                              color: _area == item
                                  ? AppColors.primaryGreen.withValues(alpha: 0.24)
                                  : AppColors.border,
                            ),
                            labelStyle: TextStyle(
                              color: _area == item
                                  ? AppColors.primaryGreen
                                  : AppColors.deepCharcoal,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 14),
                  LokalsTextField(
                    controller: _locationController,
                    label: 'Address or landmark',
                    hint: 'Nau-Aib, near the bus stop',
                    helperText:
                        'Manual location still works even if you skip the map pin.',
                    errorText: _locationError,
                  ),
                  const SizedBox(height: 14),
                  LocationPickerMap(
                    label: 'Issue map pin',
                    value: _coordinates,
                    onChanged: (value) => setState(() => _coordinates = value),
                    helpText:
                        'Tap to place the issue pin. Manual address entry still works if you skip the map.',
                  ),
                ],
                if (_step == 2) ...[
                  const _StepHeader(
                    step: 'Step 3',
                    title: 'Describe what residents are seeing',
                    body:
                        'Short, practical detail helps the town team assess what is happening faster.',
                  ),
                  const SizedBox(height: 16),
                  LokalsTextField(
                    controller: _titleController,
                    label: 'Short title',
                    hint: 'Burst pipe near the taxi rank',
                    helperText: 'Keep it short and specific.',
                    errorText: _titleError,
                  ),
                  const SizedBox(height: 14),
                  LokalsTextField(
                    controller: _descriptionController,
                    label: 'Description',
                    hint:
                        'Explain what happened, when it started, and what residents should avoid.',
                    maxLines: 5,
                    helperText:
                        'Include what is affected, how serious it feels, and any nearby landmark.',
                    errorText: _descriptionError,
                  ),
                  const SizedBox(height: 14),
                  InkWell(
                    borderRadius: BorderRadius.circular(24),
                    onTap: _pickPhoto,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppColors.softBackground,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          if (_photo != null) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Image.file(
                                File(_photo!.path),
                                height: 180,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  height: 180,
                                  width: double.infinity,
                                  color: AppColors.neutralSoft,
                                  alignment: Alignment.center,
                                  child: const Icon(
                                    Icons.photo_camera_back_outlined,
                                    size: 36,
                                    color: AppColors.primaryPurple,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),
                          ] else ...[
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                color: AppColors.purpleSoftAlt,
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: const Icon(
                                Icons.photo_camera_outlined,
                                color: AppColors.primaryPurple,
                              ),
                            ),
                            const SizedBox(height: 14),
                          ],
                          Text(
                            _photo == null ? 'Add issue photo' : 'Change issue photo',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: AppColors.deepCharcoal,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Photos help speed up response by showing the town team what residents see on the ground.',
                            style: AppTextStyles.bodyMuted,
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_photo == null) ...[
                    const SizedBox(height: 12),
                    const EmptyStateView(
                      title: 'No photo added yet',
                      body:
                          'You can still submit without a photo, but visual proof often helps triage faster.',
                    ),
                  ],
                  const SizedBox(height: 14),
                  AppButton(
                    label: _isAnalyzing ? 'Analyzing...' : 'Analyze with AI',
                    expanded: true,
                    variant: AppButtonVariant.secondary,
                    onPressed: _isAnalyzing ? null : _analyzeWithAi,
                  ),
                ],
                if (_step == 3) ...[
                  const _StepHeader(
                    step: 'Step 4',
                    title: 'Review before sending',
                    body:
                        'Make sure category, urgency, location, and description are clear before the report is sent.',
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _MetricStatusCard(
                          label: 'Category',
                          value: _categories
                              .firstWhere((item) => item.value == _category)
                              .label,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MetricStatusCard(
                          label: 'Urgency',
                          value: _priorities
                              .firstWhere((item) => item.value == _priority)
                              .label,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _MetricStatusCard(
                    label: 'Location',
                    value: _locationController.text.trim().isEmpty
                        ? 'No location added'
                        : _locationController.text.trim(),
                  ),
                  const SizedBox(height: 12),
                  _MetricStatusCard(
                    label: 'Evidence',
                    value: _photo == null ? 'No photo added' : _photo!.name,
                  ),
                  const SizedBox(height: 12),
                  AppCard(
                    variant: AppCardVariant.dashboard,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _titleController.text.trim().isEmpty
                              ? 'Untitled report'
                              : _titleController.text.trim(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.deepCharcoal,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _descriptionController.text.trim().isEmpty
                              ? 'No description added yet.'
                              : _descriptionController.text.trim(),
                          style: AppTextStyles.bodyMuted,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _coordinates == null
                              ? 'No coordinates selected yet.'
                              : 'Coordinates: ${_coordinates!.latitude.toStringAsFixed(5)}, ${_coordinates!.longitude.toStringAsFixed(5)}',
                          style: AppTextStyles.bodyMuted,
                        ),
                      ],
                    ),
                  ),
                ],
                if (_errorMessage != null) ...[
                  const SizedBox(height: 14),
                  _InlineNotice(
                    message: _errorMessage!,
                    tone: _NoticeTone.danger,
                  ),
                ],
                if (_infoMessage != null) ...[
                  const SizedBox(height: 14),
                  _InlineNotice(
                    message: _infoMessage!,
                    tone: _NoticeTone.success,
                  ),
                ],
                const SizedBox(height: 18),
                Row(
                  children: [
                    if (_step > 0)
                      Expanded(
                        child: AppButton(
                          label: 'Back',
                          expanded: true,
                          variant: AppButtonVariant.secondary,
                          onPressed: () => setState(() => _step -= 1),
                        ),
                      ),
                    if (_step > 0) const SizedBox(width: 12),
                    Expanded(
                      child: AppButton(
                        label: _step == _steps.length - 1
                            ? 'Submit report'
                            : 'Next step',
                        isLoading: _isBusy,
                        loadingLabel: 'Submitting report...',
                        icon: _step == _steps.length - 1
                            ? Icons.send_rounded
                            : Icons.arrow_forward_rounded,
                        onPressed: _step == _steps.length - 1 ? _submit : _goNext,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StepHeader extends StatelessWidget {
  const _StepHeader({
    required this.step,
    required this.title,
    required this.body,
  });

  final String step;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(step.toUpperCase(), style: AppTextStyles.eyebrow),
        const SizedBox(height: 6),
        Text(title, style: AppTextStyles.h2),
        const SizedBox(height: 8),
        Text(body, style: AppTextStyles.bodyMuted),
      ],
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final _IssueCategory item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: selected ? item.background : Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: selected
                  ? item.foreground.withValues(alpha: 0.22)
                  : AppColors.border,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: item.background,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(item.icon, color: item.foreground),
              ),
              const SizedBox(height: 14),
              Text(
                item.label,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.deepCharcoal,
                ),
              ),
              const SizedBox(height: 8),
              Text(item.detail, style: AppTextStyles.bodyMuted),
            ],
          ),
        ),
      ),
    );
  }
}

class _PriorityCard extends StatelessWidget {
  const _PriorityCard({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final _IssuePriority item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? item.background : Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: selected
                ? item.foreground.withValues(alpha: 0.24)
                : AppColors.border,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.label,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: item.foreground,
              ),
            ),
            const SizedBox(height: 6),
            Text(item.detail, style: AppTextStyles.bodyMuted),
          ],
        ),
      ),
    );
  }
}

class _MetricStatusCard extends StatelessWidget {
  const _MetricStatusCard({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      variant: AppCardVariant.dashboard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: AppTextStyles.eyebrow),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: AppColors.deepCharcoal,
            ),
          ),
        ],
      ),
    );
  }
}

class _TrustCueList extends StatelessWidget {
  const _TrustCueList();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        _TrustCue(text: 'Sent to relevant town team'),
        SizedBox(height: 10),
        _TrustCue(text: 'Track status from your activity'),
        SizedBox(height: 10),
        _TrustCue(text: 'Photos help speed up response'),
      ],
    );
  }
}

class _TrustCue extends StatelessWidget {
  const _TrustCue({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.softBackground,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: AppColors.successSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.check_circle_outline_rounded,
              size: 18,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppColors.deepCharcoal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InlineNotice extends StatelessWidget {
  const _InlineNotice({
    required this.message,
    required this.tone,
  });

  final String message;
  final _NoticeTone tone;

  @override
  Widget build(BuildContext context) {
    final background = switch (tone) {
      _NoticeTone.danger => AppColors.dangerSoft,
      _NoticeTone.success => AppColors.successSoft,
    };
    final foreground = switch (tone) {
      _NoticeTone.danger => AppColors.danger,
      _NoticeTone.success => AppColors.primaryGreen,
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: foreground.withValues(alpha: 0.18)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            tone == _NoticeTone.danger
                ? Icons.error_outline_rounded
                : Icons.check_circle_outline_rounded,
            color: foreground,
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: foreground,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _formatLabel(String value) {
  return value
      .replaceAll('_', ' ')
      .split(' ')
      .where((part) => part.isNotEmpty)
      .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}

enum _NoticeTone { danger, success }

class _IssueCategory {
  const _IssueCategory({
    required this.value,
    required this.label,
    required this.detail,
    required this.icon,
    required this.background,
    required this.foreground,
  });

  final String value;
  final String label;
  final String detail;
  final IconData icon;
  final Color background;
  final Color foreground;
}

class _IssuePriority {
  const _IssuePriority({
    required this.value,
    required this.label,
    required this.detail,
    required this.background,
    required this.foreground,
  });

  final String value;
  final String label;
  final String detail;
  final Color background;
  final Color foreground;
}

class _ReportSuccess {
  const _ReportSuccess({
    required this.reference,
    required this.status,
  });

  final String? reference;
  final String status;
}
