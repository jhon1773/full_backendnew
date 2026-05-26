import 'package:equatable/equatable.dart';

import '../../../core/models/session_snapshot.dart';

class AppUser extends Equatable {
  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.country,
  });

  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String? country;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      role: json['role']?.toString() ?? 'editor',
      country: json['country']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'country': country,
      };

  @override
  List<Object?> get props => [id, name, email, phone, role, country];
}

class AuthSession extends Equatable {
  const AuthSession({
    required this.accessToken,
    required this.expiryAt,
    required this.user,
    this.refreshToken,
    this.allowedModules = const <Map<String, dynamic>>[],
  });

  final String accessToken;
  final String? refreshToken;
  final DateTime expiryAt;
  final AppUser user;
  final List<Map<String, dynamic>> allowedModules;

  bool get isExpired => DateTime.now().isAfter(expiryAt);

  SessionSnapshot toSnapshot() {
    return SessionSnapshot(
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiryAt: expiryAt,
      user: user.toJson(),
    );
  }

  factory AuthSession.fromSnapshot(SessionSnapshot snapshot) {
    return AuthSession(
      accessToken: snapshot.accessToken,
      refreshToken: snapshot.refreshToken,
      expiryAt: snapshot.expiryAt,
      user: AppUser.fromJson(snapshot.user),
    );
  }

  @override
  List<Object?> get props => [accessToken, refreshToken, expiryAt, user, allowedModules];
}

abstract class AuthRepository {
  Future<AuthSession> login({required String email, required String password});
  Future<AuthSession?> restoreSession();
  Future<AuthSession?> refreshSession();
  Future<void> logout();
  Stream<AuthSession?> watchSession();
}

class LoginUseCase {
  const LoginUseCase(this._repository);

  final AuthRepository _repository;

  Future<AuthSession> call({required String email, required String password}) {
    return _repository.login(email: email, password: password);
  }
}

class LogoutUseCase {
  const LogoutUseCase(this._repository);

  final AuthRepository _repository;

  Future<void> call() => _repository.logout();
}

class RestoreSessionUseCase {
  const RestoreSessionUseCase(this._repository);

  final AuthRepository _repository;

  Future<AuthSession?> call() => _repository.restoreSession();
}

class RefreshSessionUseCase {
  const RefreshSessionUseCase(this._repository);

  final AuthRepository _repository;

  Future<AuthSession?> call() => _repository.refreshSession();
}

class WatchSessionUseCase {
  const WatchSessionUseCase(this._repository);

  final AuthRepository _repository;

  Stream<AuthSession?> call() => _repository.watchSession();
}