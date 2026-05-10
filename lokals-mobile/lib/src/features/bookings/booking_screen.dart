import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/experience/success_state.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../services/services_repository.dart';
import 'bookings_repository.dart';

class BookingScreen extends ConsumerStatefulWidget {
  const BookingScreen({super.key, required this.providerId});

  final String providerId;

  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  final _notesController = TextEditingController();
  DateTime _date = DateTime.now();
  int? _selectedServiceId;
  String? _selectedTime;
  bool _success = false;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = ref.watch(providerDetailsProvider(widget.providerId));
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Book service',
      showBack: true,
      child: provider.when(
        data: (item) {
          final activeServices = item.services.where((service) => service.isActive && service.isBookable).toList();
          _selectedServiceId ??= activeServices.isNotEmpty ? activeServices.first.id : null;
          final selectedService = _findSelectedService(activeServices);
          final timeOptions = _buildTimeOptions(
            date: _date,
            availability: item.availabilitySlots,
            durationMinutes: selectedService?.durationMinutes ?? 60,
          );
          if (_selectedTime == null || !timeOptions.contains(_selectedTime)) {
            _selectedTime = timeOptions.isNotEmpty ? timeOptions.first : null;
          }

          if (_success) {
            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                SuccessState(
                  title: 'Booking requested',
                  body: 'Provider will confirm shortly.',
                  primaryLabel: 'View My Bookings',
                  onPrimary: () => context.go('/my-bookings'),
                  secondaryLabel: 'Back Home',
                  onSecondary: () => context.go('/home'),
                ),
              ],
            );
          }

          final dateOptions = List.generate(5, (index) => DateTime.now().add(Duration(days: index)));
          final selectedTimeLabel = _selectedTime ?? '';
          final canSubmit = _selectedServiceId != null && !_submitting && selectedTimeLabel.isNotEmpty;
          final locationLabel = [
            item.subcategory ?? item.category,
            item.area ?? item.town ?? item.location,
          ].whereType<String>().where((value) => value.isNotEmpty).join(' | ');

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.purpleSoftAlt,
                      child: Text(
                        item.name.characters.first.toUpperCase(),
                        style: AppTextStyles.h3.copyWith(color: AppColors.primaryPurple),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, style: AppTextStyles.h3),
                          const SizedBox(height: 4),
                          Text(locationLabel, style: AppTextStyles.bodyMuted),
                        ],
                      ),
                    ),
                    AppBadge(
                      label: item.openNow ? 'Open now' : (item.availabilityStatus ?? 'Available'),
                      tone: item.openNow ? AppBadgeTone.success : AppBadgeTone.info,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (activeServices.isEmpty)
                const AppCard(
                  child: Text(
                    'This provider is not taking instant bookings right now. Please call or WhatsApp to confirm availability.',
                  ),
                )
              else ...[
                const Text('Selected service', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                DropdownButtonFormField<int>(
                  initialValue: _selectedServiceId,
                  decoration: const InputDecoration(labelText: 'Choose a service'),
                  items: activeServices
                      .map(
                        (service) => DropdownMenuItem<int>(
                          value: service.id,
                          child: Text('${service.name} - ${getServicePriceLabel(price: service.price, priceType: service.priceType)}'),
                        ),
                      )
                      .toList(),
                  onChanged: (value) => setState(() => _selectedServiceId = value),
                ),
                const SizedBox(height: 12),
                AppCard(
                  color: AppColors.purpleSoftAlt,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Service summary', style: AppTextStyles.caption.copyWith(color: AppColors.primaryPurple)),
                      const SizedBox(height: 8),
                      Text(selectedService?.name ?? 'Select a service', style: AppTextStyles.h3.copyWith(fontSize: 18)),
                      const SizedBox(height: 4),
                      Text(
                        selectedService == null
                            ? 'Select a service to see timing and price.'
                            : '${selectedService.durationMinutes} mins | ${getServicePriceLabel(price: selectedService.price, priceType: selectedService.priceType)}',
                        style: AppTextStyles.bodyMuted,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                const Text('Date selection', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                SizedBox(
                  height: 48,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (context, index) {
                      final option = dateOptions[index];
                      final selected = DateFormat('yyyy-MM-dd').format(option) == DateFormat('yyyy-MM-dd').format(_date);
                      return ChoiceChip(
                        label: Text(DateFormat('EEE dd MMM').format(option)),
                        selected: selected,
                        onSelected: (_) => setState(() => _date = option),
                      );
                    },
                    separatorBuilder: (context, index) => const SizedBox(width: 10),
                    itemCount: dateOptions.length,
                  ),
                ),
                const SizedBox(height: 12),
                AppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(DateFormat('EEE, dd MMM yyyy').format(_date)),
                    trailing: const Icon(Icons.calendar_month),
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _date,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 60)),
                      );

                      if (picked != null) {
                        setState(() => _date = picked);
                      }
                    },
                  ),
                ),
                const SizedBox(height: 18),
                const Text('Time selection', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                if (timeOptions.isEmpty)
                  const AppCard(
                    child: Text(
                      'No time slots are available for this day. Choose another date or contact the provider directly.',
                    ),
                  )
                else
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: timeOptions
                        .map(
                          (slot) => ChoiceChip(
                            label: Text(slot),
                            selected: selectedTimeLabel == slot,
                            onSelected: (_) => setState(() => _selectedTime = slot),
                          ),
                        )
                        .toList(),
                  ),
                const SizedBox(height: 18),
                const Text('Notes', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _notesController,
                  label: 'Optional notes',
                  hint: 'Anything the provider should know before arrival?',
                  maxLines: 4,
                ),
                const SizedBox(height: 18),
                const Text('Contact info', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(auth.user?.name ?? 'Guest', style: AppTextStyles.h4),
                      const SizedBox(height: 4),
                      Text(auth.user?.phone ?? 'Sign in to save your phone number', style: AppTextStyles.bodyMuted),
                    ],
                  ),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600)),
              ],
              const SizedBox(height: 18),
              AppButton(
                label: _submitting ? 'Sending booking...' : 'Confirm Booking',
                onPressed: !canSubmit
                    ? null
                    : () async {
                        setState(() {
                          _submitting = true;
                          _error = null;
                        });
                        try {
                          await ref.read(bookingsRepositoryProvider).createBooking(
                                serviceId: _selectedServiceId!,
                                bookingDate: DateFormat('yyyy-MM-dd').format(_date),
                                startTime: selectedTimeLabel,
                                notes: _notesController.text,
                              );
                          ref.invalidate(myBookingsProvider);
                          if (!mounted) {
                            return;
                          }
                          setState(() => _success = true);
                        } on DioException catch (error) {
                          final response = error.response?.data;
                          var message = 'Unable to create booking right now.';
                          if (response is Map<String, dynamic>) {
                            final errors = response['errors'];
                            if (errors is Map && errors.values.isNotEmpty) {
                              final first = (errors.values.first as List?)?.first?.toString();
                              if (first != null) {
                                message = first;
                              }
                            } else if (response['message'] is String) {
                              message = response['message'] as String;
                            }
                          }
                          if (!mounted) {
                            return;
                          }
                          setState(() => _error = message);
                        } finally {
                          if (mounted) {
                            setState(() => _submitting = false);
                          }
                        }
                      },
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading booking details',
          message: 'Preparing availability and service info...',
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Failed to load booking form.',
              body: 'Please try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(providerDetailsProvider(widget.providerId)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  ServiceModel? _findSelectedService(List<ServiceModel> activeServices) {
    for (final service in activeServices) {
      if (service.id == _selectedServiceId) {
        return service;
      }
    }
    return null;
  }

  List<String> _buildTimeOptions({
    required DateTime date,
    required List<AvailabilitySlotModel> availability,
    required int durationMinutes,
  }) {
    final slotDuration = durationMinutes <= 30 ? 30 : durationMinutes;
    final matchingSlots = availability.where((slot) => slot.dayOfWeek == date.weekday % 7).toList();
    final options = <String>[];
    final now = DateTime.now();

    for (final slot in matchingSlots) {
      final startParts = slot.startTime.split(':');
      final endParts = slot.endTime.split(':');
      if (startParts.length < 2 || endParts.length < 2) {
        continue;
      }

      var cursor = DateTime(
        date.year,
        date.month,
        date.day,
        int.parse(startParts[0]),
        int.parse(startParts[1]),
      );
      final end = DateTime(
        date.year,
        date.month,
        date.day,
        int.parse(endParts[0]),
        int.parse(endParts[1]),
      );

      while (cursor.add(Duration(minutes: durationMinutes)).isBefore(end) ||
          cursor.add(Duration(minutes: durationMinutes)).isAtSameMomentAs(end)) {
        if (cursor.isAfter(now)) {
          options.add(DateFormat('HH:mm').format(cursor));
        }
        cursor = cursor.add(Duration(minutes: slotDuration));
      }
    }

    return options.toSet().toList()..sort();
  }
}
