import 'package:dio/dio.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/services/token_service.dart';
import '../domain/auth_domain.dart';

class AuthService {
  AuthService(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        AppApiEndpoints.login,
        data: <String, dynamic>{'email': email, 'password': password},
      );
      return Map<String, dynamic>.from(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw AppException(_extractMessage(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  Future<Map<String, dynamic>> refreshToken({required String refreshToken}) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        AppApiEndpoints.refresh,
        data: <String, dynamic>{'refreshToken': refreshToken},
      );
      return Map<String, dynamic>.from(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw AppException(_extractMessage(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post<void>(AppApiEndpoints.logout);
    } on DioException catch (error) {
      if (error.response?.statusCode == 401) {
        return;
      }
      throw AppException(_extractMessage(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  String _extractMessage(DioException error) {
    final responseData = error.response?.data;
    if (responseData is Map<String, dynamic>) {
      final message = responseData['error_message'] ?? responseData['message'];
      if (message != null) {
        return message.toString();
      }
    }

    return error.message ?? 'No se pudo completar la solicitud de autenticación';
  }
}

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({required AuthService authService, required TokenService tokenService})
      : _authService = authService,
        _tokenService = tokenService;

  final AuthService _authService;
  final TokenService _tokenService;

  @override
  Future<AuthSession> login({required String email, required String password}) async {
    final payload = await _authService.login(email: email, password: password);
    final session = _mapSession(payload);
    await _tokenService.persistSession(session.toSnapshot());
    return session;
  }

  @override
  Future<AuthSession?> restoreSession() async {
    final snapshot = await _tokenService.readSnapshot();
    if (snapshot == null) {
      return null;
    }

    final session = AuthSession.fromSnapshot(snapshot);
    if (session.isExpired) {
      return refreshSession();
    }

    return session;
  }

  @override
  Future<AuthSession?> refreshSession() async {
    final snapshot = await _tokenService.readSnapshot();
    if (snapshot == null || snapshot.refreshToken == null) {
      return null;
    }

    final payload = await _authService.refreshToken(refreshToken: snapshot.refreshToken!);
    final session = _mapSession(payload, fallbackUser: snapshot.user);
    await _tokenService.persistSession(session.toSnapshot());
    return session;
  }

  @override
  Future<void> logout() async {
    try {
      await _authService.logout();
    } finally {
      await _tokenService.clearSession();
    }
  }

  @override
  Stream<AuthSession?> watchSession() {
    return _tokenService.sessionStream.map((snapshot) => snapshot == null ? null : AuthSession.fromSnapshot(snapshot));
  }

  AuthSession _mapSession(Map<String, dynamic> payload, {Map<String, dynamic>? fallbackUser}) {
    final userJson = payload['user'] is Map<String, dynamic>
        ? Map<String, dynamic>.from(payload['user'] as Map)
        : fallbackUser ?? <String, dynamic>{};
    final accessToken = (payload['token'] ?? payload['accessToken'])?.toString() ?? '';
    final refreshToken = (payload['refreshToken'] ?? payload['refresh_token'])?.toString();
    final expiresAt = DateTime.now().add(const Duration(hours: 48));

    return AuthSession(
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiryAt: expiresAt,
      user: AppUser.fromJson(userJson),
      allowedModules: (payload['modules'] as List<dynamic>? ?? const <dynamic>[])
          .whereType<Map<String, dynamic>>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList(growable: false),
    );
  }
}