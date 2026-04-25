import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_search_bar.dart';
import '../../../shared/widgets/experience/smart_suggestion_card.dart';
import '../../../shared/widgets/job_card.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';

class JobsScreen extends ConsumerStatefulWidget {
  const JobsScreen({super.key});

  @override
  ConsumerState<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends ConsumerState<JobsScreen> {
  String? _message;
  String _tab = 'find-help';
  final _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final jobs = ref.watch(jobsProvider);
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Work',
      child: jobs.when(
        data: (items) {
          final filtered = items.where((job) {
            final query = _searchController.text.toLowerCase();
            return query.isEmpty || job.title.toLowerCase().contains(query) || job.description.toLowerCase().contains(query);
          }).toList();

          return filtered.isEmpty
              ? const EmptyStateView(
                  title: 'No work found nearby',
                  body: 'Try broadening your search.',
                )
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    const SectionTitle(
                      title: 'Find help or earn money',
                      subtitle: 'Nearby jobs, local budgets, and recommended work.',
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ChoiceChip(
                            label: const Text('Find Help'),
                            selected: _tab == 'find-help',
                            onSelected: (_) => setState(() => _tab = 'find-help'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ChoiceChip(
                            label: const Text('Earn Money'),
                            selected: _tab == 'earn-money',
                            onSelected: (_) => setState(() => _tab = 'earn-money'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    AppSearchBar(
                      controller: _searchController,
                      hintText: 'Find a barber, job, product...',
                      recentKey: 'work',
                      suggestions: const ['Jobs near me', 'Cleaner needed', 'Driver work', 'Part-time work'],
                      shortcuts: const ['Popular near you', 'Available now', 'Affordable'],
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 16),
                    if (_tab == 'find-help') ...[
                      const SmartSuggestionCard(
                        title: 'Post Job',
                        body: 'Describe the task once and start getting local responses quickly.',
                        icon: Icons.post_add_outlined,
                        route: '/jobs',
                        badge: 'Find help',
                      ),
                      const SizedBox(height: 12),
                    ] else ...[
                      const SmartSuggestionCard(
                        title: 'Complete your worker profile',
                        body: 'Saved skills and location help applications feel one-tap.',
                        icon: Icons.badge_outlined,
                        route: '/workers',
                        badge: 'Earn more',
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (_message != null) ...[
                      LokalsCard(
                        child: Text(
                          _message!,
                          style: const TextStyle(color: Color(0xFF166534)),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                    ...filtered.map(
                      (job) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: JobCard(
                          job: job,
                          onApply: () async {
                            if (auth.token == null) {
                              if (!mounted) return;
                              context.go('/login');
                              return;
                            }
                            await ref.read(discoveryRepositoryProvider).applyToJob(job.id);
                            setState(() {
                              _message = 'Application sent for ${job.title}.';
                            });
                          },
                        ),
                      ),
                    ),
                  ],
                );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Something went wrong. Try again. $error')),
      ),
    );
  }
}

