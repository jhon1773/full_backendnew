import 'package:equatable/equatable.dart';

abstract class PublicContactRepository {
  Future<void> submitContact(PublicContactSubmission submission);
}

class PublicContactSubmission extends Equatable {
  const PublicContactSubmission({
    required this.name,
    required this.email,
    required this.phone,
    required this.purpose,
    required this.country,
  });

  final String name;
  final String email;
  final String phone;
  final String purpose;
  final String country;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'name': name,
        'email': email,
        'phone': phone,
        'purpose': purpose,
        'country': country,
      };

  @override
  List<Object?> get props => [name, email, phone, purpose, country];
}

class SubmitPublicContactUseCase {
  const SubmitPublicContactUseCase(this._repository);

  final PublicContactRepository _repository;

  Future<void> call(PublicContactSubmission submission) {
    return _repository.submitContact(submission);
  }
}