import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../domain/news_domain.dart';

class NewsRemoteDataSource {
  NewsRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<List<NewsArticle>> list({String? country, NewsStatus? status, String? query}) async {
    final payload = await _apiClient.getJson(
      AppApiEndpoints.news,
      queryParameters: <String, dynamic>{
        if (country != null && country.isNotEmpty) 'country': country,
        if (status != null) 'status': _mapStatusToApi(status),
        if (query != null && query.isNotEmpty) 'q': query,
      },
    );
    final rawItems = (payload['news'] as List<dynamic>? ?? payload['items'] as List<dynamic>? ?? payload['data'] as List<dynamic>? ?? const <dynamic>[]);
    return rawItems.whereType<Map<String, dynamic>>().map((item) => NewsArticle.fromJson(Map<String, dynamic>.from(item))).toList(growable: false);
  }

  Future<void> save(NewsArticle article) {
    return article.id.isEmpty
        ? _apiClient.postJson(AppApiEndpoints.news, data: article.toJson())
        : _apiClient.putJson('${AppApiEndpoints.news}/${article.id}', data: article.toJson());
  }

  Future<void> delete(String id) => _apiClient.deleteJson('${AppApiEndpoints.news}/$id');

  Future<void> setStatus(String id, NewsStatus status) => _apiClient.patchJson('${AppApiEndpoints.news}/$id/status');

  String _mapStatusToApi(NewsStatus status) {
    switch (status) {
      case NewsStatus.published:
        return 'publicado';
      case NewsStatus.unpublished:
      case NewsStatus.draft:
        return 'borrador';
    }
  }
}

class NewsRepositoryImpl implements NewsRepository {
  NewsRepositoryImpl({required NewsRemoteDataSource remoteDataSource}) : _remoteDataSource = remoteDataSource;

  final NewsRemoteDataSource _remoteDataSource;

  @override
  Future<List<NewsArticle>> listNews({String? country, NewsStatus? status, String? query}) => _remoteDataSource.list(country: country, status: status, query: query);

  @override
  Future<void> save(NewsArticle article) => _remoteDataSource.save(article);

  @override
  Future<void> delete(String id) => _remoteDataSource.delete(id);

  @override
  Future<void> setStatus(String id, NewsStatus status) => _remoteDataSource.setStatus(id, status);
}