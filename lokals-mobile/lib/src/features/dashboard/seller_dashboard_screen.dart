import 'package:flutter/material.dart';

import 'business_dashboard_screen.dart';

class SellerDashboardScreen extends StatelessWidget {
  const SellerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const BusinessDashboardScreen(
      title: 'Seller Dashboard',
      dashboardTitle: 'Seller dashboard',
      subtitle:
          'Products, local enquiries, promotions, and shop activity in one focused workspace.',
    );
  }
}
