import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/user_role.dart';
import '../../../core/services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _staffIdController = TextEditingController(text: 'JH-DSP-5001');
  final _passwordController = TextEditingController(text: 'password123');

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      backgroundColor: const Color(0xFF100904),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo & Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF491205),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFEA580C).withOpacity(0.4)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFEA580C).withOpacity(0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.emergency, color: Color(0xFFEA580C), size: 40),
                ),
                const SizedBox(height: 16),
                const Text(
                  'TRIAGENET COMPANION',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                    color: Color(0xFFFFEDD7),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Gov of Jharkhand Emergency Healthcare Services',
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Credentials Input Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF181009),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF40372E)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'STAFF AUTHORIZATION ID',
                        style: TextStyle(fontSize: 10, color: Color(0xFFDC5000), fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _staffIdController,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.badge, color: Colors.grey, size: 18),
                          hintText: 'e.g. JH-DSP-5001 or JH-NUR-1002',
                          hintStyle: const TextStyle(color: Colors.white24, fontSize: 11),
                          filled: true,
                          fillColor: Colors.black38,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                      ),
                      const SizedBox(height: 16),

                      const Text(
                        'PASSWORD / PIN',
                        style: TextStyle(fontSize: 10, color: Color(0xFFDC5000), fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _passwordController,
                        obscureText: true,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.lock, color: Colors.grey, size: 18),
                          hintText: '••••••••',
                          hintStyle: const TextStyle(color: Colors.white24, fontSize: 11),
                          filled: true,
                          fillColor: Colors.black38,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Sign In Button
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFEA580C),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: auth.isLoading
                            ? null
                            : () => auth.login(
                                  staffId: _staffIdController.text,
                                  password: _passwordController.text,
                                ),
                        child: auth.isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text(
                                'AUTHENTICATE & REDIRECT',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Quick Role Switcher Chips for Demo / Video Filming
                const Text(
                  'DEMO PERSONA PRESETS (TAP TO INSTANTLY SWITCH ROLE):',
                  style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    _buildRoleChip(context, '🚑 108 Paramedic', UserRole.ambulanceDispatch, 'JH-DSP-5001'),
                    _buildRoleChip(context, '🏥 Triage Nurse', UserRole.triageNurse, 'JH-NUR-1002'),
                    _buildRoleChip(context, '🏢 Hospital Admin', UserRole.hospitalAdmin, 'JH-MS-3001'),
                    _buildRoleChip(context, '🩺 District CMO', UserRole.districtCmo, 'JH-CMO-2001'),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleChip(BuildContext context, String label, UserRole role, String staffId) {
    return ActionChip(
      backgroundColor: const Color(0xFF181009),
      side: const BorderSide(color: Color(0xFF40372E)),
      label: Text(label, style: const TextStyle(color: Color(0xFFFFEDD7), fontSize: 11)),
      onPressed: () {
        setState(() {
          _staffIdController.text = staffId;
        });
        context.read<AuthService>().loginAsPresetRole(role);
      },
    );
  }
}
