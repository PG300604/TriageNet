enum UserRole {
  ambulanceDispatch,
  triageNurse,
  hospitalAdmin,
  districtCmo,
  superAdmin,
  stateHealthDept;

  String get displayName {
    switch (this) {
      case UserRole.ambulanceDispatch:
        return '108 Ambulance EMT Paramedic';
      case UserRole.triageNurse:
        return 'Emergency Triage Nurse';
      case UserRole.hospitalAdmin:
        return 'Medical Superintendent';
      case UserRole.districtCmo:
        return 'District Chief Medical Officer';
      case UserRole.superAdmin:
        return 'State Health Command (Super Admin)';
      case UserRole.stateHealthDept:
        return 'State Health Observer';
    }
  }

  String get code {
    switch (this) {
      case UserRole.ambulanceDispatch:
        return 'AMBULANCE_DISPATCH';
      case UserRole.triageNurse:
        return 'TRIAGE_NURSE';
      case UserRole.hospitalAdmin:
        return 'HOSPITAL_ADMIN';
      case UserRole.districtCmo:
        return 'DISTRICT_CMO';
      case UserRole.superAdmin:
        return 'SUPER_ADMIN';
      case UserRole.stateHealthDept:
        return 'STATE_HEALTH_DEPT';
    }
  }

  static UserRole fromCode(String code) {
    switch (code.toUpperCase()) {
      case 'AMBULANCE_DISPATCH':
        return UserRole.ambulanceDispatch;
      case 'TRIAGE_NURSE':
        return UserRole.triageNurse;
      case 'HOSPITAL_ADMIN':
        return UserRole.hospitalAdmin;
      case 'DISTRICT_CMO':
        return UserRole.districtCmo;
      case 'SUPER_ADMIN':
        return UserRole.superAdmin;
      case 'STATE_HEALTH_DEPT':
      default:
        return UserRole.stateHealthDept;
    }
  }
}

class UserSession {
  final String staffId;
  final String fullName;
  final String email;
  final UserRole role;
  final String hospitalId;
  final String hospitalName;
  final String districtName;
  final String? token;

  UserSession({
    required this.staffId,
    required this.fullName,
    required this.email,
    required this.role,
    required this.hospitalId,
    required this.hospitalName,
    required this.districtName,
    this.token,
  });

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      staffId: json['staffId'] ?? '',
      fullName: json['fullName'] ?? json['name'] ?? '',
      email: json['email'] ?? '',
      role: UserRole.fromCode(json['role'] ?? 'AMBULANCE_DISPATCH'),
      hospitalId: json['hospitalId'] ?? '',
      hospitalName: json['hospitalName'] ?? '',
      districtName: json['districtName'] ?? 'Ranchi',
      token: json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'staffId': staffId,
      'fullName': fullName,
      'email': email,
      'role': role.code,
      'hospitalId': hospitalId,
      'hospitalName': hospitalName,
      'districtName': districtName,
      'token': token,
    };
  }
}
