import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/services/ota_service.dart';

class AmbulanceEmtScreen extends StatefulWidget {
  const AmbulanceEmtScreen({super.key});

  @override
  State<AmbulanceEmtScreen> createState() => _AmbulanceEmtScreenState();
}

class _AmbulanceEmtScreenState extends State<AmbulanceEmtScreen> {
  double _spo2 = 82;
  double _heartRate = 138;
  double _systolicBp = 84;
  double _gcs = 10;
  bool _greenWaveActive = false;
  String _selectedHospital = 'RIMS Ranchi (Apex Level-1 Trauma)';
  String _patientName = 'Kunal Besra (34y, Polytrauma)';
  String _ambulanceNumber = 'JH-01-ALS-1081';

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final ota = context.watch<OtaService>();

    return Scaffold(
      backgroundColor: const Color(0xFF100904),
      appBar: AppBar(
        backgroundColor: const Color(0xFF181009),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFEA580C).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFEA580C).withOpacity(0.4)),
              ),
              child: const Icon(Icons.local_shipping, color: Color(0xFFEA580C), size: 18),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '108 EMT TELEMETRY',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFFEDD7)),
                ),
                Text(
                  'UNIT $_ambulanceNumber · ALS',
                  style: const TextStyle(fontSize: 10, color: Color(0xFFDC5000), fontFamily: 'monospace'),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, size: 20, color: Colors.stone ?? Colors.grey),
            tooltip: 'Sign Out',
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // OTA Update Banner if available
            if (ota.hasUpdate)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFFEA580C).withOpacity(0.8), const Color(0xFF9A3412)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amberAccent.withOpacity(0.5)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.system_update_alt, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Update v${ota.availableUpdate!.latestVersion} Available! Tap to install new 3D road maps.',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),

            // Active Incident Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF181009),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF40372E)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text(
                        'ACTIVE CASUALTY',
                        style: TextStyle(fontSize: 10, color: Color(0xFFDC5000), fontWeight: FontWeight.bold),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: Colors.red.withOpacity(0.5)),
                        ),
                        child: const Text('P1 IMMEDIATE', style: TextStyle(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(_patientName, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Scene: NH-33 Toll Plaza Crash (Ormanjhi)', style: TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 108 Green Wave Signal Preemption Button
            GestureDetector(
              onTap: () {
                setState(() => _greenWaveActive = !_greenWaveActive);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(_greenWaveActive ? '🚨 108 GREEN WAVE ACTIVE: Highway signals cleared!' : 'Green Wave Deactivated'),
                    backgroundColor: _greenWaveActive ? Colors.green.shade800 : Colors.grey.shade900,
                  ),
                );
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _greenWaveActive
                        ? [Colors.emerald ?? Colors.green, Colors.teal.shade800]
                        : [const Color(0xFF382416), const Color(0xFF20140C)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _greenWaveActive ? Colors.greenAccent : const Color(0xFFEA580C).withOpacity(0.4)),
                  boxShadow: _greenWaveActive ? [BoxShadow(color: Colors.green.withOpacity(0.3), blurRadius: 12)] : null,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_greenWaveActive ? Icons.offline_bolt : Icons.traffic, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      _greenWaveActive ? '108 GREEN WAVE ENGAGED (0m DELAY)' : 'ACTIVATE 108 GREEN WAVE SIREN',
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Live Vitals Sliders
            const Text(
              'IN-TRANSIT ONBOARD VITALS',
              style: TextStyle(color: Color(0xFFFFEDD7), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            _buildVitalSlider(
              label: 'Oxygen Saturation (SpO₂)',
              value: _spo2,
              min: 50,
              max: 100,
              unit: '%',
              color: _spo2 < 90 ? Colors.redAccent : Colors.tealAccent,
              onChanged: (v) => setState(() => _spo2 = v),
            ),
            _buildVitalSlider(
              label: 'Glasgow Coma Scale (GCS)',
              value: _gcs,
              min: 3,
              max: 15,
              unit: '/15',
              color: _gcs <= 8 ? Colors.redAccent : Colors.amberAccent,
              onChanged: (v) => setState(() => _gcs = v),
            ),
            _buildVitalSlider(
              label: 'Systolic Blood Pressure',
              value: _systolicBp,
              min: 50,
              max: 200,
              unit: ' mmHg',
              color: _systolicBp < 90 ? Colors.redAccent : Colors.white,
              onChanged: (v) => setState(() => _systolicBp = v),
            ),
            _buildVitalSlider(
              label: 'Heart Rate (Pulse)',
              value: _heartRate,
              min: 40,
              max: 180,
              unit: ' bpm',
              color: _heartRate > 120 ? Colors.orangeAccent : Colors.white,
              onChanged: (v) => setState(() => _heartRate = v),
            ),
            const SizedBox(height: 16),

            // Target Hospital Pre-Alert Button
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEA580C),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('📡 Pre-Alert Broadcast to $_selectedHospital trauma bay!'),
                    backgroundColor: const Color(0xFFEA580C),
                  ),
                );
              },
              child: const Text('PRE-ALERT TRAUMA BAY TEAM', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVitalSlider({
    required String label,
    required double value,
    required double min,
    required double max,
    required String unit,
    required Color color,
    required ValueChanged<double> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF181009),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF40372E).withOpacity(0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
              Text('${value.round()}$unit', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
          Slider(
            value: value,
            min: min,
            max: max,
            activeColor: const Color(0xFFEA580C),
            inactiveColor: Colors.white12,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
