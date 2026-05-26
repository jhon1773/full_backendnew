import 'package:equatable/equatable.dart';

enum ContactRequestStatus { pending, managed, responded }

class ContactRequest extends Equatable {
  const ContactRequest({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.purpose,
    required this.country,
    required this.date,
    required this.status,
  });

  final String id;
  final String name;
  final String email;
  final String phone;
  final String purpose;
  final String country;
  final DateTime date;
  final ContactRequestStatus status;

  factory ContactRequest.fromJson(Map<String, dynamic> json) {
    return ContactRequest(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      purpose: json['purpose']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      date: DateTime.tryParse(json['created_at']?.toString() ?? json['date']?.toString() ?? '') ?? DateTime.now(),
      status: _parseStatus(json['status']?.toString()),
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'purpose': purpose,
        'country': country,
        'date': date.toIso8601String(),
        'status': status.name,
      };

  static ContactRequestStatus _parseStatus(String? value) {
    switch (value) {
      case 'gestionada':
      case 'managed':
        return ContactRequestStatus.managed;
      case 'respondida':
      case 'responded':
        return ContactRequestStatus.responded;
      default:
        return ContactRequestStatus.pending;
    }
  }

  @override
  List<Object?> get props => [id, name, email, phone, purpose, country, date, status];
}

abstract class ContactRequestsRepository {
  Future<List<ContactRequest>> listRequests({String? country, ContactRequestStatus? status, String? query});
  Future<void> updateStatus(String id, ContactRequestStatus status);
  Future<void> deleteRequest(String id);
}

class ListContactRequestsUseCase {
  const ListContactRequestsUseCase(this._repository);

  final ContactRequestsRepository _repository;

  Future<List<ContactRequest>> call({String? country, ContactRequestStatus? status, String? query}) {
    return _repository.listRequests(country: country, status: status, query: query);
  }
}

class UpdateContactRequestStatusUseCase {
  const UpdateContactRequestStatusUseCase(this._repository);

  final ContactRequestsRepository _repository;

  Future<void> call(String id, ContactRequestStatus status) => _repository.updateStatus(id, status);
}

class DeleteContactRequestUseCase {
  const DeleteContactRequestUseCase(this._repository);

  final ContactRequestsRepository _repository;

  Future<void> call(String id) => _repository.deleteRequest(id);
}