import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/errors/failure.dart';
import '../../../core/widgets/app_error_view.dart';
import '../../../core/widgets/app_loading_view.dart';
import '../../auth/presentation/auth_presentation.dart';
import '../domain/dashboard_domain.dart';

class DashboardBloc extends Cubit<DashboardState> {
  DashboardBloc({required DashboardRepository dashboardRepository})
      : _dashboardRepository = dashboardRepository,
        super(const DashboardState()) {
    loadDashboard();
  }

  final DashboardRepository _dashboardRepository;

  Future<void> loadDashboard() async {
    emit(state.copyWith(status: DashboardStatus.loading));
    try {
      final summary = await _dashboardRepository.loadSummary();
      emit(state.copyWith(status: DashboardStatus.success, summary: summary));
    } catch (error) {
      emit(state.copyWith(status: DashboardStatus.failure, errorMessage: Failure.fromException(error).message));
    }
  }
}

enum DashboardStatus { initial, loading, success, failure }

class DashboardState extends Equatable {
  const DashboardState({this.status = DashboardStatus.initial, this.summary, this.errorMessage});

  final DashboardStatus status;
  final DashboardSummary? summary;
  final String? errorMessage;

  DashboardState copyWith({DashboardStatus? status, DashboardSummary? summary, String? errorMessage}) {
    return DashboardState(
      status: status ?? this.status,
      summary: summary ?? this.summary,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, summary, errorMessage];
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.dashboardBloc});

  final DashboardBloc dashboardBloc;

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: dashboardBloc,
      child: BlocBuilder<DashboardBloc, DashboardState>(
        builder: (context, state) {
          final session = context.read<AuthBloc>().state.session;

          return Scaffold(
            appBar: AppBar(
              title: const Text('Dashboard'),
              actions: [
                if (session != null)
                  Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: Center(
                      child: Text(
                        '${session.user.role}${session.user.country != null ? ' · ${session.user.country}' : ''}',
                        style: Theme.of(context).textTheme.labelLarge,
                      ),
                    ),
                  ),
              ],
            ),
            body: RefreshIndicator(
              onRefresh: () => context.read<DashboardBloc>().loadDashboard(),
              child: Builder(
                builder: (context) {
                  if (state.status == DashboardStatus.loading) {
                    return const AppLoadingView(message: 'Cargando métricas del CMS...');
                  }

                  if (state.status == DashboardStatus.failure) {
                    return AppErrorView(message: state.errorMessage ?? 'No se pudo cargar el dashboard', onRetry: () => context.read<DashboardBloc>().loadDashboard());
                  }

                  final summary = state.summary ?? DashboardSummary.empty();
                  final isSuperadmin = session?.user.role == AppRoles.superadmin;

                  return ListView(
                    padding: const EdgeInsets.all(24),
                    children: [
                      Text(
                        isSuperadmin ? 'Vista global' : 'Vista territorial',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 16),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final columns = constraints.maxWidth >= 1000 ? 3 : constraints.maxWidth >= 700 ? 2 : 1;
                          return GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: summary.globalMetrics.length,
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: columns,
                              mainAxisExtent: 140,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                            ),
                            itemBuilder: (context, index) {
                              final metric = summary.globalMetrics[index];
                              return _MetricCard(metric: metric);
                            },
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                      _SectionCard(
                        title: 'Países con mayor actividad',
                        child: summary.countryStats.isEmpty
                            ? const Text('Sin datos regionales por el momento.')
                            : Column(
                                children: summary.countryStats
                                    .map((metric) => ListTile(
                                          contentPadding: EdgeInsets.zero,
                                          leading: const Icon(Icons.public_outlined),
                                          title: Text(metric.country),
                                          trailing: Text(metric.value.toString(), style: Theme.of(context).textTheme.titleMedium),
                                        ))
                                    .toList(growable: false),
                              ),
                      ),
                      const SizedBox(height: 16),
                      _SectionCard(
                        title: 'Resumen operativo',
                        child: Text(
                          isSuperadmin
                              ? 'El superadmin ve todos los países, métricas globales y control centralizado de portales.'
                              : 'Tu acceso está restringido al país asignado y a los módulos permitidos por rol.',
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.metric});

  final MetricCard metric;

  @override
  Widget build(BuildContext context) {
    final icon = switch (metric.iconKey) {
      'testimonials' => Icons.emoji_emotions_outlined,
      'news' => Icons.newspaper_outlined,
      _ => Icons.inbox_outlined,
    };

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const Spacer(),
            Text(metric.value, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(metric.label, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}