import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../config/app_config.dart';
import '../../widgets/cards.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController(text: '+264810001050');
  final _passwordController = TextEditingController(text: 'Password123!');
  String? _error;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

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
    final next = GoRouterState.of(context).uri.queryParameters['next'];

    return Scaffold(
      backgroundColor: AppColors.softBackground,
      body: SafeArea(
        child: Form(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded),
                ),
              ),
              const SizedBox(height: 8),
              Center(child: Image.asset('assets/brand/lokals-logo.png', height: 44)),
              const SizedBox(height: 18),
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.purpleSoftAlt,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Everything in your city',
                    style: TextStyle(
                      color: AppColors.primaryPurple,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Sign in around Okahandja',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  color: AppColors.deepCharcoal,
                  height: 1.06,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                next != null && next.isNotEmpty
                    ? 'Sign in to continue'
                    : 'Phone-first access keeps bookings, updates, and local activity close by.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMuted,
              ),
              const SizedBox(height: 18),
              AppCard(
                variant: AppCardVariant.dashboard,
                padding: const EdgeInsets.all(16),
                child: const Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: AppColors.purpleSoft,
                      child: Icon(Icons.place_outlined, color: AppColors.primaryPurple),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Your local life, ready to move',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '${AppConfig.pilotLocationMessage} Sign in once to book services, follow updates, and act faster nearby.',
                            style: TextStyle(color: AppColors.mutedText),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              LokalsCard(
                child: Column(
                  children: [
                    LokalsTextField(
                      controller: _phoneController,
                      label: 'Phone number',
                      hint: '+264...',
                      keyboardType: TextInputType.phone,
                      errorText: _error == 'phone' ? 'Enter a valid phone number.' : null,
                    ),
                    const SizedBox(height: 12),
                    LokalsTextField(
                      controller: _passwordController,
                      label: 'Password',
                      hint: 'Enter your password',
                      obscureText: true,
                      errorText: _error == 'password' ? 'Enter your password.' : null,
                    ),
                    if (_error != null && _error != 'phone' && _error != 'password') ...[
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: const TextStyle(color: AppColors.danger),
                      ),
                    ],
                    const SizedBox(height: 16),
                    PrimaryAction(
                      label: 'Continue',
                      isBusy: auth.isLoading,
                      onPressed: () async {
                        final phone = _phoneController.text.trim();
                        final password = _passwordController.text.trim();
                        setState(() {
                          _error = null;
                        });
                        if (phone.length < 8) {
                          setState(() => _error = 'phone');
                          return;
                        }
                        if (password.isEmpty) {
                          setState(() => _error = 'password');
                          return;
                        }
                        try {
                          await ref.read(authControllerProvider.notifier).login(phone, password);
                          if (!mounted || !context.mounted) return;
                          context.go(next?.isNotEmpty == true ? next! : '/');
                        } on DioException catch (error) {
                          if (!mounted) return;
                          setState(() {
                            _error = _buildLoginError(error);
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.purpleSoft,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.purpleBorder),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'After login',
                            style: TextStyle(fontWeight: FontWeight.w800),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'LOKALS will personalize Home, alerts, and public services around your Okahandja area.',
                            style: TextStyle(color: AppColors.mutedText),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    AppButton(
                      label: 'Browse as guest',
                      variant: AppButtonVariant.secondary,
                      onPressed: () => context.go('/home'),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => context.go('/register'),
                      child: const Text('New here? Create profile'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              const Text(
                'Demo accounts',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              ..._demoAccounts.map(
                (account) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LokalsSurfaceTile(
                    onTap: () {
                      _phoneController.text = account.phone;
                      _passwordController.text = account.password;
                    },
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.purpleSoft,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.person_outline_rounded, color: AppColors.primaryPurple),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(account.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(height: 2),
                              Text(account.phone, style: AppTextStyles.bodyMuted),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.primaryPurple),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
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
  _DemoAccount('Citizen', '+264810001050', 'Password123!'),
  _DemoAccount('Business owner', '+264810001101', 'Password123!'),
  _DemoAccount('Organization admin', '+264810001020', 'Password123!'),
  _DemoAccount('Town manager', '+264810001001', 'Password123!'),
  _DemoAccount('Service provider', '+264810002203', 'Password123!'),
  _DemoAccount('Super admin', '+264810001000', 'Password123!'),
];
