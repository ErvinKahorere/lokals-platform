import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/experience/success_state.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/shell.dart';
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
  TimeOfDay _time = const TimeOfDay(hour: 10, minute: 0);
  DateTime _date = DateTime.now();
  int? _selectedServiceId;
  bool _showNotes = false;
  bool _success = false;

  @override
  Widget build(BuildContext context) {
    final provider = ref.watch(providerDetailsProvider(widget.providerId));

    return LokalsShell(
      title: 'Book service',
      showBack: true,
      child: provider.when(
        data: (item) {
          _selectedServiceId ??= item.services.isNotEmpty ? item.services.first.id : null;
          final selectedService = item.services.cast<dynamic>().firstWhere(
                (service) => service?.id == _selectedServiceId,
                orElse: () => null,
              );

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
                  onSecondary: () => context.go('/'),
                ),
              ],
            );
          }

          final dateOptions = List.generate(5, (index) => DateTime.now().add(Duration(days: index)));

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text('${item.category} • ${item.location}'),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                initialValue: _selectedServiceId,
                decoration: const InputDecoration(labelText: 'Service'),
                items: item.services
                    .map(
                      (service) => DropdownMenuItem<int>(
                        value: service.id,
                        child: Text('${service.name} - ${getDisplayPrice(service.price)}'),
                      ),
                    )
                    .toList(),
                onChanged: (value) => setState(() => _selectedServiceId = value),
              ),
              const SizedBox(height: 12),
              AppCard(
                color: const Color(0xFFDCFCE7),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Service summary', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(selectedService?.name ?? 'Select a service', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(selectedService == null ? 'Price stays visible before confirm.' : '${selectedService.durationMinutes} min • ${getDisplayPrice(selectedService.price)}'),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              const Text('Available dates', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              SizedBox(
                height: 48,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (context, index) {
                    final option = dateOptions[index];
                    final selected = DateFormat('yyyy-MM-dd').format(option) == DateFormat('yyyy-MM-dd').format(_date);
                    return ChoiceChip(
                      label: Text(DateFormat('EEE dd').format(option)),
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
              const SizedBox(height: 12),
              const Text('Time slots', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
                    .map(
                      (slot) => ChoiceChip(
                        label: Text(slot),
                        selected: '${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}' == slot,
                        onSelected: (_) {
                          final parts = slot.split(':');
                          setState(() {
                            _time = TimeOfDay(
                              hour: int.parse(parts[0]),
                              minute: int.parse(parts[1]),
                            );
                          });
                        },
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => setState(() => _showNotes = !_showNotes),
                child: Text(_showNotes ? 'Hide optional notes' : 'Add optional notes'),
              ),
              if (_showNotes)
                AppTextField(
                  controller: _notesController,
                  label: 'Notes',
                  maxLines: 4,
                ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _selectedServiceId == null
                    ? null
                    : () async {
                        await ref.read(bookingsRepositoryProvider).createBooking(
                              serviceId: _selectedServiceId!,
                              bookingDate: DateFormat('yyyy-MM-dd').format(_date),
                              startTime: '${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}',
                              notes: _notesController.text,
                            );
                        ref.invalidate(myBookingsProvider);
                        if (!mounted) return;
                        setState(() => _success = true);
                      },
                style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
                child: const Text('Confirm booking'),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Failed to load booking form: $error')),
      ),
    );
  }
}
