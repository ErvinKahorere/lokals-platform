import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../config/app_config.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';

class SubmitCommunityProjectScreen extends ConsumerStatefulWidget {
  const SubmitCommunityProjectScreen({super.key});

  @override
  ConsumerState<SubmitCommunityProjectScreen> createState() => _SubmitCommunityProjectScreenState();
}

class _SubmitCommunityProjectScreenState extends ConsumerState<SubmitCommunityProjectScreen> {
  final _titleController = TextEditingController();
  final _summaryController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _contactNameController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _contactWhatsappController = TextEditingController();
  final _contactEmailController = TextEditingController();
  final _targetAmountController = TextEditingController();
  final _targetVolunteersController = TextEditingController();
  final List<XFile> _attachments = [];
  final Set<String> _supportNeeded = <String>{};
  int? _categoryId;
  bool _isSubmitting = false;
  bool _saveAsDraft = false;
  String? _submittedReference;
  String? _submittedStatus;

  static const _supportOptions = <String>[
    'Donations',
    'Volunteers',
    'Skills/services',
    'Materials',
    'Food/clothing support',
    'School support',
    'Medical support',
    'Community cleanup support',
    'Sports/youth support',
    'Elderly/vulnerable support',
    'Sponsorship',
    'Other community help',
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final user = ref.read(authControllerProvider).user;
    if (_contactNameController.text.isEmpty) {
      _contactNameController.text = user?.name ?? '';
      _contactPhoneController.text = user?.phone ?? '';
      _contactWhatsappController.text = user?.whatsapp ?? '';
      _contactEmailController.text = user?.email ?? '';
      _locationController.text = [
        user?.defaultArea ?? 'Nau-Aib',
        user?.defaultTown ?? AppConfig.pilotTown,
      ].where((item) => item.isNotEmpty).join(', ');
    }
  }

  Future<void> _submit() async {
    if (_categoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Choose a category first.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final project = await ref.read(discoveryRepositoryProvider).createCommunityProject(
            categoryId: _categoryId!,
            title: _titleController.text.trim(),
            summary: _summaryController.text.trim(),
            description: _descriptionController.text.trim(),
            supportNeeded: _supportNeeded.toList(),
            targetAmount: _targetAmountController.text.trim(),
            targetVolunteers: int.tryParse(_targetVolunteersController.text.trim()),
            locationText: _locationController.text.trim(),
            town: AppConfig.pilotTown,
            area: ref.read(authControllerProvider).user?.defaultArea,
            contactName: _contactNameController.text.trim(),
            contactPhone: _contactPhoneController.text.trim(),
            contactWhatsapp: _contactWhatsappController.text.trim(),
            contactEmail: _contactEmailController.text.trim(),
            saveAsDraft: _saveAsDraft,
            attachments: _attachments,
          );

      ref.invalidate(myCommunityProjectsProvider);
      if (!mounted) return;
      setState(() {
        _submittedReference = project.referenceCode;
        _submittedStatus = project.status;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _saveAsDraft
                ? 'Project saved as draft.'
                : 'Submitted for Town Manager verification.',
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(communityProjectCategoriesProvider);

    return LokalsShell(
      title: 'Submit project',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 110),
        children: [
          const SectionTitle(
            eyebrow: 'Get involved',
            title: 'Submit a community initiative',
            subtitle: 'Town Managers review every initiative before public visibility.',
          ),
          const SizedBox(height: 16),
          if (_submittedReference != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: LokalsCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Submitted for Town Manager verification', style: AppTextStyles.h3),
                    const SizedBox(height: 8),
                    Text('Reference: $_submittedReference', style: AppTextStyles.body),
                    const SizedBox(height: 6),
                    AppBadge(
                      label: _submittedStatus ?? 'submitted',
                      tone: AppBadgeTone.info,
                    ),
                  ],
                ),
              ),
            ),
          _StepCard(
            step: 'Step 1',
            title: 'Choose a category',
            child: categoriesAsync.when(
              data: (categories) => Wrap(
                spacing: 8,
                runSpacing: 8,
                children: categories
                    .map(
                      (category) => FilterChip(
                        label: Text(category.name),
                        selected: _categoryId == category.id,
                        onSelected: (_) => setState(() => _categoryId = category.id),
                      ),
                    )
                    .toList(),
              ),
              loading: () => const LoadingSkeleton(height: 56),
              error: (_, __) => const Text('Could not load categories.'),
            ),
          ),
          const SizedBox(height: 14),
          _StepCard(
            step: 'Step 2',
            title: 'Project title and summary',
            child: Column(
              children: [
                LokalsTextField(controller: _titleController, label: 'Project title'),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _summaryController,
                  label: 'Short summary',
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _descriptionController,
                  label: 'Detailed description',
                  maxLines: 5,
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _StepCard(
            step: 'Step 3',
            title: 'Support needed',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _supportOptions
                      .map(
                        (option) => FilterChip(
                          label: Text(option),
                          selected: _supportNeeded.contains(option),
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                _supportNeeded.add(option);
                              } else {
                                _supportNeeded.remove(option);
                              }
                            });
                          },
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _targetAmountController,
                  label: 'Funding target (optional)',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _targetVolunteersController,
                  label: 'Volunteer target (optional)',
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _StepCard(
            step: 'Step 4',
            title: 'Contact and location',
            child: Column(
              children: [
                LokalsTextField(controller: _locationController, label: 'Location'),
                const SizedBox(height: 12),
                LokalsTextField(controller: _contactNameController, label: 'Contact name'),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _contactPhoneController,
                  label: 'Contact phone',
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _contactWhatsappController,
                  label: 'WhatsApp',
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _contactEmailController,
                  label: 'Contact email',
                  keyboardType: TextInputType.emailAddress,
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _StepCard(
            step: 'Step 5',
            title: 'Attach proof or media',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    AppButton(
                      label: 'Add photos',
                      compact: true,
                      expanded: false,
                      variant: AppButtonVariant.secondary,
                      onPressed: () async {
                        final images = await ImagePicker().pickMultiImage(imageQuality: 82);
                        if (images.isEmpty) return;
                        setState(() => _attachments.addAll(images));
                      },
                    ),
                    AppButton(
                      label: 'Add video',
                      compact: true,
                      expanded: false,
                      variant: AppButtonVariant.secondary,
                      onPressed: () async {
                        final video = await ImagePicker().pickVideo(source: ImageSource.gallery);
                        if (video == null) return;
                        setState(() => _attachments.add(video));
                      },
                    ),
                  ],
                ),
                if (_attachments.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 92,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _attachments.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, index) {
                        final file = _attachments[index];
                        return Container(
                          width: 114,
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.softBackground,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: AppColors.purpleSoft,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.attach_file_outlined, color: AppColors.primaryPurple),
                              ),
                              const Spacer(),
                              Text(
                                file.name,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: AppTextStyles.caption.copyWith(
                                  color: AppColors.deepCharcoal,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          _StepCard(
            step: 'Step 6',
            title: 'Review and submit',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Submissions stay private until a Town Manager verifies and approves them for public display.',
                  style: AppTextStyles.bodyMuted,
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  value: _saveAsDraft,
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Save as draft first'),
                  subtitle: const Text('Keep working on it before sending for verification.'),
                  onChanged: (value) => setState(() => _saveAsDraft = value),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: AppButton(
          label: _saveAsDraft ? 'Save draft' : 'Submit for review',
          isLoading: _isSubmitting,
          onPressed: _submit,
        ),
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  const _StepCard({
    required this.step,
    required this.title,
    required this.child,
  });

  final String step;
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LokalsCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(step.toUpperCase(), style: AppTextStyles.eyebrow),
          const SizedBox(height: 6),
          Text(title, style: AppTextStyles.h3),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}
