import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

String buildLoginLocation({String? next}) {
  if (next == null || next.isEmpty) {
    return '/login';
  }

  return Uri(path: '/login', queryParameters: {'next': next}).toString();
}

void promptSignIn(
  BuildContext context, {
  required String next,
  String message = 'Sign in to continue',
}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message)),
  );
  context.go(buildLoginLocation(next: next));
}
