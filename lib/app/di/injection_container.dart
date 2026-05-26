import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';

import '../../core/constants/app_constants.dart';
import '../../core/network/api_client.dart';
import '../../core/network/auth_interceptor.dart';
import '../../core/services/secure_storage_service.dart';
import '../../core/services/token_service.dart';
import '../router/app_router.dart';
import '../../features/auth/data/auth_data.dart';
import '../../features/auth/domain/auth_domain.dart';
import '../../features/auth/presentation/auth_presentation.dart';
import '../../features/dashboard/data/dashboard_data.dart';
import '../../features/dashboard/domain/dashboard_domain.dart';
import '../../features/dashboard/presentation/dashboard_presentation.dart';
import '../../features/contact_requests/data/contact_requests_data.dart';
import '../../features/contact_requests/domain/contact_requests_domain.dart';
import '../../features/contact_requests/presentation/contact_requests_presentation.dart';
import '../../features/news/data/news_data.dart';
import '../../features/news/domain/news_domain.dart';
import '../../features/news/presentation/news_presentation.dart';
import '../../features/portals/data/portals_data.dart';
import '../../features/portals/domain/portals_domain.dart';
import '../../features/portals/presentation/portals_presentation.dart';
import '../../features/public_contact/data/public_contact_data.dart';
import '../../features/public_contact/domain/public_contact_domain.dart';
import '../../features/public_contact/presentation/public_contact_presentation.dart';
import '../../features/testimonials/data/testimonials_data.dart';
import '../../features/testimonials/domain/testimonials_domain.dart';
import '../../features/testimonials/presentation/testimonials_presentation.dart';

final GetIt getIt = GetIt.instance;

Future<void> configureDependencies() async {
  if (getIt.isRegistered<AppRouter>()) {
    return;
  }

  final secureStorageService = SecureStorageService();
  final tokenService = TokenService(secureStorageService);
  final authService = AuthService(Dio(BaseOptions(baseUrl: AppApiEndpoints.baseUrl)));
  final authInterceptor = AuthInterceptor(tokenService: tokenService, authService: authService);
  final apiClient = ApiClient(
    dio: Dio(BaseOptions(baseUrl: AppApiEndpoints.baseUrl)),
    interceptors: [authInterceptor],
  );

  getIt
    ..registerSingleton(secureStorageService)
    ..registerSingleton(tokenService)
    ..registerSingleton(authService)
    ..registerSingleton(authInterceptor)
    ..registerSingleton(apiClient)
    ..registerLazySingleton<AuthRepository>(
      () => AuthRepositoryImpl(authService: getIt<AuthService>(), tokenService: getIt<TokenService>()),
    )
    ..registerLazySingleton<AuthBloc>(
      () => AuthBloc(authRepository: getIt<AuthRepository>()),
    )
    ..registerLazySingleton<DashboardRepository>(
      () => DashboardRepositoryImpl(apiClient: getIt<ApiClient>()),
    )
    ..registerLazySingleton<DashboardBloc>(
      () => DashboardBloc(dashboardRepository: getIt<DashboardRepository>()),
    )
    ..registerLazySingleton<PublicContactRepository>(
      () => PublicContactRepositoryImpl(remoteDataSource: PublicContactRemoteDataSource(getIt<ApiClient>())),
    )
    ..registerLazySingleton<PublicContactBloc>(
      () => PublicContactBloc(repository: getIt<PublicContactRepository>()),
    )
    ..registerLazySingleton<PortalsRepository>(
      () => PortalsRepositoryImpl(remoteDataSource: PortalRemoteDataSource(getIt<ApiClient>())),
    )
    ..registerLazySingleton<PortalsBloc>(
      () => PortalsBloc(repository: getIt<PortalsRepository>()),
    )
    ..registerLazySingleton<ContactRequestsRepository>(
      () => ContactRequestsRepositoryImpl(remoteDataSource: ContactRequestRemoteDataSource(getIt<ApiClient>())),
    )
    ..registerLazySingleton<ContactRequestsBloc>(
      () => ContactRequestsBloc(repository: getIt<ContactRequestsRepository>()),
    )
    ..registerLazySingleton<TestimonialsRepository>(
      () => TestimonialsRepositoryImpl(remoteDataSource: TestimonialRemoteDataSource(getIt<ApiClient>())),
    )
    ..registerLazySingleton<TestimonialsBloc>(
      () => TestimonialsBloc(repository: getIt<TestimonialsRepository>()),
    )
    ..registerLazySingleton<NewsRepository>(
      () => NewsRepositoryImpl(remoteDataSource: NewsRemoteDataSource(getIt<ApiClient>())),
    )
    ..registerLazySingleton<NewsBloc>(
      () => NewsBloc(repository: getIt<NewsRepository>()),
    )
    ..registerLazySingleton<AppRouter>(
      () => AppRouter(
        authBloc: getIt<AuthBloc>(),
        dashboardBloc: getIt<DashboardBloc>(),
        portalsBloc: getIt<PortalsBloc>(),
        contactRequestsBloc: getIt<ContactRequestsBloc>(),
        testimonialsBloc: getIt<TestimonialsBloc>(),
        newsBloc: getIt<NewsBloc>(),
        publicContactBloc: getIt<PublicContactBloc>(),
      ),
    );
}