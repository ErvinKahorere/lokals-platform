import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
          const SectionTitle(
            title: 'Everything in your city.',
            subtitle: 'Short setup now. Personalize the rest later.',
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LokalsTextField(controller: _nameController, label: 'Name'),
                const SizedBox(height: 12),
                LokalsTextField(
                  controller: _phoneController,
                  label: 'Phone',
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                LokalsTextField(controller: _townController, label: 'Town'),
                const SizedBox(height: 12),
                LokalsTextField(controller: _areaController, label: 'Area'),
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
                  Text(_error!, style: const TextStyle(color: Colors.red)),
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
                    } on DioException {
                      setState(() => _error = 'Something went wrong. Try again.');
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
