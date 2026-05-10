String roleHomePath(String? role) {
  switch (role) {
    case 'worker':
      return '/dashboard/worker';
    case 'seller':
    case 'business_owner':
    case 'driver':
      return '/dashboard/business';
    case 'service_provider':
      return '/dashboard/service-provider';
    case 'organization_admin':
      return '/dashboard/organization';
    case 'town_manager':
    case 'municipality_admin':
      return '/dashboard/town-manager';
    case 'super_admin':
    case 'operator':
      return '/dashboard/admin';
    default:
      return '/home';
  }
}
