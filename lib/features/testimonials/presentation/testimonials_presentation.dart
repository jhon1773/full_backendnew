import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/errors/failure.dart';
import '../../../core/widgets/access_denied_screen.dart';
import '../../../core/widgets/app_error_view.dart';
import '../../../core/widgets/app_loading_view.dart';
import '../../auth/presentation/auth_presentation.dart';
import '../domain/testimonials_domain.dart';

class TestimonialsBloc extends Cubit<TestimonialsState> {
  TestimonialsBloc({required TestimonialsRepository repository})
      : _repository = repository,
        super(const TestimonialsState()) {
    load();
  }

  final TestimonialsRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(status: TestimonialsStatus.loading, errorMessage: null));
    try {
      final items = await _repository.listTestimonials(country: state.countryFilter, status: state.statusFilter, query: state.query);
      emit(state.copyWith(status: TestimonialsStatus.success, items: items));
    } catch (error) {
      emit(state.copyWith(status: TestimonialsStatus.failure, errorMessage: Failure.fromException(error).message));
    }
  }

  Future<void> search(String query) async {
    emit(state.copyWith(query: query));
    await load();
  }

  Future<void> filterByStatus(TestimonialStatus? status) async {
    emit(state.copyWith(statusFilter: status));
    await load();
  }

  Future<void> filterByCountry(String? country) async {
    emit(state.copyWith(countryFilter: country));
    await load();
  }

  Future<void> save(Testimonial testimonial, {String? localImagePath}) async {
    await _repository.save(testimonial, localImagePath: localImagePath);
    await load();
  }

  Future<void> delete(String id) async {
    await _repository.delete(id);
    await load();
  }

  Future<void> setStatus(String id, TestimonialStatus status) async {
    await _repository.setStatus(id, status);
    await load();
  }
}

enum TestimonialsStatus { initial, loading, success, failure }

class TestimonialsState extends Equatable {
  const TestimonialsState({
    this.status = TestimonialsStatus.initial,
    this.items = const <Testimonial>[],
    this.statusFilter,
    this.countryFilter,
    this.query,
    this.errorMessage,
  });

  final TestimonialsStatus status;
  final List<Testimonial> items;
  final TestimonialStatus? statusFilter;
  final String? countryFilter;
  final String? query;
  final String? errorMessage;

  TestimonialsState copyWith({TestimonialsStatus? status, List<Testimonial>? items, TestimonialStatus? statusFilter, String? countryFilter, String? query, String? errorMessage}) {
    return TestimonialsState(
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

class TestimonialsScreen extends StatelessWidget {
  const TestimonialsScreen({super.key, required this.testimonialsBloc});

  final TestimonialsBloc testimonialsBloc;

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthBloc>().state.session;
    final allowed = session != null && (session.user.role == AppRoles.superadmin || session.user.role == AppRoles.adminPais || session.user.role == AppRoles.editor);
    if (!allowed) {
      return const AccessDeniedScreen(message: 'Solo superadmin, admin_pais y editor pueden administrar testimonios.');
    }

    return BlocProvider.value(
      value: testimonialsBloc,
      child: Scaffold(
        appBar: AppBar(title: const Text('Testimonios')),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _openEditor(context, testimonialsBloc: testimonialsBloc),
          child: const Icon(Icons.add),
        ),
        body: BlocBuilder<TestimonialsBloc, TestimonialsState>(
          builder: (context, state) {
            if (state.status == TestimonialsStatus.loading) {
              return const AppLoadingView(message: 'Cargando testimonios...');
            }

            if (state.status == TestimonialsStatus.failure) {
              return AppErrorView(message: state.errorMessage ?? 'No se pudieron cargar los testimonios', onRetry: () => context.read<TestimonialsBloc>().load());
            }

            return RefreshIndicator(
              onRefresh: () => context.read<TestimonialsBloc>().load(),
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  _HeroBanner(
                    title: 'Gestión de testimonios',
                    subtitle: 'Publica historias por país, controla visibilidad y administra imágenes desde una interfaz editorial limpia.',
                    accentLabel: '${state.items.length} registros',
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Buscar testimonios'),
                    onChanged: (value) => context.read<TestimonialsBloc>().search(value),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilterChip(label: const Text('Todos'), selected: state.statusFilter == null, onSelected: (_) => context.read<TestimonialsBloc>().filterByStatus(null)),
                      ...TestimonialStatus.values.map(
                        (status) => FilterChip(label: Text(status.name), selected: state.statusFilter == status, onSelected: (_) => context.read<TestimonialsBloc>().filterByStatus(status)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...state.items.map(
                    (testimonial) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              _Thumbnail(imageUrl: testimonial.imageUrl),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(testimonial.name, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                                        ),
                                        _StatusChip(label: testimonial.status.name),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(testimonial.country, style: Theme.of(context).textTheme.bodyMedium),
                                    const SizedBox(height: 8),
                                    Text(testimonial.text, maxLines: 3, overflow: TextOverflow.ellipsis),
                                    if (testimonial.instagram != null || testimonial.facebook != null) ...[
                                      const SizedBox(height: 10),
                                      Wrap(
                                        spacing: 8,
                                        runSpacing: 8,
                                        children: [
                                          if (testimonial.instagram != null) _SocialChip(label: 'Instagram'),
                                          if (testimonial.facebook != null) _SocialChip(label: 'Facebook'),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              PopupMenuButton<String>(
                                onSelected: (value) async {
                                  if (value == 'edit') {
                                    await _openEditor(context, testimonialsBloc: testimonialsBloc, existing: testimonial);
                                  } else if (value == 'delete') {
                                    await context.read<TestimonialsBloc>().delete(testimonial.id);
                                  } else {
                                    await context.read<TestimonialsBloc>().setStatus(testimonial.id, TestimonialStatus.values.byName(value));
                                  }
                                },
                                itemBuilder: (context) => [
                                  const PopupMenuItem(value: 'edit', child: Text('Editar')),
                                  ...TestimonialStatus.values.map((status) => PopupMenuItem(value: status.name, child: Text('Marcar ${status.name}'))),
                                  const PopupMenuItem(value: 'delete', child: Text('Eliminar')),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (state.items.isEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: _EmptyModuleState(
                        icon: Icons.emoji_emotions_outlined,
                        title: 'Aún no hay testimonios',
                        description: 'Crea el primero para activar la narrativa social del país o del portal seleccionado.',
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Future<void> _openEditor(BuildContext context, {required TestimonialsBloc testimonialsBloc, Testimonial? existing}) async {
    final formKey = GlobalKey<FormState>();
    final session = context.read<AuthBloc>().state.session;
    final isSuperadmin = session?.user.role == AppRoles.superadmin;
    final sessionCountry = session?.user.country;
    final hasSessionCountry = sessionCountry != null && sessionCountry.isNotEmpty;
    final nameController = TextEditingController(text: existing?.name ?? '');
    final textController = TextEditingController(text: existing?.text ?? '');
    final countryController = TextEditingController(text: existing?.country ?? sessionCountry ?? '');
    final instagramController = TextEditingController(text: existing?.instagram ?? '');
    final facebookController = TextEditingController(text: existing?.facebook ?? '');
    String? imagePath;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Text(existing == null ? 'Nuevo testimonio' : 'Editar testimonio'),
              content: SizedBox(
                width: 560,
                child: Form(
                  key: formKey,
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextFormField(controller: nameController, decoration: const InputDecoration(labelText: 'Nombre'), validator: _required),
                        TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Texto'), maxLines: 4, validator: _required),
                        TextFormField(
                          controller: countryController,
                          decoration: const InputDecoration(labelText: 'País'),
                          validator: _required,
                          readOnly: !isSuperadmin && hasSessionCountry,
                        ),
                        TextFormField(controller: instagramController, decoration: const InputDecoration(labelText: 'Instagram')),
                        TextFormField(controller: facebookController, decoration: const InputDecoration(labelText: 'Facebook')),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            OutlinedButton.icon(
                              onPressed: () async {
                                final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
                                if (picked != null) {
                                  setState(() => imagePath = picked.path);
                                }
                              },
                              icon: const Icon(Icons.photo_library_outlined),
                              label: const Text('Galería'),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Text(imagePath ?? existing?.imageUrl ?? 'Sin imagen seleccionada')),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.of(dialogContext).pop(), child: const Text('Cancelar')),
                FilledButton(
                  onPressed: () async {
                    if (!formKey.currentState!.validate()) return;
                    final imageUrl = imagePath?.isNotEmpty == true ? imagePath : existing?.imageUrl;
                    if ((imageUrl == null || imageUrl.isEmpty) && existing == null) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Selecciona una imagen para crear el testimonio.')),
                        );
                      }
                      return;
                    }

                    try {
                      await testimonialsBloc.save(
                            Testimonial(
                              id: existing?.id ?? '',
                              name: nameController.text.trim(),
                              imageUrl: imageUrl ?? '',
                              text: textController.text.trim(),
                              country: countryController.text.trim(),
                              status: existing?.status ?? TestimonialStatus.draft,
                              instagram: instagramController.text.trim().isEmpty ? null : instagramController.text.trim(),
                              facebook: facebookController.text.trim().isEmpty ? null : facebookController.text.trim(),
                            ),
                            localImagePath: imagePath,
                          );
                      if (dialogContext.mounted) Navigator.of(dialogContext).pop();
                    } catch (error) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('No se pudo guardar el testimonio: ${error.toString()}')),
                        );
                      }
                    }
                  },
                  child: const Text('Guardar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  String? _required(String? value) => (value == null || value.trim().isEmpty) ? 'Campo obligatorio' : null;
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner({required this.title, required this.subtitle, required this.accentLabel});

  final String title;
  final String subtitle;
  final String accentLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Theme.of(context).colorScheme.primaryContainer, Theme.of(context).colorScheme.surfaceContainerHighest],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                Text(subtitle),
              ],
            ),
          ),
          const SizedBox(width: 12),
          _AccentPill(label: accentLabel),
        ],
      ),
    );
  }
}

class _AccentPill extends StatelessWidget {
  const _AccentPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        child: Text(label, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: Colors.white)),
      ),
    );
  }
}

class _Thumbnail extends StatelessWidget {
  const _Thumbnail({required this.imageUrl});

  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(18),
      ),
      clipBehavior: Clip.antiAlias,
      child: imageUrl.isNotEmpty
          ? Image.network(imageUrl, fit: BoxFit.cover)
          : Icon(Icons.image_outlined, color: Theme.of(context).colorScheme.primary),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Chip(label: Text(label));
  }
}

class _SocialChip extends StatelessWidget {
  const _SocialChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return InputChip(label: Text(label));
  }
}

class _EmptyModuleState extends StatelessWidget {
  const _EmptyModuleState({required this.icon, required this.title, required this.description});

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 52, color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: 12),
                Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text(description, textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      ),
    );
  }
}