import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../domain/public_contact_domain.dart';

class PublicContactRemoteDataSource {
  PublicContactRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<void> submit(PublicContactSubmission submission) {
    return _apiClient.postJson(AppApiEndpoints.publicContact, data: submission.toJson());
  }
}

class PublicContactRepositoryImpl implements PublicContactRepository {
  PublicContactRepositoryImpl({required PublicContactRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;

  final PublicContactRemoteDataSource _remoteDataSource;

  @override
  Future<void> submitContact(PublicContactSubmission submission) {
    return _remoteDataSource.submit(submission);
  }
}