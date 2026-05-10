import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/job_card.dart';
import '../../../shared/widgets/worker_card.dart';
import '../../config/app_config.dart';
import '../auth/auth_controller.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class JobsScreen extends ConsumerStatefulWidget {
  const JobsScreen({super.key});

  @override
  ConsumerState<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends ConsumerState<JobsScreen> {
  final _searchController = TextEditingController();
  String _tab = 'find-help';
  String _skillFilter = 'All';
  String? _feedback;

  static const _skillFilters = <String>[
    'All',
    'Cleaning',
    'Painting',
    'Gardening',
    'Driving',
    'Tutoring',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<JobModel> _filterJobs(List<JobModel> items) {
    final query = _searchController.text.trim().toLowerCase();
    return items.where((job) {
      final matchesQuery = query.isEmpty ||
          job.title.toLowerCase().contains(query) ||
          job.description.toLowerCase().contains(query) ||
          job.skills.any((skill) => skill.toLowerCase().contains(query));
      final matchesSkill = _skillFilter == 'All' ||
          job.skills.any((skill) => skill.toLowerCase().contains(_skillFilter.toLowerCase())) ||
          job.title.toLowerCase().contains(_skillFilter.toLowerCase());
      return matchesQuery && matchesSkill;
    }).toList();
  }

  List<WorkerModel> _filterWorkers(List<WorkerModel> items) {
    final query = _searchController.text.trim().toLowerCase();
    return items.where((worker) {
      final matchesQuery = query.isEmpty ||
          worker.headline.toLowerCase().contains(query) ||
          (worker.name?.toLowerCase().contains(query) ?? false) ||
          worker.skills.any((skill) => skill.toLowerCase().contains(query));
      final matchesSkill = _skillFilter == 'All' ||
          worker.skills.any((skill) => skill.toLowerCase().contains(_skillFilter.toLowerCase())) ||
          worker.headline.toLowerCase().contains(_skillFilter.toLowerCase());
      return matchesQuery && matchesSkill;
    }).toList();
  }

  Future<void> _openPostJobSheet() async {
    final auth = ref.read(authControllerProvider);
    if (auth.token == null) {
      if (!mounted) return;
      context.go('/login');
      return;
    }

    final titleController = TextEditingController();
    final locationController = TextEditingController(text: auth.user?.defaultArea ?? auth.user?.location ?? AppConfig.okahandjaAreas.first);
    final budgetController = TextEditingController();
    final descriptionController = TextEditingController();
    final skillController = TextEditingController();
    String selectedType = 'gig';
    int step = 0;
    bool isSubmitting = false;
    String? error;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            Future<void> submit() async {
              setSheetState(() {
                isSubmitting = true;
                error = null;
              });
              try {
                await ref.read(discoveryRepositoryProvider).createJob(
                      title: titleController.text.trim(),
                      location: locationController.text.trim(),
                      description: descriptionController.text.trim().isEmpty ? null : descriptionController.text.trim(),
                      compensation: budgetController.text.trim().isEmpty ? null : budgetController.text.trim(),
                      employmentType: selectedType,
                      skills: skillController.text.trim().isEmpty
                          ? null
                          : skillController.text
                              .split(',')
                              .map((item) => item.trim())
                              .where((item) => item.isNotEmpty)
                              .toList(),
                    );
                ref.invalidate(jobsProvider);
                if (!mounted || !sheetContext.mounted) return;
                Navigator.of(sheetContext).pop();
                setState(() {
                  _feedback = 'Job posted successfully. Local workers can now apply.';
                  _tab = 'find-help';
                });
              } catch (caught) {
                setSheetState(() {
                  error = caught.toString().replaceFirst('Exception: ', '');
                });
              } finally {
                setSheetState(() => isSubmitting = false);
              }
            }

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: EdgeInsets.fromLTRB(20, 18, 20, MediaQuery.of(context).viewInsets.bottom + 24),
              child: SafeArea(
                top: false,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 48,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.border,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(step == 0 ? 'Post a local job' : 'Confirm details', style: AppTextStyles.h3),
                      const SizedBox(height: 6),
                      Text(
                        step == 0
                            ? 'Keep it short so nearby workers can respond quickly.'
                            : 'Review the key details before publishing.',
                        style: AppTextStyles.bodyMuted,
                      ),
                      const SizedBox(height: 18),
                      if (step == 0) ...[
                        LokalsTextField(controller: titleController, label: 'Job title', hint: 'House cleaner needed'),
                        const SizedBox(height: 12),
                        LokalsTextField(controller: locationController, label: 'Town or area', hint: 'Nau-Aib'),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          initialValue: selectedType,
                          decoration: const InputDecoration(labelText: 'Job type'),
                          items: const [
                            DropdownMenuItem(value: 'gig', child: Text('Quick task')),
                            DropdownMenuItem(value: 'part_time', child: Text('Part-time')),
                            DropdownMenuItem(value: 'contract', child: Text('Contract')),
                          ],
                          onChanged: (value) => setSheetState(() => selectedType = value ?? 'gig'),
                        ),
                        const SizedBox(height: 12),
                        LokalsTextField(controller: budgetController, label: 'Budget (optional)', hint: '650', keyboardType: TextInputType.number),
                        const SizedBox(height: 12),
                        LokalsTextField(controller: skillController, label: 'Skills (optional)', hint: 'cleaning, laundry', maxLines: 2),
                        const SizedBox(height: 12),
                        LokalsTextField(controller: descriptionController, label: 'Description (optional)', hint: 'Share timing, tools, or special notes.', maxLines: 4),
                      ] else ...[
                        AppCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _ReviewRow(label: 'Title', value: titleController.text.trim().isEmpty ? 'Not set' : titleController.text.trim()),
                              _ReviewRow(label: 'Location', value: locationController.text.trim().isEmpty ? 'Not set' : locationController.text.trim()),
                              _ReviewRow(label: 'Type', value: selectedType.replaceAll('_', ' ')),
                              _ReviewRow(label: 'Budget', value: budgetController.text.trim().isEmpty ? 'Negotiable' : 'N\$ ${budgetController.text.trim()}'),
                              _ReviewRow(label: 'Skills', value: skillController.text.trim().isEmpty ? 'General help' : skillController.text.trim()),
                              _ReviewRow(label: 'Description', value: descriptionController.text.trim().isEmpty ? 'No extra description yet.' : descriptionController.text.trim()),
                            ],
                          ),
                        ),
                      ],
                      if (error != null) ...[
                        const SizedBox(height: 12),
                        Text(error!, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.danger)),
                      ],
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          if (step == 1)
                            Expanded(
                              child: AppButton(
                                label: 'Back',
                                variant: AppButtonVariant.secondary,
                                onPressed: () => setSheetState(() => step = 0),
                              ),
                            ),
                          if (step == 1) const SizedBox(width: 10),
                          Expanded(
                            child: AppButton(
                              label: step == 0 ? 'Continue' : 'Publish job',
                              isLoading: isSubmitting,
                              onPressed: () {
                                if (step == 0) {
                                  if (titleController.text.trim().isEmpty || locationController.text.trim().isEmpty) {
                                    setSheetState(() => error = 'Please add a title and location first.');
                                    return;
                                  }
                                  setSheetState(() {
                                    error = null;
                                    step = 1;
                                  });
                                  return;
                                }
                                submit();
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    titleController.dispose();
    locationController.dispose();
    budgetController.dispose();
    descriptionController.dispose();
    skillController.dispose();
  }

  Future<void> _openWorkerSetupSheet() async {
    final auth = ref.read(authControllerProvider);
    if (auth.token == null) {
      if (!mounted) return;
      context.go('/login');
      return;
    }

    final headlineController = TextEditingController(text: auth.user?.profession ?? '');
    final skillsController = TextEditingController();
    final locationController = TextEditingController(text: auth.user?.defaultArea ?? auth.user?.location ?? AppConfig.okahandjaAreas.first);
    final experienceController = TextEditingController();
    final rateController = TextEditingController();
    bool isAvailable = true;
    bool isSaving = false;
    String? error;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            Future<void> save() async {
              setSheetState(() {
                isSaving = true;
                error = null;
              });
              try {
                await ref.read(discoveryRepositoryProvider).createWorkerProfile(
                      headline: headlineController.text.trim(),
                      skills: skillsController.text
                          .split(',')
                          .map((item) => item.trim())
                          .where((item) => item.isNotEmpty)
                          .toList(),
                      location: locationController.text.trim(),
                      experienceYears: int.tryParse(experienceController.text.trim()),
                      hourlyRate: rateController.text.trim().isEmpty ? null : rateController.text.trim(),
                      isAvailable: isAvailable,
                    );
                ref.invalidate(workersProvider);
                if (!mounted || !sheetContext.mounted) return;
                Navigator.of(sheetContext).pop();
                setState(() => _feedback = 'Worker profile saved. You can now apply faster.');
              } catch (caught) {
                setSheetState(() => error = caught.toString().replaceFirst('Exception: ', ''));
              } finally {
                setSheetState(() => isSaving = false);
              }
            }

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: EdgeInsets.fromLTRB(20, 18, 20, MediaQuery.of(context).viewInsets.bottom + 24),
              child: SafeArea(
                top: false,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 48,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.border,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text('Complete your worker profile', style: AppTextStyles.h3),
                      const SizedBox(height: 6),
                      Text('A few details help local posters trust and shortlist you faster.', style: AppTextStyles.bodyMuted),
                      const SizedBox(height: 18),
                      LokalsTextField(controller: headlineController, label: 'Profession or title', hint: 'House cleaner'),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: skillsController, label: 'Skills', hint: 'cleaning, laundry, ironing'),
                      const SizedBox(height: 12),
                      LokalsTextField(controller: locationController, label: 'Town or area', hint: 'Nau-Aib'),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: LokalsTextField(
                              controller: experienceController,
                              label: 'Experience',
                              hint: '3',
                              keyboardType: TextInputType.number,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: LokalsTextField(
                              controller: rateController,
                              label: 'Hourly/day rate',
                              hint: '120',
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SwitchListTile.adaptive(
                        value: isAvailable,
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Available for new work'),
                        subtitle: const Text('Show your profile as ready to take quick local jobs'),
                        onChanged: (value) => setSheetState(() => isAvailable = value),
                      ),
                      if (error != null) ...[
                        const SizedBox(height: 12),
                        Text(error!, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.danger)),
                      ],
                      const SizedBox(height: 18),
                      AppButton(
                        label: 'Save profile',
                        isLoading: isSaving,
                        onPressed: () {
                          if (headlineController.text.trim().isEmpty || locationController.text.trim().isEmpty) {
                            setSheetState(() => error = 'Please add a profession and location first.');
                            return;
                          }
                          save();
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    headlineController.dispose();
    skillsController.dispose();
    locationController.dispose();
    experienceController.dispose();
    rateController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final jobsAsync = ref.watch(jobsProvider);
    final workersAsync = ref.watch(workersProvider);
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Work',
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(jobsProvider);
          ref.invalidate(workersProvider);
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Work nearby', style: AppTextStyles.eyebrow),
                      const SizedBox(height: 4),
                      Text('Jobs and local workers', style: AppTextStyles.h2),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.place_outlined, size: 16, color: AppColors.primaryPurple),
                      const SizedBox(width: 6),
                      Text(auth.user?.defaultArea ?? auth.user?.location ?? 'Near me', style: AppTextStyles.caption),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                gradient: const LinearGradient(
                  colors: [AppColors.deepPurple, AppColors.primaryPurple],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryPurple.withValues(alpha: 0.24),
                    blurRadius: 30,
                    offset: const Offset(0, 16),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _tab == 'find-help' ? 'Need quick help today?' : 'Ready to earn nearby?',
                    style: AppTextStyles.h3.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _tab == 'find-help'
                        ? 'Post a short job, compare trusted workers, and book local help quickly.'
                        : 'Browse open jobs, apply fast, and keep your worker profile ready for one-tap applications.',
                    style: AppTextStyles.bodyMuted.copyWith(color: Colors.white.withValues(alpha: 0.82)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _ModeChip(
                    label: 'Find Help',
                    active: _tab == 'find-help',
                    onTap: () => setState(() => _tab = 'find-help'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _ModeChip(
                    label: 'Earn Money',
                    active: _tab == 'earn-money',
                    onTap: () => setState(() => _tab = 'earn-money'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            AppSearchBar(
              controller: _searchController,
              hintText: 'Search jobs or workers...',
              recentKey: 'jobs',
              suggestions: const ['Cleaner needed', 'Painter nearby', 'Driver work', 'Tutor jobs'],
              shortcuts: const ['Near me', 'Urgent', 'Verified', 'New'],
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _skillFilters.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final item = _skillFilters[index];
                  final active = item == _skillFilter;
                  return FilterChip(
                    selected: active,
                    label: Text(item),
                    onSelected: (_) => setState(() => _skillFilter = item),
                    selectedColor: AppColors.primaryPurple,
                    labelStyle: TextStyle(color: active ? Colors.white : AppColors.deepCharcoal, fontWeight: FontWeight.w600),
                    checkmarkColor: Colors.white,
                    backgroundColor: Colors.white,
                    shape: StadiumBorder(side: BorderSide(color: active ? AppColors.primaryPurple : AppColors.border)),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            if (_feedback != null) ...[
              AppCard(
                child: Text(_feedback!, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.primaryGreen)),
              ),
              const SizedBox(height: 12),
            ],
            if (_tab == 'find-help') ...[
              AppCard(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Post a quick job', style: AppTextStyles.h3),
                          const SizedBox(height: 6),
                          Text('Share the task, budget, and area. Nearby workers can respond quickly.', style: AppTextStyles.bodyMuted),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    AppButton(label: 'Post Job', expanded: false, onPressed: _openPostJobSheet),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ] else ...[
              AppCard(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Complete your worker profile', style: AppTextStyles.h3),
                          const SizedBox(height: 6),
                          Text('Add skills, rates, and your area so local jobs feel quicker to apply for.', style: AppTextStyles.bodyMuted),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    AppButton(label: 'Set Up', expanded: false, onPressed: _openWorkerSetupSheet),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            SectionTitle(
              title: _tab == 'find-help' ? 'Recommended workers' : 'Jobs near you',
              subtitle: _tab == 'find-help'
                  ? 'Start with trusted local people who are available now.'
                  : 'Open local work with quick-apply momentum.',
              action: TextButton(
                onPressed: () => context.push(_tab == 'find-help' ? '/workers' : '/jobs'),
                child: const Text('View all'),
              ),
            ),
            const SizedBox(height: 12),
            if (_tab == 'find-help')
              workersAsync.when(
                data: (items) {
                  final workers = _filterWorkers(items).take(4).toList();
                  if (workers.isEmpty) {
                    return const EmptyStateView(
                      title: 'No workers found nearby',
                      body: 'No workers found nearby. Try another skill.',
                    );
                  }
                  return Column(
                    children: workers
                        .map(
                          (worker) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: WorkerCard(worker: worker),
                          ),
                        )
                        .toList(),
                  );
                },
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (error, _) => EmptyStateView(
                  title: 'Workers could not load',
                  body: 'Please retry in a moment.',
                  action: AppButton(
                    label: 'Retry',
                    expanded: false,
                    onPressed: () => ref.invalidate(workersProvider),
                  ),
                ),
              )
            else
              jobsAsync.when(
                data: (items) {
                  final jobs = _filterJobs(items).take(5).toList();
                  if (jobs.isEmpty) {
                    return const EmptyStateView(
                      title: 'No jobs nearby yet',
                      body: 'No work opportunities in Okahandja right now. Check again later or post one.',
                    );
                  }
                  return Column(
                    children: jobs
                        .map(
                          (job) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: JobCard(
                              job: job,
                              onApply: auth.token == null
                                  ? () => context.go('/login')
                                  : () async {
                                      try {
                                        await ref.read(discoveryRepositoryProvider).applyToJob(job.id, message: 'Ready to work and available nearby.');
                                        if (!mounted) return;
                                        setState(() => _feedback = 'Application sent for ${job.title}.');
                                      } catch (error) {
                                        if (!mounted || !context.mounted) return;
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text(error.toString().replaceFirst('Exception: ', ''))),
                                        );
                                      }
                                    },
                            ),
                          ),
                        )
                        .toList(),
                  );
                },
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (error, _) => EmptyStateView(
                  title: 'Jobs could not load',
                  body: 'Please retry in a moment.',
                  action: AppButton(
                    label: 'Retry',
                    expanded: false,
                    onPressed: () => ref.invalidate(jobsProvider),
                  ),
                ),
              ),
            const SizedBox(height: 16),
            if (_tab == 'find-help') ...[
              SectionTitle(
                title: 'Popular skills',
                subtitle: 'Common local help categories people book quickly.',
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: const [
                  _SkillTile(icon: Icons.cleaning_services_outlined, label: 'Cleaning'),
                  _SkillTile(icon: Icons.format_paint_outlined, label: 'Painting'),
                  _SkillTile(icon: Icons.yard_outlined, label: 'Garden'),
                  _SkillTile(icon: Icons.electrical_services_outlined, label: 'Electrical'),
                  _SkillTile(icon: Icons.plumbing_outlined, label: 'Plumbing'),
                  _SkillTile(icon: Icons.local_shipping_outlined, label: 'Drivers'),
                ],
              ),
            ] else ...[
              SectionTitle(
                title: 'Recommended workers',
                subtitle: 'See who is active locally while you browse open jobs.',
                action: TextButton(
                  onPressed: () => context.push('/workers'),
                  child: const Text('View all'),
                ),
              ),
              const SizedBox(height: 12),
              workersAsync.when(
                data: (items) {
                  final workers = _filterWorkers(items).take(3).toList();
                  if (workers.isEmpty) {
                    return const EmptyStateView(
                      title: 'No workers found nearby',
                      body: 'No workers found nearby. Try another skill.',
                    );
                  }
                  return Column(
                    children: workers
                        .map(
                          (worker) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: WorkerCard(worker: worker),
                          ),
                        )
                        .toList(),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => const SizedBox.shrink(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ModeChip extends StatelessWidget {
  const _ModeChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: active ? AppColors.primaryPurple : AppColors.neutralSoft,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: active ? Colors.white : AppColors.deepCharcoal,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _SkillTile extends StatelessWidget {
  const _SkillTile({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 102,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.purpleSoftAlt,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.primaryPurple),
          ),
          const SizedBox(height: 10),
          Text(label, textAlign: TextAlign.center, style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _ReviewRow extends StatelessWidget {
  const _ReviewRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 92, child: Text(label, style: AppTextStyles.caption)),
          Expanded(child: Text(value, style: AppTextStyles.bodyMuted.copyWith(color: AppColors.deepCharcoal))),
        ],
      ),
    );
  }
}
