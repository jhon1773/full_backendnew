import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/errors/failure.dart';
import '../../../core/widgets/access_denied_screen.dart';
import '../../../core/widgets/app_error_view.dart';
import '../../../core/widgets/app_loading_view.dart';
import '../../auth/presentation/auth_presentation.dart';
import '../domain/portals_domain.dart';

class PortalsBloc extends Cubit<PortalsState> {
  PortalsBloc({required PortalsRepository repository})
      : _repository = repository,
        super(const PortalsState()) {
    load();
  }

  final PortalsRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(status: PortalsStatus.loading, errorMessage: null));
    try {
      final items = await _repository.listPortals(query: state.query, activeOnly: state.activeOnly);
      emit(state.copyWith(status: PortalsStatus.success, items: items));
    } catch (error) {
      emit(state.copyWith(status: PortalsStatus.failure, errorMessage: Failure.fromException(error).message));
    }
  }

  Future<void> search(String query) async {
    emit(state.copyWith(query: query));
    await load();
  }

  Future<void> toggleActive(String id, bool isActive) async {
    await _repository.toggleStatus(id, isActive);
    await load();
  }

  Future<void> setActiveOnly(bool? activeOnly) async {
    emit(state.copyWith(activeOnly: activeOnly));
    await load();
  }
}

enum PortalsStatus { initial, loading, success, failure }

class PortalsState extends Equatable {
  const PortalsState({
    this.status = PortalsStatus.initial,
    this.items = const <Portal>[],
    this.query,
    this.activeOnly,
    this.errorMessage,
  });

  final PortalsStatus status;
  final List<Portal> items;
  final String? query;
  final bool? activeOnly;
  final String? errorMessage;

  PortalsState copyWith({PortalsStatus? status, List<Portal>? items, String? query, bool? activeOnly, String? errorMessage}) {
    return PortalsState(
      status: status ?? this.status,
      items: items ?? this.items,
      query: query ?? this.query,
      activeOnly: activeOnly ?? this.activeOnly,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, items, query, activeOnly, errorMessage];
}

class PortalsScreen extends StatelessWidget {
  const PortalsScreen({super.key, required this.portalsBloc});

  final PortalsBloc portalsBloc;

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthBloc>().state.session;
    final allowed = session != null && session.user.role == AppRoles.superadmin;
    if (!allowed) {
      return const AccessDeniedScreen(message: 'Solo superadmin puede administrar portales y países.');
    }

    return BlocProvider.value(
      value: portalsBloc,
      child: Scaffold(
        appBar: AppBar(title: const Text('Países y portales')),
        body: BlocBuilder<PortalsBloc, PortalsState>(
          builder: (context, state) {
            if (state.status == PortalsStatus.loading) {
              return const AppLoadingView(message: 'Cargando portales...');
            }

            if (state.status == PortalsStatus.failure) {
              return AppErrorView(message: state.errorMessage ?? 'No se pudieron cargar los portales', onRetry: () => context.read<PortalsBloc>().load());
            }

            return RefreshIndicator(
              onRefresh: () => context.read<PortalsBloc>().load(),
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  TextField(
                    decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Buscar país o portal'),
                    onChanged: (value) => context.read<PortalsBloc>().search(value),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: [
                      FilterChip(
                        label: const Text('Todos'),
                        selected: state.activeOnly == null,
                        onSelected: (_) => context.read<PortalsBloc>().setActiveOnly(null),
                      ),
                      FilterChip(
                        label: const Text('Activos'),
                        selected: state.activeOnly == true,
                        onSelected: (_) => context.read<PortalsBloc>().setActiveOnly(true),
                      ),
                      FilterChip(
                        label: const Text('Inactivos'),
                        selected: state.activeOnly == false,
                        onSelected: (_) => context.read<PortalsBloc>().setActiveOnly(false),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...state.items.map(
                    (portal) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Card(
                        child: ListTile(
                          leading: Icon(portal.isActive ? Icons.check_circle : Icons.remove_circle, color: portal.isActive ? Colors.green : Theme.of(context).colorScheme.error),
                          title: Text(portal.name),
                          subtitle: Text('${portal.country} · ${portal.isActive ? 'activo' : 'inactivo'}'),
                          trailing: Switch(
                            value: portal.isActive,
                            onChanged: (value) => context.read<PortalsBloc>().toggleActive(portal.id, value),
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (state.items.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 40),
                      child: Center(child: Text('No hay portales para mostrar.')),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}