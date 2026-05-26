import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/errors/failure.dart';
import '../../../core/widgets/access_denied_screen.dart';
import '../../../core/widgets/app_error_view.dart';
import '../../../core/widgets/app_loading_view.dart';
import '../../auth/presentation/auth_presentation.dart';
import '../domain/contact_requests_domain.dart';

class ContactRequestsBloc extends Cubit<ContactRequestsState> {
  ContactRequestsBloc({required ContactRequestsRepository repository})
      : _repository = repository,
        super(const ContactRequestsState()) {
    load();
  }

  final ContactRequestsRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(status: ContactRequestsStatus.loading, errorMessage: null));
    try {
      final items = await _repository.listRequests(country: state.countryFilter, status: state.statusFilter, query: state.query);
      emit(state.copyWith(status: ContactRequestsStatus.success, items: items));
    } catch (error) {
      emit(state.copyWith(status: ContactRequestsStatus.failure, errorMessage: Failure.fromException(error).message));
    }
  }

  Future<void> filterByStatus(ContactRequestStatus? status) async {
    emit(state.copyWith(statusFilter: status));
    await load();
  }

  Future<void> filterByCountry(String? country) async {
    emit(state.copyWith(countryFilter: country));
    await load();
  }

  Future<void> search(String query) async {
    emit(state.copyWith(query: query));
    await load();
  }

  Future<void> changeStatus(String id, ContactRequestStatus status) async {
    await _repository.updateStatus(id, status);
    await load();
  }

  Future<void> remove(String id) async {
    await _repository.deleteRequest(id);
    await load();
  }
}

enum ContactRequestsStatus { initial, loading, success, failure }

class ContactRequestsState extends Equatable {
  const ContactRequestsState({
    this.status = ContactRequestsStatus.initial,
    this.items = const <ContactRequest>[],
    this.statusFilter,
    this.countryFilter,
    this.query,
    this.errorMessage,
  });

  final ContactRequestsStatus status;
  final List<ContactRequest> items;
  final ContactRequestStatus? statusFilter;
  final String? countryFilter;
  final String? query;
  final String? errorMessage;

  ContactRequestsState copyWith({
    ContactRequestsStatus? status,
    List<ContactRequest>? items,
    ContactRequestStatus? statusFilter,
    String? countryFilter,
    String? query,
    String? errorMessage,
  }) {
    return ContactRequestsState(
      status: status ?? this.status,
      items: items ?? this.items,
      statusFilter: statusFilter ?? this.statusFilter,
      countryFilter: countryFilter ?? this.countryFilter,
      query: query ?? this.query,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, items, statusFilter, countryFilter, query, errorMessage];
}

class ContactRequestsScreen extends StatelessWidget {
  const ContactRequestsScreen({super.key, required this.contactRequestsBloc});

  final ContactRequestsBloc contactRequestsBloc;

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthBloc>().state.session;
    final allowed = session != null && (session.user.role == AppRoles.superadmin || session.user.role == AppRoles.adminPais);
    if (!allowed) {
      return const AccessDeniedScreen(message: 'Solo superadmin y admin_pais pueden administrar solicitudes.');
    }

    return BlocProvider.value(
      value: contactRequestsBloc,
      child: Scaffold(
        appBar: AppBar(title: const Text('Solicitudes de contacto')),
        body: BlocBuilder<ContactRequestsBloc, ContactRequestsState>(
          builder: (context, state) {
            if (state.status == ContactRequestsStatus.loading) {
              return const AppLoadingView(message: 'Cargando solicitudes...');
            }

            if (state.status == ContactRequestsStatus.failure) {
              return AppErrorView(message: state.errorMessage ?? 'No se pudieron cargar las solicitudes', onRetry: () => context.read<ContactRequestsBloc>().load());
            }

            return RefreshIndicator(
              onRefresh: () => context.read<ContactRequestsBloc>().load(),
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  TextField(
                    decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Buscar por nombre, correo o teléfono'),
                    onChanged: (value) => context.read<ContactRequestsBloc>().search(value),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilterChip(
                        label: const Text('Todas'),
                        selected: state.statusFilter == null,
                        onSelected: (_) => context.read<ContactRequestsBloc>().filterByStatus(null),
                      ),
                      ...ContactRequestStatus.values.map(
                        (status) => FilterChip(
                          label: Text(status.name),
                          selected: state.statusFilter == status,
                          onSelected: (_) => context.read<ContactRequestsBloc>().filterByStatus(status),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...state.items.map(
                    (request) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Card(
                        child: ListTile(
                          title: Text(request.name),
                          subtitle: Text('${request.email} · ${request.country} · ${request.status.name}'),
                          trailing: PopupMenuButton<String>(
                            onSelected: (value) async {
                              if (value == 'delete') {
                                await context.read<ContactRequestsBloc>().remove(request.id);
                              } else {
                                await context.read<ContactRequestsBloc>().changeStatus(request.id, ContactRequestStatus.values.byName(value));
                              }
                            },
                            itemBuilder: (context) => [
                              ...ContactRequestStatus.values.map(
                                (status) => PopupMenuItem(value: status.name, child: Text('Marcar ${status.name}')),
                              ),
                              const PopupMenuItem(value: 'delete', child: Text('Eliminar')),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (state.items.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 40),
                      child: Center(child: Text('No hay solicitudes para mostrar.')),
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