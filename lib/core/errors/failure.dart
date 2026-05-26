import 'app_exception.dart';

class Failure {
  const Failure({required this.message, this.statusCode});

  final String message;
  final int? statusCode;

  factory Failure.fromException(Object error) {
    if (error is AppException) {
      return Failure(message: error.message, statusCode: error.statusCode);
    }

    return Failure(message: error.toString());
  }
}