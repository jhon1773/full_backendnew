import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/errors/failure.dart';
import '../../../core/widgets/app_loading_view.dart';
import '../domain/auth_domain.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(const AuthState()) {
    on<AuthStarted>(_onStarted);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<_AuthSessionChanged>(_onSessionChanged);

    _sessionSubscription = _authRepository.watchSession().listen((session) {
      add(_AuthSessionChanged(session));
    });
  }

  final AuthRepository _authRepository;
  late final StreamSubscription<AuthSession?> _sessionSubscription;

  Future<void> _onStarted(AuthStarted event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading));
    try {
      final session = await _authRepository.restoreSession();
      emit(state.copyWith(
        status: session == null ? AuthStatus.unauthenticated : AuthStatus.authenticated,
        session: session,
        errorMessage: null,
      ));
    } catch (error) {
      emit(state.copyWith(status: AuthStatus.unauthenticated, errorMessage: Failure.fromException(error).message));
    }
  }

  Future<void> _onLoginRequested(AuthLoginRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading, errorMessage: null));
    try {
      final session = await _authRepository.login(email: event.email, password: event.password);
      emit(state.copyWith(status: AuthStatus.authenticated, session: session));
    } catch (error) {
      emit(state.copyWith(status: AuthStatus.unauthenticated, errorMessage: Failure.fromException(error).message));
    }
  }

  Future<void> _onLogoutRequested(AuthLogoutRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading));
    try {
      await _authRepository.logout();
      emit(const AuthState(status: AuthStatus.unauthenticated));
    } catch (error) {
      emit(state.copyWith(status: AuthStatus.unauthenticated, errorMessage: Failure.fromException(error).message));
    }
  }

  void _onSessionChanged(_AuthSessionChanged event, Emitter<AuthState> emit) {
    emit(state.copyWith(
      status: event.session == null ? AuthStatus.unauthenticated : AuthStatus.authenticated,
      session: event.session,
      errorMessage: null,
    ));
  }

  @override
  Future<void> close() {
    _sessionSubscription.cancel();
    return super.close();
  }
}

enum AuthStatus { initial, loading, authenticated, unauthenticated }

class AuthState extends Equatable {
  const AuthState({this.status = AuthStatus.initial, this.session, this.errorMessage});

  final AuthStatus status;
  final AuthSession? session;
  final String? errorMessage;

  bool get isAuthenticated => status == AuthStatus.authenticated && session != null;

  AuthState copyWith({AuthStatus? status, AuthSession? session, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      session: session ?? this.session,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, session, errorMessage];
}

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthStarted extends AuthEvent {
  const AuthStarted();
}

class AuthLoginRequested extends AuthEvent {
  const AuthLoginRequested({required this.email, required this.password});

  final String email;
  final String password;

  @override
  List<Object?> get props => [email, password];
}

class AuthLogoutRequested extends AuthEvent {
  const AuthLogoutRequested();
}

class _AuthSessionChanged extends AuthEvent {
  const _AuthSessionChanged(this.session);

  final AuthSession? session;

  @override
  List<Object?> get props => [session];
}

class AuthGuard {
  const AuthGuard();

  bool canAccessModule(AuthSession? session, String moduleId) {
    if (session == null) {
      return false;
    }

    final role = session.user.role;
    switch (moduleId) {
      case 'portals':
        return role == AppRoles.superadmin;
      case 'requests':
        return role == AppRoles.superadmin || role == AppRoles.adminPais;
      case 'testimonials':
      case 'news':
        return role == AppRoles.superadmin || role == AppRoles.adminPais || role == AppRoles.editor;
      default:
        return true;
    }
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.authBloc});

  final AuthBloc authBloc;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController(text: 'admin@latinoamericacomparte.com');
  final TextEditingController _passwordController = TextEditingController(text: 'password');

  @override
  void initState() {
    super.initState();
    widget.authBloc.add(const AuthStarted());
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        bloc: widget.authBloc,
        listener: (context, state) {
          if (state.isAuthenticated) {
            context.go(AppRoutes.dashboard);
          }
        },
        builder: (context, state) {
          if (state.status == AuthStatus.loading && !state.isAuthenticated) {
            return const AppLoadingView(message: 'Validando credenciales y sesión...');
          }

          return Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF07111F), Color(0xFF0F766E), Color(0xFFF59E0B)],
              ),
            ),
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1120),
                  child: Card(
                    color: Theme.of(context).colorScheme.surface,
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final isWide = constraints.maxWidth >= 960;
                          return isWide
                              ? Row(
                                  children: [
                                    Expanded(child: _buildHero(context)),
                                    const SizedBox(width: 24),
                                    Expanded(child: _buildForm(context, state)),
                                  ],
                                )
                              : _buildForm(context, state);
                        },
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Latinoamérica Comparte CMS Admin', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        Text(
          'Panel administrativo preparado para operar por país, con JWT, control de rol y navegación protegida.',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 24),
        _FeatureBullet(icon: Icons.shield_outlined, text: 'JWT + Secure Storage + auto logout por expiración'),
        _FeatureBullet(icon: Icons.dashboard_outlined, text: 'Dashboard dinámico según rol y país'),
        _FeatureBullet(icon: Icons.layers_outlined, text: 'Clean Architecture con BLoC y GetIt'),
      ],
    );
  }

  Widget _buildForm(BuildContext context, AuthState state) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Acceso administrativo', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 24),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Usuario / correo', prefixIcon: Icon(Icons.person_outline)),
            validator: (value) {
              final text = value?.trim() ?? '';
              if (text.isEmpty) return 'Ingresa el usuario o correo';
              if (!text.contains('@')) return 'Ingresa un correo válido';
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passwordController,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Contraseña', prefixIcon: Icon(Icons.lock_outline)),
            validator: (value) {
              if ((value ?? '').trim().length < 6) return 'La contraseña debe tener al menos 6 caracteres';
              return null;
            },
          ),
          const SizedBox(height: 16),
          if (state.errorMessage != null) ...[
            Text(state.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            const SizedBox(height: 12),
          ],
          FilledButton(
            onPressed: () {
              if (!_formKey.currentState!.validate()) return;
              widget.authBloc.add(AuthLoginRequested(
                email: _emailController.text.trim(),
                password: _passwordController.text,
              ));
            },
            child: const Text('Ingresar'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => context.go(AppRoutes.publicContact),
            child: const Text('Ir al formulario público'),
          ),
        ],
      ),
    );
  }
}

class _FeatureBullet extends StatelessWidget {
  const _FeatureBullet({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 10),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}