import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../domain/contact_requests_domain.dart';

class ContactRequestRemoteDataSource {
  ContactRequestRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<List<ContactRequest>> list({String? country, ContactRequestStatus? status, String? query}) async {
    final payload = await _apiClient.getJson(
      AppApiEndpoints.requests,
      queryParameters: <String, dynamic>{
        if (country != null && country.isNotEmpty) 'country': country,
        if (status != null) 'status': _mapStatusToApi(status),
        if (query != null && query.isNotEmpty) 'q': query,
      },
    );

    final items = (payload['requests'] as List<dynamic>? ?? payload['items'] as List<dynamic>? ?? payload['data'] as List<dynamic>? ?? const <dynamic>[])
        .whereType<Map<String, dynamic>>()
        .map((item) => ContactRequest.fromJson(Map<String, dynamic>.from(item)))
        .toList(growable: false);

    return items;
  }

  Future<void> updateStatus(String id, ContactRequestStatus status) {
    return _apiClient.patchJson('${AppApiEndpoints.requests}/$id/status', data: <String, dynamic>{'status': _mapStatusToApi(status)});
  }

  Future<void> deleteRequest(String id) {
    return _apiClient.deleteJson('${AppApiEndpoints.requests}/$id');
  }

  String _mapStatusToApi(ContactRequestStatus status) {
    switch (status) {
      case ContactRequestStatus.managed:
        return 'gestionada';
      case ContactRequestStatus.responded:
        return 'respondida';
      case ContactRequestStatus.pending:
        return 'pendiente';
    }
  }
}

class ContactRequestsRepositoryImpl implements ContactRequestsRepository {
  ContactRequestsRepositoryImpl({required ContactRequestRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;

  final ContactRequestRemoteDataSource _remoteDataSource;

  @override
  Future<List<ContactRequest>> listRequests({String? country, ContactRequestStatus? status, String? query}) {
    return _remoteDataSource.list(country: country, status: status, query: query);
  }

  @override
  Future<void> updateStatus(String id, ContactRequestStatus status) {
    return _remoteDataSource.updateStatus(id, status);
  }

  @override
  Future<void> deleteRequest(String id) {
    return _remoteDataSource.deleteRequest(id);
  }
}