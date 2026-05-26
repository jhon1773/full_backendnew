import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_constants.dart';
import '../../features/auth/presentation/auth_presentation.dart';

class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        final navigationItems = _navigationItemsFor(authState.session?.user.role);
        final selectedIndex = _selectedIndex(location, navigationItems);

        return Scaffold(
          body: Column(
            children: [
              SafeArea(
                bottom: false,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    border: Border(bottom: BorderSide(color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.35))),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          _titleFor(location),
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                        ),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => context.read<AuthBloc>().add(const AuthLogoutRequested()),
                        icon: const Icon(Icons.logout_outlined),
                        label: const Text('Salir'),
                      ),
                    ],
                  ),
                ),
              ),
              Expanded(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final isWide = constraints.maxWidth >= 1024;
                    return Row(
                      children: [
                        if (isWide)
                          NavigationRail(
                            selectedIndex: selectedIndex,
                            onDestinationSelected: (index) => _go(context, navigationItems[index].route),
                            labelType: NavigationRailLabelType.all,
                            destinations: navigationItems
                                .map((item) => NavigationRailDestination(
                                      icon: Icon(item.iconOutlined),
                                      selectedIcon: Icon(item.iconFilled),
                                      label: Text(item.label),
                                    ))
                                .toList(growable: false),
                          ),
                        Expanded(child: child),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
          bottomNavigationBar: MediaQuery.sizeOf(context).width >= 1024
              ? null
              : NavigationBar(
                  selectedIndex: selectedIndex,
                  onDestinationSelected: (index) => _go(context, navigationItems[index].route),
                  destinations: navigationItems
                      .map(
                        (item) => NavigationDestination(
                          icon: Icon(item.iconOutlined),
                          selectedIcon: Icon(item.iconFilled),
                          label: item.label,
                        ),
                      )
                      .toList(growable: false),
                ),
        );
      },
    );
  }

  int _selectedIndex(String location, List<_NavigationItem> items) {
    final index = items.indexWhere((item) => location.startsWith(item.route));
    return index < 0 ? 0 : index;
  }

  void _go(BuildContext context, String route) {
    context.go(route);
  }

  String _titleFor(String location) {
    if (location.startsWith(AppRoutes.portals)) return 'Portales';
    if (location.startsWith(AppRoutes.requests)) return 'Solicitudes';
    if (location.startsWith(AppRoutes.testimonials)) return 'Testimonios';
    if (location.startsWith(AppRoutes.news)) return 'Noticias';
    return 'Dashboard';
  }

  List<_NavigationItem> _navigationItemsFor(String? role) {
    final items = <_NavigationItem>[
      const _NavigationItem(label: 'Dashboard', route: AppRoutes.dashboard, iconOutlined: Icons.dashboard_outlined, iconFilled: Icons.dashboard),
    ];

    if (role == AppRoles.superadmin) {
      items.add(const _NavigationItem(label: 'Portales', route: AppRoutes.portals, iconOutlined: Icons.public_outlined, iconFilled: Icons.public));
    }

    if (role == AppRoles.superadmin || role == AppRoles.adminPais) {
      items.add(const _NavigationItem(label: 'Solicitudes', route: AppRoutes.requests, iconOutlined: Icons.inbox_outlined, iconFilled: Icons.inbox));
    }

    if (role == AppRoles.superadmin || role == AppRoles.adminPais || role == AppRoles.editor) {
      items.addAll(const [
        _NavigationItem(label: 'Testimonios', route: AppRoutes.testimonials, iconOutlined: Icons.emoji_emotions_outlined, iconFilled: Icons.emoji_emotions),
        _NavigationItem(label: 'Noticias', route: AppRoutes.news, iconOutlined: Icons.newspaper_outlined, iconFilled: Icons.newspaper),
      ]);
    }

    return items;
  }
}

class _NavigationItem {
  const _NavigationItem({required this.label, required this.route, required this.iconOutlined, required this.iconFilled});

  final String label;
  final String route;
  final IconData iconOutlined;
  final IconData iconFilled;
}