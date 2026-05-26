import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_constants.dart';
import '../../core/widgets/app_shell.dart';
import '../../features/auth/presentation/auth_presentation.dart';
import '../../features/dashboard/presentation/dashboard_presentation.dart';
import '../../features/contact_requests/presentation/contact_requests_presentation.dart';
import '../../features/news/presentation/news_presentation.dart';
import '../../features/portals/presentation/portals_presentation.dart';
import '../../features/public_contact/presentation/public_contact_presentation.dart';
import '../../features/testimonials/presentation/testimonials_presentation.dart';

class AppRouter {
  AppRouter({
    required this.authBloc,
    required this.dashboardBloc,
    required this.portalsBloc,
    required this.contactRequestsBloc,
    required this.testimonialsBloc,
    required this.newsBloc,
    required this.publicContactBloc,
  })
      : router = GoRouter(
          initialLocation: AppRoutes.login,
          refreshListenable: GoRouterRefreshStream(authBloc.stream),
          redirect: (BuildContext context, GoRouterState state) {
            final isLoggedIn = authBloc.state.isAuthenticated;
            final isLogin = state.matchedLocation == AppRoutes.login;
            final isPublicContact = state.matchedLocation == AppRoutes.publicContact;

            if (!isLoggedIn && !isLogin && !isPublicContact) {
              return AppRoutes.login;
            }

            if (isLoggedIn && isLogin) {
              return AppRoutes.dashboard;
            }

            return null;
          },
          routes: [
            GoRoute(
              path: AppRoutes.login,
              name: AppRouteNames.login,
              builder: (context, state) => LoginScreen(authBloc: authBloc),
            ),
            ShellRoute(
              builder: (context, state, child) => AppShell(child: child),
              routes: [
                GoRoute(
                  path: AppRoutes.dashboard,
                  name: AppRouteNames.dashboard,
                  builder: (context, state) => DashboardScreen(dashboardBloc: dashboardBloc),
                ),
                GoRoute(
                  path: AppRoutes.portals,
                  name: AppRouteNames.portals,
                  builder: (context, state) => PortalsScreen(portalsBloc: portalsBloc),
                ),
                GoRoute(
                  path: AppRoutes.requests,
                  name: AppRouteNames.requests,
                  builder: (context, state) => ContactRequestsScreen(contactRequestsBloc: contactRequestsBloc),
                ),
                GoRoute(
                  path: AppRoutes.testimonials,
                  name: AppRouteNames.testimonials,
                  builder: (context, state) => TestimonialsScreen(testimonialsBloc: testimonialsBloc),
                ),
                GoRoute(
                  path: AppRoutes.news,
                  name: AppRouteNames.news,
                  builder: (context, state) => NewsScreen(newsBloc: newsBloc),
                ),
              ],
            ),
            GoRoute(
              path: AppRoutes.publicContact,
              name: AppRouteNames.publicContact,
              builder: (context, state) => PublicContactScreen(publicContactBloc: publicContactBloc),
            ),
          ],
        );

  final AuthBloc authBloc;
  final DashboardBloc dashboardBloc;
  final PortalsBloc portalsBloc;
  final ContactRequestsBloc contactRequestsBloc;
  final TestimonialsBloc testimonialsBloc;
  final NewsBloc newsBloc;
  final PublicContactBloc publicContactBloc;
  final GoRouter router;
}

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}