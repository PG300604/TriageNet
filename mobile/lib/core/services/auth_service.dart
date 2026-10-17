import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http; // Added for HTTP requests
import '../models/user_role.dart';

class AuthService extends ChangeNotifier {
  UserSession? _currentUser;
  bool _isLoading = false;

  UserSession? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;

  AuthService() {
    _loadSessionFromPrefs();
  }

  Future<void> _loadSessionFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('triagenet_mobile_user');
      if (userJson != null) {
        _currentUser = UserSession.fromJson(jsonDecode(userJson));
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading saved session: $e');
    }
  }

  Future<bool> login({
    required String staffId,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    final String baseUrl = prefs.getString('triagenet_api_base_url') ?? 'http://localhost:8080';

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'staffId': staffId, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['token'];
        final user = data['user'];

        _currentUser = UserSession(
          staffId: user['staffId'],
          fullName: user['fullName'],
          email: user['email'],
          role: UserRole.values.firstWhere((e) => e.toString() == user['role'], orElse: () => UserRole.ambulanceDispatch),
          hospitalId: user['hospitalId'],
          hospitalName: user['hospitalName'],
          districtName: user['districtName'],
          token: token,
        );

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('triagenet_mobile_user', jsonEncode(_currentUser!.toJson()));

        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Network error: $e');
    }

    // Fallback to offline mode for demo/presets
    _fallbackToPresetIfNeeded(staffId);

    _isLoading = false;
    notifyListeners();
    return true;
  }

  void _fallbackToPresetIfNeeded(String staffId) {
    UserRole detectedRole = UserRole.ambulanceDispatch;
    String detectedName = 'Sanjay Tirkey (EMT-P)';
    String hospitalId = 'jh-rims-ranchi';
    String hospitalName = 'Rajendra Institute of Medical Sciences (RIMS)';
    String district = 'Ranchi';

    final cleanId = staffId.trim().toUpperCase();
    if (cleanId.contains('NUR')) {
      detectedRole = UserRole.triageNurse;
      detectedName = 'Sunita Marandi (RN)';
    } else if (cleanId.contains('MS') || cleanId.contains('ADM')) {
      detectedRole = UserRole.hospitalAdmin;
      detectedName = 'Dr. Vinay Kumar Sinha (MS)';
      hospitalId = 'jh-sadar-hosp-hazaribagh';
      hospitalName = 'Sadar Hospital Hazaribagh';
      district = 'Hazaribagh';
    } else if (cleanId.contains('CMO')) {
      detectedRole = UserRole.districtCmo;
      detectedName = 'Dr. Prabhat Kumar (District CMO)';
      hospitalName = 'District Health Command HQ';
    } else if (cleanId.contains('GOV') || cleanId.contains('ADMIN')) {
      detectedRole = UserRole.superAdmin;
      detectedName = 'State Emergency Command';
      hospitalName = 'Jharkhand State Health Department';
    }

    _currentUser = UserSession(
      staffId: cleanId.isEmpty ? 'JH-DSP-5001' : cleanId,
      fullName: detectedName,
      email: '${cleanId.toLowerCase()}@jharkhandhealth.gov.in',
      role: detectedRole,
      hospitalId: hospitalId,
      hospitalName: hospitalName,
      districtName: district,
      token: 'JWT_MOBILE_BEARER_${DateTime.now().millisecondsSinceEpoch}',
    );

    try {
      SharedPreferences.getInstance().then((prefs) {
        prefs.setString('triagenet_mobile_user', jsonEncode(_currentUser!.toJson()));
      });
    } catch (_) {}
  }

  Future<void> loginAsPresetRole(UserRole role) async {
    String id = 'JH-DSP-5001';
    switch (role) {
      case UserRole.ambulanceDispatch:
        id = 'JH-DSP-5001';
        break;
      case UserRole.triageNurse:
        id = 'JH-NUR-1002';
        break;
      case UserRole.hospitalAdmin:
        id = 'JH-MS-3001';
        break;
      case UserRole.districtCmo:
        id = 'JH-CMO-2001';
        break;
      case UserRole.superAdmin:
      case UserRole.stateHealthDept:
        id = 'JH-GOV-0001';
        break;
    }
    await login(staffId: id, password: 'password123');
  }

  Future<void> logout() async {
    _currentUser = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('triagenet_mobile_user');
    } catch (_) {}
    notifyListeners();
  }
}