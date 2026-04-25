import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';
import '../../core/models.dart';

final bookingsRepositoryProvider = Provider<BookingsRepository>((ref) {
  return BookingsRepository(ref);
});

final myBookingsProvider = FutureProvider<List<BookingModel>>((ref) async {
  return ref.read(bookingsRepositoryProvider).fetchMyBookings();
});

final providerBookingsProvider = FutureProvider<List<BookingModel>>((
  ref,
) async {
  return ref.read(bookingsRepositoryProvider).fetchProviderBookings();
});

class BookingsRepository {
  BookingsRepository(this.ref);

  final Ref ref;

  Future<List<BookingModel>> fetchMyBookings() async {
    final response = await ref.read(dioProvider).get('/bookings');
    final data = response.data;
    final list =
        (data is Map<String, dynamic> ? data['data'] : data) as List<dynamic>;

    return list
        .map((item) => BookingModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<BookingModel>> fetchProviderBookings() async {
    final response = await ref.read(dioProvider).get('/provider/bookings');
    final data = response.data;
    final list =
        (data is Map<String, dynamic> ? data['data'] : data) as List<dynamic>;

    return list
        .map((item) => BookingModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> createBooking({
    required int serviceId,
    required String bookingDate,
    required String startTime,
    required String notes,
  }) async {
    await ref
        .read(dioProvider)
        .post(
          '/bookings',
          data: {
            'service_id': serviceId,
            'booking_date': bookingDate,
            'start_time': startTime,
            'notes': notes,
          },
        );
  }

  Future<void> updateStatus(int bookingId, String status) async {
    await ref
        .read(dioProvider)
        .put('/bookings/$bookingId/status', data: {'status': status});
  }
}
