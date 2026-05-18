import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../src/core/models.dart';
import '../../core/theme/app_colors.dart';

const _okahandjaPreviewCenter = LatLng(-21.9836, 16.9170);

class LocationPreviewMap extends StatelessWidget {
  const LocationPreviewMap({
    super.key,
    this.primary,
    this.secondary,
  });

  final LocationPointModel? primary;
  final LocationPointModel? secondary;

  Future<void> _openMap(LocationPointModel point) async {
    final uri = Uri.parse(
      'https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=16/${point.latitude}/${point.longitude}',
    );
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final hasPoints = primary != null || secondary != null;
    final center = primary != null
        ? LatLng(primary!.latitude, primary!.longitude)
        : secondary != null
            ? LatLng(secondary!.latitude, secondary!.longitude)
            : _okahandjaPreviewCenter;

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
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: SizedBox(
              height: 220,
              child: FlutterMap(
                options: MapOptions(
                  initialCenter: center,
                  initialZoom: hasPoints ? 14 : 13,
                  interactionOptions: const InteractionOptions(flags: InteractiveFlag.drag | InteractiveFlag.pinchZoom),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.lokals.mobile',
                  ),
                  if (hasPoints)
                    MarkerLayer(
                      markers: [
                        if (primary != null)
                          Marker(
                            point: LatLng(primary!.latitude, primary!.longitude),
                            width: 28,
                            height: 28,
                            child: Container(
                              decoration: const BoxDecoration(
                                color: AppColors.lokalsGreen,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        if (secondary != null)
                          Marker(
                            point: LatLng(secondary!.latitude, secondary!.longitude),
                            width: 28,
                            height: 28,
                            child: Container(
                              decoration: const BoxDecoration(
                                color: AppColors.danger,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (hasPoints)
            TextButton.icon(
              onPressed: () => _openMap(primary ?? secondary!),
              icon: const Icon(Icons.map_outlined),
              label: const Text('Open in OpenStreetMap'),
            )
          else
            const Text(
              'A map preview will appear here once coordinates are available. Address details still remain visible above.',
              style: TextStyle(color: AppColors.mutedText),
            ),
        ],
      ),
    );
  }
}
