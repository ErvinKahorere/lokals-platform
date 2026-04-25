import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController(text: '+264810000002');
  final _passwordController = TextEditingController(text: 'password');
  String? _error;

  String _buildLoginError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Login timed out. Check that the backend is running and reachable from Android.';
      case DioExceptionType.connectionError:
        return 'Cannot reach the server. On a real Android device, use your computer LAN IP for API_BASE_URL.';
      case DioExceptionType.badResponse:
        return 'Login failed. Check your phone number and password.';
      default:
        return 'Something went wrong. Try again.';
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Login',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Minimal login, upgrade later',
            subtitle:
                'Phone-first sign-in keeps onboarding short. Profiles grow only when needed.',
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              children: [
                LokalsTextField(
                  controller: _phoneController,
                  label: 'Phone',
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _passwordController,
                  label: 'Password',
                  obscureText: true,
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ],
                const SizedBox(height: 16),
                PrimaryAction(
                  label: 'Sign in',
                  isBusy: auth.isLoading,
                  onPressed: () async {
                    setState(() {
                      _error = null;
                    });
                    try {
                      await ref
                          .read(authControllerProvider.notifier)
                          .login(
                            _phoneController.text.trim(),
                            _passwordController.text.trim(),
                          );
                      if (!context.mounted) return;
                      context.go('/');
                    } on DioException catch (error) {
                      setState(() {
                        _error = _buildLoginError(error);
                      });
                    }
                  },
                ),
                const SizedBox(height: 12),
                AppButton(
                  label: 'Browse as guest',
                  variant: AppButtonVariant.secondary,
                  onPressed: () => context.go('/'),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => context.go('/register'),
                  child: const Text('New here? Create profile'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'Demo accounts',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          ..._demoAccounts.map(
            (account) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: LokalsCard(
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(account.label),
                  subtitle: Text(account.phone),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    _phoneController.text = account.phone;
                    _passwordController.text = account.password;
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DemoAccount {
  const _DemoAccount(this.label, this.phone, this.password);

  final String label;
  final String phone;
  final String password;
}

const _demoAccounts = [
  _DemoAccount('Citizen', '+264810000002', 'password'),
  _DemoAccount('Provider barber', '+264810000003', 'password'),
  _DemoAccount('Super admin', '+264810000001', 'password'),
];
