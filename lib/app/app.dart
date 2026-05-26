import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../core/errors/app_bloc_observer.dart';
import '../core/theme/app_theme.dart';
import 'di/injection_container.dart';
import 'router/app_router.dart';
import '../features/auth/presentation/auth_presentation.dart';
import '../features/dashboard/presentation/dashboard_presentation.dart';

class AppBootstrap {
  static Future<void> initialize() async {
    await configureDependencies();
    Bloc.observer = AppBlocObserver();
  }
}

class LatinoamericaComparteCmsAdminApp extends StatelessWidget {
  const LatinoamericaComparteCmsAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: getIt<AuthBloc>()),
        BlocProvider.value(value: getIt<DashboardBloc>()),
      ],
      child: MaterialApp.router(
        title: 'Latinoamérica Comparte CMS Admin',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: ThemeMode.system,
        routerConfig: getIt<AppRouter>().router,
      ),
    );
  }
}