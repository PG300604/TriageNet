import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/auth_service.dart';

class SuperintendentScreen extends StatefulWidget {
  const SuperintendentScreen({super.key});

  @override
  State<SuperintendentScreen> createState() => _SuperintendentScreenState();
}

class _SuperintendentScreenState extends State<SuperintendentScreen> {
  int _icuUsed = 14;
  final int _icuTotal = 16;
  bool _erpSynced = true;

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
            Text('HOSPITAL SUPERINTENDENT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFFEDD7))),
            Text('Sadar Hospital Command Console', style: TextStyle(fontSize: 10, color: Color(0xFFEA580C))),
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
            // Ward & ICU Census
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
                  const Text('CRITICAL CARE CAPACITY METERS', style: TextStyle(color: Color(0xFFDC5000), fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetricBox('ICU BEDS OCCUPIED', '$_icuUsed / $_icuTotal', Colors.redAccent),
                      _buildMetricBox('VENTILATORS', '6 / 8 Active', Colors.cyanAccent),
                      _buildMetricBox('SURGICAL OT', '3 / 4 In-Use', Colors.amberAccent),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // On-Duty Doctor Rosters
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
                  const Text('ON-DUTY SPECIALIST SURGEONS', style: TextStyle(color: Color(0xFFDC5000), fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _buildDoctorRow('Dr. A. K. Verma', 'Trauma Surgeon', 'READY IN BAY', Colors.greenAccent),
                  _buildDoctorRow('Dr. C. B. Sahay', 'Neurosurgeon', 'OCCUPIED IN OT', Colors.amberAccent),
                  _buildDoctorRow('Dr. Anita Minz', 'Pulmonologist', 'READY IN BAY', Colors.greenAccent),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ERP Sync Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF20140C),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.green.withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.sync_alt, color: Colors.greenAccent, size: 24),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('NIC e-HOSPITAL GATEWAY CONNECTED', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        Text('Real-time ledger sync active · ₹85.0L Operating Budget', style: TextStyle(color: Colors.grey, fontSize: 10)),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Financial ledger synchronized!')));
                    },
                    child: const Text('SYNC', style: TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricBox(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 9)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildDoctorRow(String name, String specialty, String status, Color statusColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Text(specialty, style: const TextStyle(color: Colors.grey, fontSize: 10)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: statusColor.withOpacity(0.5)),
            ),
            child: Text(status, style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
