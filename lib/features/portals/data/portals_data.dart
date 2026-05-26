import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../domain/portals_domain.dart';

class PortalRemoteDataSource {
  PortalRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<List<Portal>> list({String? query, bool? activeOnly}) async {
    final payload = await _apiClient.getJson(
      AppApiEndpoints.portals,
      queryParameters: <String, dynamic>{
        if (query != null && query.isNotEmpty) 'q': query,
      },
    );

    if (activeOnly != null) {
      payload['activeOnly'] = activeOnly;
    }

    final rawItems = (payload['items'] as List<dynamic>? ?? payload['data'] as List<dynamic>? ?? const <dynamic>[]);
    return rawItems.whereType<Map<String, dynamic>>().map((item) => Portal.fromJson(Map<String, dynamic>.from(item))).toList(growable: false);
  }

  Future<void> toggle(String id, bool isActive) {
    return _apiClient.putJson('${AppApiEndpoints.portals}/$id', data: <String, dynamic>{'isActive': isActive});
  }
}

class PortalsRepositoryImpl implements PortalsRepository {
  PortalsRepositoryImpl({required PortalRemoteDataSource remoteDataSource}) : _remoteDataSource = remoteDataSource;

  final PortalRemoteDataSource _remoteDataSource;

  @override
  Future<List<Portal>> listPortals({String? query, bool? activeOnly}) {
    return _remoteDataSource.list(query: query, activeOnly: activeOnly);
  }

  @override
  Future<void> toggleStatus(String id, bool isActive) {
    return _remoteDataSource.toggle(id, isActive);
  }
}