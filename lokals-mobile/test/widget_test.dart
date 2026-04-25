import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lokals_mobile/src/app.dart';

void main() {
  testWidgets('renders Lokals app shell', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: LokalsApp()));
    await tester.pumpAndSettle();

    expect(find.text('LOKALS'), findsOneWidget);
  });
}
