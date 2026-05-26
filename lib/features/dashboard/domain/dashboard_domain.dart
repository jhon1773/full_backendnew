import 'package:equatable/equatable.dart';

class DashboardSummary extends Equatable {
  const DashboardSummary({
    required this.pendingRequests,
    required this.publishedTestimonials,
    required this.activeNews,
    required this.countryStats,
    required this.globalMetrics,
  });

  final int pendingRequests;
  final int publishedTestimonials;
  final int activeNews;
  final List<CountryMetric> countryStats;
  final List<MetricCard> globalMetrics;

  factory DashboardSummary.empty() {
    return const DashboardSummary(
      pendingRequests: 0,
      publishedTestimonials: 0,
      activeNews: 0,
      countryStats: <CountryMetric>[],
      globalMetrics: <MetricCard>[],
    );
  }

  @override
  List<Object?> get props => [pendingRequests, publishedTestimonials, activeNews, countryStats, globalMetrics];
}

class MetricCard extends Equatable {
  const MetricCard({required this.label, required this.value, required this.iconKey});

  final String label;
  final String value;
  final String iconKey;

  @override
  List<Object?> get props => [label, value, iconKey];
}

class CountryMetric extends Equatable {
  const CountryMetric({required this.country, required this.value});

  final String country;
  final int value;

  @override
  List<Object?> get props => [country, value];
}

abstract class DashboardRepository {
  Future<DashboardSummary> loadSummary();
}

class LoadDashboardSummaryUseCase {
  const LoadDashboardSummaryUseCase(this._repository);

  final DashboardRepository _repository;

  Future<DashboardSummary> call() => _repository.loadSummary();
}