import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class OtaUpdateInfo {
  final String latestVersion;
  final int buildNumber;
  final String releaseDate;
  final String apkDownloadUrl;
  final double apkSizeMb;
  final String sha256;
  final List<String> releaseHighlights;
  final bool isMandatory;

  OtaUpdateInfo({
    required this.latestVersion,
    required this.buildNumber,
    required this.releaseDate,
    required this.apkDownloadUrl,
    required this.apkSizeMb,
    required this.sha256,
    required this.releaseHighlights,
    required this.isMandatory,
  });

  factory OtaUpdateInfo.fromJson(Map<String, dynamic> json) {
    return OtaUpdateInfo(
      latestVersion: json['latestVersion'] ?? '1.2.0',
      buildNumber: json['buildNumber'] ?? 120,
      releaseDate: json['releaseDate'] ?? '',
      apkDownloadUrl: json['apkDownloadUrl'] ?? '',
      apkSizeMb: (json['apkSizeMb'] as num?)?.toDouble() ?? 18.4,
      sha256: json['sha256Checksum'] ?? '',
      releaseHighlights: List<String>.from(json['releaseHighlights'] ?? []),
      isMandatory: json['mandatory'] ?? false,
    );
  }
}

class OtaService extends ChangeNotifier {
  static const int currentAppBuildNumber = 110; // Current installed build
  static const String currentAppVersion = '1.1.0';

  OtaUpdateInfo? _availableUpdate;
  bool _isChecking = false;

  OtaUpdateInfo? get availableUpdate => _availableUpdate;
  bool get hasUpdate => _availableUpdate != null && _availableUpdate!.buildNumber > currentAppBuildNumber;
  bool get isChecking => _isChecking;

  Future<void> checkForUpdates({String baseUrl = 'http://localhost:3000'}) async {
    _isChecking = true;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('$baseUrl/api/app/version')).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final updateInfo = OtaUpdateInfo.fromJson(data);
        if (updateInfo.buildNumber > currentAppBuildNumber) {
          _availableUpdate = updateInfo;
        } else {
          _availableUpdate = null;
        }
      }
    } catch (e) {
      debugPrint('OTA check failed or offline: $e');
    } finally {
      _isChecking = false;
      notifyListeners();
    }
  }
}
