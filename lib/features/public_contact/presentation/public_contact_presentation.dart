import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/errors/failure.dart';
import '../../../core/widgets/app_loading_view.dart';
import '../domain/public_contact_domain.dart';

class PublicContactBloc extends Cubit<PublicContactState> {
  PublicContactBloc({required PublicContactRepository repository})
      : _repository = repository,
        super(const PublicContactState());

  final PublicContactRepository _repository;

  Future<void> submit(PublicContactSubmission submission) async {
    emit(state.copyWith(status: PublicContactStatus.loading, errorMessage: null, successMessage: null));
    try {
      await _repository.submitContact(submission);
      emit(state.copyWith(status: PublicContactStatus.success, successMessage: 'Contacto enviado correctamente'));
    } catch (error) {
      emit(state.copyWith(status: PublicContactStatus.failure, errorMessage: Failure.fromException(error).message));
    }
  }
}

enum PublicContactStatus { initial, loading, success, failure }

class PublicContactState extends Equatable {
  const PublicContactState({this.status = PublicContactStatus.initial, this.errorMessage, this.successMessage});

  final PublicContactStatus status;
  final String? errorMessage;
  final String? successMessage;

  PublicContactState copyWith({PublicContactStatus? status, String? errorMessage, String? successMessage}) {
    return PublicContactState(
      status: status ?? this.status,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }

  @override
  List<Object?> get props => [status, errorMessage, successMessage];
}

class PublicContactScreen extends StatefulWidget {
  const PublicContactScreen({super.key, required this.publicContactBloc});

  final PublicContactBloc publicContactBloc;

  @override
  State<PublicContactScreen> createState() => _PublicContactScreenState();
}

class _PublicContactScreenState extends State<PublicContactScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _purposeController = TextEditingController();
  final TextEditingController _countryController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _purposeController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: widget.publicContactBloc,
      child: Scaffold(
        appBar: AppBar(title: const Text('Formulario público de contacto')),
        body: BlocConsumer<PublicContactBloc, PublicContactState>(
          listener: (context, state) {
            if (state.status == PublicContactStatus.success) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.successMessage ?? 'Enviado')));
            }
          },
          builder: (context, state) {
            if (state.status == PublicContactStatus.loading) {
              return const AppLoadingView(message: 'Enviando mensaje...');
            }

            return Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 720),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text('Escríbenos', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 20),
                            _Field(controller: _nameController, label: 'Nombre', validator: _required),
                            const SizedBox(height: 12),
                            _Field(controller: _emailController, label: 'Correo', keyboardType: TextInputType.emailAddress, validator: _email),
                            const SizedBox(height: 12),
                            _Field(controller: _phoneController, label: 'Teléfono', keyboardType: TextInputType.phone, validator: _required),
                            const SizedBox(height: 12),
                            _Field(controller: _purposeController, label: 'Finalidad', validator: _required, maxLines: 3),
                            const SizedBox(height: 12),
                            _Field(controller: _countryController, label: 'País', validator: _required),
                            if (state.errorMessage != null) ...[
                              const SizedBox(height: 12),
                              Text(state.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                            ],
                            const SizedBox(height: 20),
                            FilledButton(
                              onPressed: () {
                                if (!_formKey.currentState!.validate()) return;
                                widget.publicContactBloc.submit(
                                  PublicContactSubmission(
                                    name: _nameController.text.trim(),
                                    email: _emailController.text.trim(),
                                    phone: _phoneController.text.trim(),
                                    purpose: _purposeController.text.trim(),
                                    country: _countryController.text.trim(),
                                  ),
                                );
                              },
                              child: const Text('Enviar contacto'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  String? _required(String? value) => (value == null || value.trim().isEmpty) ? 'Campo obligatorio' : null;

  String? _email(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Campo obligatorio';
    if (!text.contains('@')) return 'Correo inválido';
    return null;
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.controller, required this.label, this.validator, this.keyboardType, this.maxLines = 1});

  final TextEditingController controller;
  final String label;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label),
      validator: validator,
    );
  }
}