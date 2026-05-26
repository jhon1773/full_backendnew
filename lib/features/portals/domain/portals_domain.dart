import 'package:equatable/equatable.dart';

class Portal extends Equatable {
  const Portal({required this.id, required this.name, required this.country, required this.isActive});

  final String id;
  final String name;
  final String country;
  final bool isActive;

  factory Portal.fromJson(Map<String, dynamic> json) {
    return Portal(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      isActive: json['isActive'] == true || json['state']?.toString() == 'active',
    );
  }

  @override
  List<Object?> get props => [id, name, country, isActive];
}

abstract class PortalsRepository {
  Future<List<Portal>> listPortals({String? query, bool? activeOnly});
  Future<void> toggleStatus(String id, bool isActive);
}

class ListPortalsUseCase {
  const ListPortalsUseCase(this._repository);

  final PortalsRepository _repository;

  Future<List<Portal>> call({String? query, bool? activeOnly}) {
    return _repository.listPortals(query: query, activeOnly: activeOnly);
  }
}

class TogglePortalStatusUseCase {
  const TogglePortalStatusUseCase(this._repository);

  final PortalsRepository _repository;

  Future<void> call(String id, bool isActive) => _repository.toggleStatus(id, isActive);
}