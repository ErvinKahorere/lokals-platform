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

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController(text: 'Password123!');
  final _confirmPasswordController = TextEditingController(text: 'Password123!');
  String _selectedArea = AppConfig.okahandjaAreas.contains('Nau-Aib') ? 'Nau-Aib' : AppConfig.okahandjaAreas.first;
  String? _error;

  String _buildRegisterError(DioException error) {
    final response = error.response?.data;
    if (response is Map<String, dynamic>) {
      final errors = response['errors'];
      if (errors is Map && errors.values.isNotEmpty) {
        final first = (errors.values.first as List?)?.first?.toString();
        if (first != null) {
          return first;
        }
      }
      if (response['message'] is String) {
        return response['message'] as String;
      }
    }

    return 'Something went wrong. Try again.';
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

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
                    'Built for Okahandja',
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
                'Create your LOKALS account',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  color: AppColors.deepCharcoal,
                  height: 1.06,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Start with your name, phone, password, and area. Role switching can happen later without slowing this step down.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMuted,
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                padding: const EdgeInsets.all(16),
                child: const Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: AppColors.purpleSoft,
                      child: Icon(Icons.how_to_reg_outlined, color: AppColors.primaryPurple),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Start simple, personalize later',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '${AppConfig.pilotLocationMessage} Your first account opens as a resident, with your area saved from day one.',
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LokalsTextField(controller: _nameController, label: 'Full name', hint: 'Enter your name'),
                    const SizedBox(height: 12),
                    LokalsTextField(
                      controller: _phoneController,
                      label: 'Phone number',
                      hint: '+264...',
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 12),
                    LokalsTextField(
                      controller: _passwordController,
                      label: 'Password',
                      hint: 'Create a password',
                      obscureText: true,
                    ),
                    const SizedBox(height: 12),
                    LokalsTextField(
                      controller: _confirmPasswordController,
                      label: 'Confirm password',
                      hint: 'Repeat your password',
                      obscureText: true,
                    ),
                    const SizedBox(height: 12),
                    InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Pilot town',
                      ),
                      child: Text(
                        AppConfig.pilotTown,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedArea,
                      items: AppConfig.okahandjaAreas
                          .map((area) => DropdownMenuItem(value: area, child: Text(area)))
                          .toList(),
                      decoration: const InputDecoration(labelText: 'Area'),
                      onChanged: (value) => setState(() => _selectedArea = value ?? _selectedArea),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppColors.danger)),
                    ],
                    const SizedBox(height: 16),
                    PrimaryAction(
                      label: 'Create Account',
                      isBusy: auth.isLoading,
                      onPressed: () async {
                        final name = _nameController.text.trim();
                        final phone = _phoneController.text.trim();
                        final password = _passwordController.text.trim();
                        final confirmPassword = _confirmPasswordController.text.trim();
                        setState(() => _error = null);
                        if (name.isEmpty) {
                          setState(() => _error = 'Enter your name.');
                          return;
                        }
                        if (phone.length < 8) {
                          setState(() => _error = 'Enter a valid phone number.');
                          return;
                        }
                        if (password.length < 8) {
                          setState(() => _error = 'Use at least 8 characters for your password.');
                          return;
                        }
                        if (password != confirmPassword) {
                          setState(() => _error = 'Passwords do not match.');
                          return;
                        }
                        try {
                          await ref.read(authControllerProvider.notifier).register(
                            name: name,
                            phone: phone,
                            password: password,
                            town: AppConfig.pilotTown,
                            area: _selectedArea,
                          );
                          if (!context.mounted) return;
                          context.go('/home');
                        } on DioException catch (error) {
                          setState(() => _error = _buildRegisterError(error));
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => context.go('/login'),
                      child: const Text('Already have a profile? Sign in'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
