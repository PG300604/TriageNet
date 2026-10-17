import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/auth_service.dart';

class NurseBedsideScreen extends StatefulWidget {
  const NurseBedsideScreen({super.key});

  @override
  State<NurseBedsideScreen> createState() => _NurseBedsideScreenState();
}

class _NurseBedsideScreenState extends State<NurseBedsideScreen> {
  final _patientNameController = TextEditingController(text: 'Ramesh Munda');
  int _acuityScore = 88;
  String _selectedPriority = 'P1 IMMEDIATE';
  bool _bedLocked = false;

  void _calculateScore() {
    setState(() {
      _acuityScore = 92;
      _selectedPriority = 'P1 IMMEDIATE (CRITICAL ICU MANDATORY)';
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      backgroundColor: const Color(0xFF100904),
      appBar: AppBar(
        backgroundColor: const Color(0xFF181009),
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('BEDSIDE EMERGENCY TRIAGE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFFEDD7))),
            Text('RIMS Trauma Resuscitation Bay', style: TextStyle(fontSize: 10, color: Color(0xFFEA580C))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, size: 20, color: Colors.grey),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Patient Intake Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF181009),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF40372E)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('PATIENT REGISTRATION & VITALS', style: TextStyle(color: Color(0xFFDC5000), fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _patientNameController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Patient Name & Age',
                      labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                      filled: true,
                      fillColor: Colors.black45,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF382416),
                      foregroundColor: const Color(0xFFFFEDD7),
                      minimumSize: const Size(double.infinity, 44),
                    ),
                    icon: const Icon(Icons.calculate, color: Color(0xFFEA580C), size: 18),
                    label: const Text('CALCULATE ML ACUITY SCORE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: _calculateScore,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Live Acuity Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF20140C),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.red.withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$_acuityScore',
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.redAccent),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('SEVERITY SCORER', style: TextStyle(color: Colors.grey, fontSize: 10)),
                        Text(_selectedPriority, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        const Text('Explainability: SpO2 < 85% (+42pts), GCS < 10 (+36pts)', style: TextStyle(color: Colors.grey, fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Bed Reservation Lock Action
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _bedLocked ? Colors.emerald.shade800 : const Color(0xFFEA580C),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                setState(() => _bedLocked = !_bedLocked);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(_bedLocked ? '✅ ICU Bed #04 LOCKED for ${_patientNameController.text}' : 'Bed Lock Released'),
                    backgroundColor: _bedLocked ? Colors.green.shade800 : Colors.grey.shade900,
                  ),
                );
              },
              child: Text(
                _bedLocked ? 'ICU BED #04 RESERVED (HOLD CONFIRMED)' : 'LOCK ICU RESUSCITATION BED',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
