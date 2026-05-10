import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../auth/auth_navigation.dart';
import '../discovery/discovery_repository.dart';
import '../services/services_repository.dart';
import 'add_to_calendar_button.dart';
import 'event_card.dart';
import 'event_date_badge.dart';
import 'event_reminder_button.dart';
import 'save_event_button.dart';
import 'ticket_type_card.dart';

class EventDetailsScreen extends ConsumerStatefulWidget {
  const EventDetailsScreen({super.key, required this.eventId});

  final String eventId;

  @override
  ConsumerState<EventDetailsScreen> createState() => _EventDetailsScreenState();
}

class _EventDetailsScreenState extends ConsumerState<EventDetailsScreen> {
  final _holderName = TextEditingController();
  final _holderPhone = TextEditingController();
  int? _selectedTicketTypeId;
  bool _busy = false;
  bool _followBusy = false;
  String? _message;
  EventTicketModel? _reservedTicket;

  @override
  void dispose() {
    _holderName.dispose();
    _holderPhone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final details = ref.watch(eventDetailsProvider(widget.eventId));
    final followedOrganizationIds = ref.watch(followedOrganizationIdsProvider).asData?.value ?? <int>{};
    final followedProviderIds = ref.watch(followedProviderIdsProvider).asData?.value ?? <int>{};

    return LokalsShell(
      title: 'Event details',
      showBack: true,
      child: details.when(
        data: (payload) {
          final event = payload['data'] as EventModel;
          final related = payload['related'] as List<EventModel>;
          final organizer = event.organizer;
          final isFollowing = organizer == null
              ? false
              : organizer.type == 'organization'
                  ? followedOrganizationIds.contains(organizer.id)
                  : followedProviderIds.contains(organizer.id);

          Future<void> toggleFollow() async {
            if (organizer == null) return;
            final messenger = ScaffoldMessenger.of(context);
            setState(() => _followBusy = true);
            try {
              if (organizer.type == 'organization') {
                if (isFollowing) {
                  await ref.read(discoveryRepositoryProvider).unfollowOrganization(organizer.id);
                } else {
                  await ref.read(discoveryRepositoryProvider).followOrganization(organizer.id);
                }
                ref.invalidate(followedOrganizationIdsProvider);
              } else {
                if (isFollowing) {
                  await ref.read(servicesRepositoryProvider).unfollowProvider(organizer.id);
                } else {
                  await ref.read(servicesRepositoryProvider).followProvider(organizer.id);
                }
                ref.invalidate(followedProviderIdsProvider);
              }
              if (!mounted) return;
              messenger.showSnackBar(
                SnackBar(content: Text(isFollowing ? 'Unfollowed' : 'Following')),
              );
            } finally {
              if (mounted) setState(() => _followBusy = false);
            }
          }

          return ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  EventCard(event: event, featured: true),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('When and where', style: AppTextStyles.h3),
                        const SizedBox(height: 12),
                        EventDateBadge(startsAt: event.startsAt, endsAt: event.endsAt),
                        const SizedBox(height: 12),
                        Text(
                          event.locationLabel ?? event.location ?? [event.area, event.town].whereType<String>().join(', '),
                          style: AppTextStyles.body,
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            if (auth.token != null) SaveEventButton(eventId: event.id, isSaved: event.isSaved),
                            if (auth.token != null) EventReminderButton(eventId: event.id, startsAt: event.startsAt),
                            AddToCalendarButton(icsUrl: event.calendar?.icsUrl),
                            AppButton(
                              label: 'Share',
                              expanded: false,
                              variant: AppButtonVariant.secondary,
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Share is coming soon.')),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Organizer', style: AppTextStyles.h3),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: AppColors.purpleSoftAlt,
                              child: Text(
                                (organizer?.name ?? 'L').substring(0, 1),
                                style: AppTextStyles.h4.copyWith(color: AppColors.primaryPurple),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(organizer?.name ?? 'Local organizer', style: AppTextStyles.h4),
                                  const SizedBox(height: 4),
                                  Text(
                                    organizer?.isVerified == true ? 'Verified organizer' : 'Community organizer',
                                    style: AppTextStyles.bodyMuted,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          event.description ?? 'Event details and attendance information will appear here.',
                          style: AppTextStyles.bodyMuted,
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            AppButton(
                              label: isFollowing ? 'Following organizer' : 'Follow organizer',
                              expanded: false,
                              variant: isFollowing ? AppButtonVariant.primary : AppButtonVariant.secondary,
                              isLoading: _followBusy,
                              onPressed: organizer == null || auth.token == null ? null : toggleFollow,
                            ),
                            AppButton(
                              label: 'Copy contact',
                              expanded: false,
                              variant: AppButtonVariant.secondary,
                              onPressed: organizer == null
                                  ? null
                                  : () async {
                                      await Clipboard.setData(
                                        ClipboardData(text: organizer.phone ?? organizer.whatsapp ?? organizer.name),
                                      );
                                      if (!context.mounted) return;
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Organizer contact copied.')),
                                      );
                                    },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tickets', style: AppTextStyles.h3),
                        const SizedBox(height: 8),
                        const Text(
                          'Free tickets confirm instantly. Paid tickets are saved as a reserved request for follow-up.',
                          style: AppTextStyles.bodyMuted,
                        ),
                        const SizedBox(height: 14),
                        if (event.ticketTypes.isEmpty)
                          const EmptyStateView(
                            title: 'No ticket options yet',
                            body: 'This organizer has not published ticket types yet.',
                          )
                        else
                          ...event.ticketTypes.map((type) => Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: TicketTypeCard(
                                  ticketType: type,
                                  selected: _selectedTicketTypeId == type.id,
                                  onTap: () => setState(() => _selectedTicketTypeId = type.id),
                                ),
                              )),
                        if (_reservedTicket != null) ...[
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFFA7F3D0)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Ticket reserved', style: AppTextStyles.h4),
                                const SizedBox(height: 8),
                                Text(_reservedTicket!.status == 'confirmed' ? 'Free ticket confirmed.' : 'Paid ticket enquiry reserved.', style: AppTextStyles.bodyMuted),
                                const SizedBox(height: 10),
                                Text('Code: ${_reservedTicket!.ticketCode}', style: const TextStyle(fontWeight: FontWeight.w800)),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 10,
                                  runSpacing: 10,
                                  children: [
                                    AppButton(label: 'View My Tickets', expanded: false, onPressed: () => context.go('/my-tickets')),
                                    AddToCalendarButton(icsUrl: event.calendar?.icsUrl),
                                    AppButton(
                                      label: 'Back to Events',
                                      expanded: false,
                                      variant: AppButtonVariant.secondary,
                                      onPressed: () => context.go('/events'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ] else if (auth.token == null) ...[
                          const SizedBox(height: 12),
                          AppButton(
                            label: 'Login to reserve',
                            onPressed: () => promptSignIn(
                              context,
                              next: GoRouterState.of(context).uri.toString(),
                            ),
                          ),
                        ] else ...[
                          const SizedBox(height: 12),
                          LokalsTextField(controller: _holderName, label: 'Holder name', hint: 'Optional'),
                          const SizedBox(height: 12),
                          LokalsTextField(controller: _holderPhone, label: 'Holder phone', hint: 'Optional'),
                          if (_message != null) ...[
                            const SizedBox(height: 10),
                            Text(
                              _message!,
                              style: AppTextStyles.body.copyWith(color: AppColors.danger),
                            ),
                          ],
                          const SizedBox(height: 12),
                          AppButton(
                            label: event.isFree ? 'Confirm free ticket' : 'Reserve ticket enquiry',
                            isLoading: _busy,
                            onPressed: _busy
                                ? null
                                : () async {
                                    setState(() {
                                      _busy = true;
                                      _message = null;
                                    });
                                    try {
                                      final ticket = await ref.read(discoveryRepositoryProvider).reserveEventTicket(
                                        eventId: event.id,
                                        ticketTypeId: _selectedTicketTypeId,
                                        holderName: _holderName.text.isEmpty ? null : _holderName.text,
                                        holderPhone: _holderPhone.text.isEmpty ? null : _holderPhone.text,
                                      );
                                      ref.invalidate(myTicketsProvider);
                                      if (!mounted) return;
                                      setState(() => _reservedTicket = ticket);
                                    } catch (error) {
                                      setState(() => _message = 'Unable to reserve a ticket right now.');
                                    } finally {
                                      if (mounted) setState(() => _busy = false);
                                    }
                                  },
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (related.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const SectionTitle(title: 'Related events'),
                    const SizedBox(height: 12),
                    ...related.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: EventCard(event: item),
                        )),
                  ],
                ],
              );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => const Center(
          child: EmptyStateView(
            title: 'Event unavailable',
            body: 'We could not load this event right now.',
          ),
        ),
      ),
    );
  }
}
