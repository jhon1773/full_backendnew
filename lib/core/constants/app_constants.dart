class AppApiEndpoints {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api/v1',
  );

  static const String login = '/user';
  static const String me = '/user/me';
  static const String logout = '/user/logout';
  static const String refresh = '/auth/refresh';
  static const String dashboard = '/dashboard/metrics';
  static const String portals = '/portals';
  static const String requests = '/requests';
  static const String testimonials = '/testimonials';
  static const String news = '/news';
  static const String publicContact = '/requests/public';
}

class AppRoutes {
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String portals = '/portals';
  static const String requests = '/requests';
  static const String testimonials = '/testimonials';
  static const String news = '/news';
  static const String publicContact = '/contact';
}

class AppRouteNames {
  static const String login = 'login';
  static const String dashboard = 'dashboard';
  static const String portals = 'portals';
  static const String requests = 'requests';
  static const String testimonials = 'testimonials';
  static const String news = 'news';
  static const String publicContact = 'publicContact';
}

class AppRoles {
  static const String superadmin = 'superadmin';
  static const String adminPais = 'admin_pais';
  static const String editor = 'editor';
}