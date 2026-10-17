import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/models/user_role.dart';
import 'core/services/auth_service.dart';
import 'core/services/ota_service.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/ambulance/screens/ambulance_emt_screen.dart';
import 'features/nurse/screens/nurse_bedside_screen.dart';
import 'features/superintendent/screens/superintendent_screen.dart';
import 'features/cmo/screens/cmo_district_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => OtaService()..checkForUpdates()),
      ],
      child: const TriageNetApp(),
    ),
  );
}

class TriageNetApp extends StatelessWidget {
  const TriageNetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TriageNet Companion',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF100904),
        primaryColor: const Color(0xFFEA580C),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFEA580C),
          secondary: Color(0xFFDC5000),
          surface: Color(0xFF181009),
          background: Color(0xFF100904),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF181009),
          elevation: 0,
        ),
      ),
      home: const RootRouter(),
    );
  }
}

class RootRouter extends StatelessWidget {
  const RootRouter({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    if (!auth.isAuthenticated) {
      return const LoginScreen();
    }

    // Role-Based Dynamic Redirection
    switch (auth.currentUser!.role) {
      case UserRole.ambulanceDispatch:
        return const AmbulanceEmtScreen();
      case UserRole.triageNurse:
        return const NurseBedsideScreen();
      case UserRole.hospitalAdmin:
        return const SuperintendentScreen();
      case UserRole.districtCmo:
      case UserRole.superAdmin:
      case UserRole.stateHealthDept:
        return const DistrictCmoScreen();
    }
  }
}
