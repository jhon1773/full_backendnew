import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../domain/dashboard_domain.dart';

class DashboardRepositoryImpl implements DashboardRepository {
  DashboardRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  @override
  Future<DashboardSummary> loadSummary() async {
    try {
      final payload = await _apiClient.getJson(AppApiEndpoints.dashboard);
      return _mapSummary(payload);
    } catch (_) {
      return DashboardSummary.empty();
    }
  }

  DashboardSummary _mapSummary(Map<String, dynamic> payload) {
    final globalMetrics = <MetricCard>[
      MetricCard(label: 'Solicitudes pendientes', value: (payload['pendingRequests'] ?? 0).toString(), iconKey: 'requests'),
      MetricCard(label: 'Testimonios publicados', value: (payload['publishedTestimonials'] ?? 0).toString(), iconKey: 'testimonials'),
      MetricCard(label: 'Noticias activas', value: (payload['activeNews'] ?? 0).toString(), iconKey: 'news'),
    ];

    final countryStats = (payload['countryStats'] as List<dynamic>? ?? const <dynamic>[])
        .whereType<Map<String, dynamic>>()
        .map((item) => CountryMetric(country: item['country']?.toString() ?? '', value: (item['value'] ?? 0) as int))
        .toList(growable: false);

    return DashboardSummary(
      pendingRequests: payload['pendingRequests'] ?? 0,
      publishedTestimonials: payload['publishedTestimonials'] ?? 0,
      activeNews: payload['activeNews'] ?? 0,
      countryStats: countryStats,
      globalMetrics: globalMetrics,
    );
  }
}