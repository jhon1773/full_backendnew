import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/errors/failure.dart';
import '../../../core/widgets/access_denied_screen.dart';
import '../../../core/widgets/app_error_view.dart';
import '../../../core/widgets/app_loading_view.dart';
import '../../auth/presentation/auth_presentation.dart';
import '../domain/news_domain.dart';

class NewsBloc extends Cubit<NewsState> {
  NewsBloc({required NewsRepository repository})
      : _repository = repository,
        super(const NewsState()) {
    load();
  }

  final NewsRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(status: NewsStatusView.loading, errorMessage: null));
    try {
      final items = await _repository.listNews(country: state.countryFilter, status: state.statusFilter, query: state.query);
      emit(state.copyWith(status: NewsStatusView.success, items: items));
    } catch (error) {
      emit(state.copyWith(status: NewsStatusView.failure, errorMessage: Failure.fromException(error).message));
    }
  }

  Future<void> search(String query) async {
    emit(state.copyWith(query: query));
    await load();
  }

  Future<void> filterByStatus(NewsStatus? status) async {
    emit(state.copyWith(statusFilter: status));
    await load();
  }

  Future<void> save(NewsArticle article) async {
    await _repository.save(article);
    await load();
  }

  Future<void> delete(String id) async {
    await _repository.delete(id);
    await load();
  }

  Future<void> setStatus(String id, NewsStatus status) async {
    await _repository.setStatus(id, status);
    await load();
  }
}

enum NewsStatusView { initial, loading, success, failure }

class NewsState extends Equatable {
  const NewsState({
    this.status = NewsStatusView.initial,
    this.items = const <NewsArticle>[],
    this.statusFilter,
    this.countryFilter,
    this.query,
    this.errorMessage,
  });

  final NewsStatusView status;
  final List<NewsArticle> items;
  final NewsStatus? statusFilter;
  final String? countryFilter;
  final String? query;
  final String? errorMessage;

  NewsState copyWith({NewsStatusView? status, List<NewsArticle>? items, NewsStatus? statusFilter, String? countryFilter, String? query, String? errorMessage}) {
    return NewsState(
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

class NewsScreen extends StatelessWidget {
  const NewsScreen({super.key, required this.newsBloc});

  final NewsBloc newsBloc;

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthBloc>().state.session;
    final allowed = session != null && (session.user.role == AppRoles.superadmin || session.user.role == AppRoles.adminPais || session.user.role == AppRoles.editor);
    if (!allowed) {
      return const AccessDeniedScreen(message: 'Solo superadmin, admin_pais y editor pueden administrar noticias.');
    }

    return BlocProvider.value(
      value: newsBloc,
      child: Scaffold(
        appBar: AppBar(title: const Text('Noticias')),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _openEditor(context, newsBloc: newsBloc),
          child: const Icon(Icons.add),
        ),
        body: BlocBuilder<NewsBloc, NewsState>(
          builder: (context, state) {
            if (state.status == NewsStatusView.loading) {
              return const AppLoadingView(message: 'Cargando noticias...');
            }

            if (state.status == NewsStatusView.failure) {
              return AppErrorView(message: state.errorMessage ?? 'No se pudieron cargar las noticias', onRetry: () => context.read<NewsBloc>().load());
            }

            return RefreshIndicator(
              onRefresh: () => context.read<NewsBloc>().load(),
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  _HeroBanner(
                    title: 'Gestión de noticias',
                    subtitle: 'Redacta, publica y controla contenido por país con una experiencia editorial preparada para producción.',
                    accentLabel: '${state.items.length} artículos',
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Buscar noticias'),
                    onChanged: (value) => context.read<NewsBloc>().search(value),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilterChip(label: const Text('Todos'), selected: state.statusFilter == null, onSelected: (_) => context.read<NewsBloc>().filterByStatus(null)),
                      ...NewsStatus.values.map(
                        (status) => FilterChip(label: Text(status.name), selected: state.statusFilter == status, onSelected: (_) => context.read<NewsBloc>().filterByStatus(status)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...state.items.map(
                    (article) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _ArticleAccent(imageUrl: article.imageUrl),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(article.title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                                        ),
                                        Chip(label: Text(article.status.name)),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text('${article.country} · ${article.author}'),
                                    const SizedBox(height: 10),
                                    Text(article.summary, maxLines: 2, overflow: TextOverflow.ellipsis),
                                    const SizedBox(height: 8),
                                    Text(article.content, maxLines: 3, overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                              PopupMenuButton<String>(
                                onSelected: (value) async {
                                  if (value == 'edit') {
                                    await _openEditor(context, newsBloc: newsBloc, existing: article);
                                  } else if (value == 'delete') {
                                    await context.read<NewsBloc>().delete(article.id);
                                  } else {
                                    await context.read<NewsBloc>().setStatus(article.id, NewsStatus.values.byName(value));
                                  }
                                },
                                itemBuilder: (context) => [
                                  const PopupMenuItem(value: 'edit', child: Text('Editar')),
                                  ...NewsStatus.values.map((status) => PopupMenuItem(value: status.name, child: Text('Marcar ${status.name}'))),
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
                        icon: Icons.newspaper_outlined,
                        title: 'Aún no hay noticias',
                        description: 'Crea una nota, guárdala como borrador o publícala según el país y el rol del editor.',
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

  Future<void> _openEditor(BuildContext context, {required NewsBloc newsBloc, NewsArticle? existing}) async {
    final formKey = GlobalKey<FormState>();
    final session = context.read<AuthBloc>().state.session;
    final isSuperadmin = session?.user.role == AppRoles.superadmin;
    final titleController = TextEditingController(text: existing?.title ?? '');
    final summaryController = TextEditingController(text: existing?.summary ?? '');
    final contentController = TextEditingController(text: existing?.content ?? '');
    final countryController = TextEditingController(text: existing?.country ?? session?.user.country ?? '');
    final authorController = TextEditingController(text: existing?.author ?? '');
    final imageController = TextEditingController(text: existing?.imageUrl ?? '');

    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(existing == null ? 'Nueva noticia' : 'Editar noticia'),
          content: SizedBox(
            width: 640,
            child: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Título'), validator: _required),
                    TextFormField(controller: summaryController, decoration: const InputDecoration(labelText: 'Resumen'), validator: _required),
                    TextFormField(controller: contentController, decoration: const InputDecoration(labelText: 'Contenido'), maxLines: 8, validator: _required),
                    TextFormField(
                      controller: countryController,
                      decoration: const InputDecoration(labelText: 'País'),
                      validator: _required,
                      readOnly: !isSuperadmin && (session?.user.country?.isNotEmpty ?? false),
                    ),
                    TextFormField(controller: authorController, decoration: const InputDecoration(labelText: 'Autor'), validator: _required),
                    TextFormField(controller: imageController, decoration: const InputDecoration(labelText: 'Imagen principal (URL opcional)')),
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
                try {
                  await newsBloc.save(
                        NewsArticle(
                          id: existing?.id ?? '',
                          title: titleController.text.trim(),
                          summary: summaryController.text.trim(),
                          content: contentController.text.trim(),
                          country: countryController.text.trim(),
                          author: authorController.text.trim(),
                          status: existing?.status ?? NewsStatus.draft,
                          imageUrl: imageController.text.trim().isEmpty ? null : imageController.text.trim(),
                        ),
                      );
                  if (dialogContext.mounted) Navigator.of(dialogContext).pop();
                } catch (error) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('No se pudo guardar la noticia: ${error.toString()}')),
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

class _ArticleAccent extends StatelessWidget {
  const _ArticleAccent({required this.imageUrl});

  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 84,
      height: 84,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(18),
      ),
      clipBehavior: Clip.antiAlias,
      child: imageUrl != null && imageUrl!.isNotEmpty
          ? Image.network(imageUrl!, fit: BoxFit.cover)
          : Icon(Icons.article_outlined, color: Theme.of(context).colorScheme.primary),
    );
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