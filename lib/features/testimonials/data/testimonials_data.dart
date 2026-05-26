import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../domain/testimonials_domain.dart';

class TestimonialRemoteDataSource {
  TestimonialRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<List<Testimonial>> list({String? country, TestimonialStatus? status, String? query}) async {
    final payload = await _apiClient.getJson(
      AppApiEndpoints.testimonials,
      queryParameters: <String, dynamic>{
        if (country != null && country.isNotEmpty) 'country': country,
        if (status != null) 'publication_status': _mapStatusToApi(status),
        if (query != null && query.isNotEmpty) 'q': query,
      },
    );
    final rawItems = (payload['testimonials'] as List<dynamic>? ?? payload['items'] as List<dynamic>? ?? payload['data'] as List<dynamic>? ?? const <dynamic>[]);
    return rawItems.whereType<Map<String, dynamic>>().map((item) => Testimonial.fromJson(Map<String, dynamic>.from(item))).toList(growable: false);
  }

  Future<void> save(Testimonial testimonial, {String? localImagePath}) async {
    final payload = <String, dynamic>{
      'name': testimonial.name,
      'photo_url': (localImagePath != null && localImagePath.isNotEmpty) ? localImagePath : testimonial.imageUrl,
      'text': testimonial.text,
      'country': testimonial.country,
      'instagram_url': testimonial.instagram,
      'facebook_url': testimonial.facebook,
      'publication_status': _mapStatusToApi(testimonial.status),
    };

    if (testimonial.id.isEmpty) {
      await _apiClient.postJson(AppApiEndpoints.testimonials, data: payload);
      return;
    }

    await _apiClient.putJson('${AppApiEndpoints.testimonials}/${testimonial.id}', data: payload);
  }

  Future<void> delete(String id) => _apiClient.deleteJson('${AppApiEndpoints.testimonials}/$id');

  Future<void> setStatus(String id, TestimonialStatus status) => _apiClient.patchJson('${AppApiEndpoints.testimonials}/$id/publication');

  String _mapStatusToApi(TestimonialStatus status) {
    switch (status) {
      case TestimonialStatus.published:
        return 'publicado';
      case TestimonialStatus.unpublished:
        return 'despublicado';
      case TestimonialStatus.draft:
        return 'borrador';
    }
  }
}

class TestimonialsRepositoryImpl implements TestimonialsRepository {
  TestimonialsRepositoryImpl({required TestimonialRemoteDataSource remoteDataSource}) : _remoteDataSource = remoteDataSource;

  final TestimonialRemoteDataSource _remoteDataSource;

  @override
  Future<List<Testimonial>> listTestimonials({String? country, TestimonialStatus? status, String? query}) {
    return _remoteDataSource.list(country: country, status: status, query: query);
  }

  @override
  Future<void> save(Testimonial testimonial, {String? localImagePath}) {
    return _remoteDataSource.save(testimonial, localImagePath: localImagePath);
  }

  @override
  Future<void> delete(String id) => _remoteDataSource.delete(id);

  @override
  Future<void> setStatus(String id, TestimonialStatus status) => _remoteDataSource.setStatus(id, status);
}