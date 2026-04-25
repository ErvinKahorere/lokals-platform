import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../shared/widgets/alert_card.dart';
import '../../../shared/widgets/app_search_bar.dart';
import '../../../shared/widgets/experience/nearby_service_card.dart';
import '../../../shared/widgets/experience/notification_bell.dart';
import '../../../shared/widgets/experience/quick_action_grid.dart';
import '../../../shared/widgets/experience/recent_activity_card.dart';
import '../../../shared/widgets/experience/smart_suggestion_card.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'onboarding_flow.dart';
import '../services/services_repository.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();
  bool _showGuide = false;
  bool _showOnboarding = false;

  @override
  void initState() {
    super.initState();
    _loadGuide();
  }

  Future<void> _loadGuide() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _showGuide = prefs.getBool('lokals_home_guide_dismissed') != true;
      _showOnboarding = prefs.getBool('lokals_onboarding_complete') != true;
    });
  }

  Future<void> _dismissGuide() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('lokals_home_guide_dismissed', true);
    if (!mounted) return;
    setState(() => _showGuide = false);
  }

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('lokals_onboarding_complete', true);
    if (!mounted) return;
    setState(() => _showOnboarding = false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final providers = ref.watch(servicesProvider);
    final alertsFeed = ref.watch(alertsFeedProvider);
    final preferences = ref.watch(preferencesProvider);
    final preferenceData = preferences.asData?.value;
    final town = user?.defaultTown ?? preferenceData?.defaultTown ?? 'Windhoek';
    final area = user?.defaultArea ?? preferenceData?.defaultArea;

    return LokalsShell(
      title: 'LOKALS',
      actions: const [NotificationBell(count: 3)],
      child: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.all(20),
            children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              gradient: const LinearGradient(
                colors: [Color(0xFF312E81), Color(0xFF4F46E5), Color(0xFF7C3AED)],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user == null ? 'Good day' : 'Good day, ${user.name}',
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 8),
                Text(
                  'Showing results for $town',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  area == null
                      ? 'What can you do in the next 3 seconds? Search, book, post, request a ride, sell an item, or open SOS.'
                      : '$area first. What can you do in the next 3 seconds? Search, book, post, request a ride, sell an item, or open SOS.',
                  style: TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 14),
                AppSearchBar(
                  controller: _searchController,
                  hintText: 'Search services, jobs, products...',
                  recentKey: 'home',
                  suggestions: const ['Barber nearby', 'Clinic open now', 'Jobs near me', 'Parcel delivery'],
                  shortcuts: const ['Get Help', 'Shop', 'Stay'],
                ),
              ],
            ),
          ),
          if (_showGuide) ...[
            const SizedBox(height: 18),
            LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('What do you want to do today?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                            SizedBox(height: 6),
                            Text('Choose one path and LOKALS will keep the next step obvious.'),
                          ],
                        ),
                      ),
                      IconButton(onPressed: _dismissGuide, icon: const Icon(Icons.close_rounded)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      AppButton(label: 'Find a service', expanded: false, variant: AppButtonVariant.secondary, onPressed: () => context.go('/services')),
                      AppButton(label: 'Find work', expanded: false, variant: AppButtonVariant.secondary, onPressed: () => context.go('/jobs')),
                      AppButton(label: 'Shop', expanded: false, variant: AppButtonVariant.secondary, onPressed: () => context.go('/store')),
                    ],
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 18),
          const SectionTitle(title: 'Quick actions'),
          const SizedBox(height: 12),
          const QuickActionGrid(),
          const SizedBox(height: 18),
          const SectionTitle(title: 'Smart suggestions'),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 1,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: const [
              SmartSuggestionCard(
                title: 'Need a barber nearby?',
                body: 'Browse trusted services, compare pricing, and call or book fast.',
                icon: Icons.content_cut_rounded,
                route: '/services',
                badge: 'Primary',
              ),
              SmartSuggestionCard(
                title: 'Directory help nearby',
                body: 'Clinics, police, schools, and trusted public services stay easy to reach.',
                icon: Icons.local_hospital_outlined,
                route: '/directory',
                badge: 'Trusted',
              ),
            ],
          ),
          const SizedBox(height: 18),
          const SectionTitle(title: 'Nearby services'),
          const SizedBox(height: 12),
          providers.when(
            data: (items) => Column(
              children: items.take(2).map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: NearbyServiceCard(provider: item),
              )).toList(),
            ),
            loading: () => const LoadingSkeleton(height: 160),
            error: (error, _) => Text('Services unavailable: $error'),
          ),
          const SizedBox(height: 18),
          const SectionTitle(title: 'Recent activity'),
          const SizedBox(height: 12),
          const RecentActivityCard(
            icon: Icons.event_available_outlined,
            title: 'Booking confirmed',
            body: 'Your last appointment request is now with the provider.',
            time: '2 min ago',
            status: 'Bookings',
          ),
          const SizedBox(height: 12),
          const RecentActivityCard(
            icon: Icons.work_outline_rounded,
            title: 'Job application sent',
            body: 'Your worker details were reused to keep the flow quick.',
            time: '1 hour ago',
            status: 'Work',
          ),
          const SizedBox(height: 18),
          alertsFeed.when(
            data: (items) => items.isEmpty
                ? const SizedBox.shrink()
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SectionTitle(title: 'Alerts near you'),
                      const SizedBox(height: 12),
                      ...items.take(2).map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: AlertCard(
                            title: item.title,
                            body: item.body,
                            priority: item.severity ?? 'info',
                            location: item.location,
                          ),
                        ),
                      ),
                    ],
                  ),
            loading: () => const LoadingSkeleton(height: 120),
            error: (error, _) => Text('Alerts unavailable: $error'),
          ),
            ],
          ),
          if (_showOnboarding) Positioned.fill(child: OnboardingFlow(onComplete: _completeOnboarding)),
        ],
      ),
    );
  }
}
