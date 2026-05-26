import 'package:dio/dio.dart';

import '../services/token_service.dart';
import '../../features/auth/data/auth_data.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor({required this.tokenService, required this.authService});

  final TokenService tokenService;
  final AuthService authService;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final snapshot = await tokenService.readSnapshot();
    if (snapshot != null) {
      options.headers['Authorization'] = 'Bearer ${snapshot.accessToken}';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      await tokenService.clearSession();
    }

    handler.next(err);
  }
}