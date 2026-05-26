import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

import 'package:latinoamerica_comparte_cms_admin/core/widgets/feature_placeholder_screen.dart';

void main() {
  testWidgets('renders placeholder feature screen', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturePlaceholderScreen()));

    expect(find.textContaining('La arquitectura ya está lista'), findsOneWidget);
  });
}
