import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_controller.dart';
import 'citizen_dashboard_screen.dart';
import 'business_dashboard_screen.dart';
import 'courier_dashboard_screen.dart';
import 'driver_dashboard_screen.dart';
import 'seller_dashboard_screen.dart';
import 'organization_dashboard_screen.dart';
import 'service_provider_dashboard_screen.dart';
import 'super_admin_dashboard_screen.dart';
import 'town_manager_dashboard_screen.dart';
import 'worker_dashboard_screen.dart';

class DashboardRouterScreen extends ConsumerWidget {
  const DashboardRouterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final role = user?.currentRole ?? (user?.roles.isNotEmpty == true ? user!.roles.first : 'citizen');

    switch (role) {
      case 'worker':
        return const WorkerDashboardScreen();
      case 'seller':
        return const SellerDashboardScreen();
      case 'business_owner':
        return const BusinessDashboardScreen();
      case 'driver':
        return const DriverDashboardScreen();
      case 'courier':
        return const CourierDashboardScreen();
      case 'service_provider':
        return const ServiceProviderDashboardScreen();
      case 'organization_admin':
        return const OrganizationDashboardScreen();
      case 'town_manager':
      case 'municipality_admin':
        return const TownManagerDashboardScreen();
      case 'super_admin':
      case 'operator':
        return const SuperAdminDashboardScreen();
      default:
        return const CitizenDashboardScreen();
    }
  }
}
