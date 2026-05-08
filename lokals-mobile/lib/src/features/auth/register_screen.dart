import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'auth_controller.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _townController = TextEditingController(text: 'Windhoek');
  final _areaController = TextEditingController(text: 'Katutura');
  final Set<String> _roles = {'citizen'};
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
    const roleOptions = [
      'citizen',
      'worker',
      'seller',
      'business_owner',
      'service_provider',
      'driver',
      'organization_representative',
    ];

    return LokalsShell(
      title: 'Create profile',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(child: Image.asset('assets/brand/lokals-logo.png', height: 44)),
          const SizedBox(height: 16),
          const SectionTitle(
            title: 'Create your LOKALS profile',
            subtitle: 'A short setup keeps the app friendly, local, and quick to join.',
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.primaryPurple.withValues(alpha: 0.14)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x140F172A),
                  blurRadius: 28,
                  offset: Offset(0, 12),
                ),
              ],
            ),
            child: const Row(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: Color(0xFFF3E8FF),
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
                        'Choose your area and role now, then grow the profile as you use LOKALS.',
                        style: TextStyle(color: AppColors.mutedText),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LokalsTextField(controller: _nameController, label: 'Name', hint: 'Enter your name'),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _phoneController,
                  label: 'Phone',
                  hint: '+264...',
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                LokalsTextField(controller: _townController, label: 'Town', hint: 'Your town'),
                const SizedBox(height: 12),
                LokalsTextField(controller: _areaController, label: 'Area', hint: 'Your area'),
                const SizedBox(height: 16),
                const Text(
                  'Choose role(s)',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: roleOptions.map((role) {
                    final active = _roles.contains(role);
                    return FilterChip(
                      label: Text(role.replaceAll('_', ' ')),
                      selected: active,
                      onSelected: (selected) {
                        setState(() {
                          if (selected) {
                            _roles.add(role);
                          } else {
                            _roles.remove(role);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: AppColors.danger)),
                ],
                const SizedBox(height: 16),
                PrimaryAction(
                  label: 'Continue',
                  isBusy: auth.isLoading,
                  onPressed: () async {
                    setState(() => _error = null);
                    try {
                      await ref.read(authControllerProvider.notifier).register(
                            name: _nameController.text.trim(),
                            phone: _phoneController.text.trim(),
                            town: _townController.text.trim(),
                            area: _areaController.text.trim(),
                            roles: _roles.toList(),
                          );
                      if (!context.mounted) return;
                      context.go('/');
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
    );
  }
}
