import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import '../../src/core/models.dart';
import '../../core/theme/app_colors.dart';

const _okahandjaCenter = LatLng(-21.9836, 16.9170);

class LocationPickerMap extends StatefulWidget {
  const LocationPickerMap({
    super.key,
    required this.label,
    required this.onChanged,
    this.value,
    this.helpText,
  });

  final String label;
  final LocationPointModel? value;
  final ValueChanged<LocationPointModel> onChanged;
  final String? helpText;

  @override
  State<LocationPickerMap> createState() => _LocationPickerMapState();
}

class _LocationPickerMapState extends State<LocationPickerMap> {
  String? _message;

  Future<void> _useCurrentLocation() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() => _message = 'Location services are turned off. You can still type the address or tap the map.');
      return;
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      setState(() => _message = 'Location permission was denied. Enter the address manually or place the pin on the map.');
      return;
    }

    final position = await Geolocator.getCurrentPosition();
    final point = LocationPointModel(
      latitude: double.parse(position.latitude.toStringAsFixed(6)),
      longitude: double.parse(position.longitude.toStringAsFixed(6)),
    );
    widget.onChanged(point);
    if (mounted) {
      setState(() => _message = 'Current location captured. You can still move the pin before submitting.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final selected = widget.value;
    final center = selected == null
        ? _okahandjaCenter
        : LatLng(selected.latitude, selected.longitude);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.neutralSoftAlt,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(
                      widget.helpText ?? 'Tap the map to place a pin. Manual address entry still works if you skip the map.',
                      style: const TextStyle(color: AppColors.mutedText),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              TextButton.icon(
                onPressed: _useCurrentLocation,
                icon: const Icon(Icons.my_location_rounded),
                label: const Text('Current'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: SizedBox(
              height: 220,
              child: FlutterMap(
                options: MapOptions(
                  initialCenter: center,
                  initialZoom: 14,
                  onTap: (_, point) {
                    widget.onChanged(
                      LocationPointModel(
                        latitude: double.parse(point.latitude.toStringAsFixed(6)),
                        longitude: double.parse(point.longitude.toStringAsFixed(6)),
                      ),
                    );
                  },
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.lokals.mobile',
                  ),
                  if (selected != null)
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: LatLng(selected.latitude, selected.longitude),
                          width: 28,
                          height: 28,
                          child: Container(
                            decoration: const BoxDecoration(
                              color: AppColors.lokalsGreen,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                  RichAttributionWidget(
                    attributions: [
                      TextSourceAttribution(
                        'OpenStreetMap contributors',
                        onTap: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            selected == null
                ? 'No coordinates selected yet.'
                : 'Selected coordinates: ${selected.latitude.toStringAsFixed(5)}, ${selected.longitude.toStringAsFixed(5)}',
            style: const TextStyle(color: AppColors.mutedText),
          ),
          if (_message != null) ...[
            const SizedBox(height: 12),
            Text(_message!, style: const TextStyle(color: AppColors.mutedText)),
          ],
        ],
      ),
    );
  }
}
