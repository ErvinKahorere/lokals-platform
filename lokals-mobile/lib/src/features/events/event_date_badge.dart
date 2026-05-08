import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class EventDateBadge extends StatelessWidget {
  const EventDateBadge({super.key, this.startsAt, this.endsAt});

  final String? startsAt;
  final String? endsAt;

  String _formatDate(String? value) {
    if (value == null || value.isEmpty) return 'Date TBC';
    return DateFormat('EEE, d MMM').format(DateTime.parse(value).toLocal());
  }

  String _formatTime(String? value) {
    if (value == null || value.isEmpty) return 'Time TBC';
    return DateFormat('HH:mm').format(DateTime.parse(value).toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_formatDate(startsAt), style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text('${_formatTime(startsAt)}${endsAt == null ? '' : ' - ${_formatTime(endsAt)}'}', style: const TextStyle(color: Color(0xFF64748B))),
        ],
      ),
    );
  }
}
