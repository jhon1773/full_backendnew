import 'package:dio/dio.dart';

import '../errors/app_exception.dart';

class ApiClient {
  ApiClient({required this.dio, List<Interceptor>? interceptors}) {
    if (interceptors != null) {
      dio.interceptors.addAll(interceptors);
    }
  }

  final Dio dio;

  Future<Map<String, dynamic>> getJson(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await dio.get<Map<String, dynamic>>(path, queryParameters: queryParameters);
      return Map<String, dynamic>.from(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw AppException(_messageFromError(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  Future<Map<String, dynamic>> postJson(String path, {Object? data}) async {
    try {
      final response = await dio.post<Map<String, dynamic>>(path, data: data);
      return Map<String, dynamic>.from(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw AppException(_messageFromError(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  Future<Map<String, dynamic>> putJson(String path, {Object? data}) async {
    try {
      final response = await dio.put<Map<String, dynamic>>(path, data: data);
      return Map<String, dynamic>.from(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw AppException(_messageFromError(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  Future<Map<String, dynamic>> patchJson(String path, {Object? data}) async {
    try {
      final response = await dio.patch<Map<String, dynamic>>(path, data: data);
      return Map<String, dynamic>.from(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw AppException(_messageFromError(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  Future<void> deleteJson(String path) async {
    try {
      await dio.delete(path);
    } on DioException catch (error) {
      throw AppException(_messageFromError(error), statusCode: error.response?.statusCode, cause: error);
    }
  }

  String _messageFromError(DioException error) {
    final responseData = error.response?.data;
    if (responseData is Map<String, dynamic>) {
      final message = responseData['error_message'] ?? responseData['message'];
      if (message != null) {
        return message.toString();
      }
    }

    return error.message ?? 'Error de red inesperado';
  }
}