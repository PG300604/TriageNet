import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/auth_service.dart';

class DistrictCmoScreen extends StatefulWidget {
  const DistrictCmoScreen({super.key});

  @override
  State<DistrictCmoScreen> createState() => _DistrictCmoScreenState();
}

class _DistrictCmoScreenState extends State<DistrictCmoScreen> {
  double _districtPoolLakhs = 48.5;

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
            Text('DISTRICT CHIEF MEDICAL OFFICER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFFEDD7))),
            Text('District Health Command HQ · Ranchi District', style: TextStyle(fontSize: 10, color: Color(0xFFEA580C))),
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
            // District Contingency Pool Grant Card
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
                  const Text('DISTRICT CONTINGENCY GRANT POOL', style: TextStyle(color: Color(0xFFDC5000), fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('₹${_districtPoolLakhs.toStringAsFixed(1)} LAKHS', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.amberAccent)),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFEA580C),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        onPressed: () {
                          setState(() => _districtPoolLakhs -= 5.0);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('✅ ₹5.0 Lakhs Emergency Grant released to Sadar Hospital!')),
                          );
                        },
                        child: const Text('RELEASE ₹5L GRANT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Pending Cross-District Transfer Approvals
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
                  const Text('PENDING INTER-DISTRICT TRANSFERS (DIJKSTRA ROUTED)', style: TextStyle(color: Color(0xFFDC5000), fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _buildTransferCard(
                    patient: 'Sunil Karmakar (42y, CO Gas Poisoning)',
                    route: 'SNMMCH Dhanbad ➔ RIMS Ranchi Apex ICU',
                    reason: 'Requires Hyperbaric O2 / Specialized Pulmonology',
                    eta: '42 mins (NH-32 Green Wave)',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransferCard({required String patient, required String route, required String reason, required String eta}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF20140C),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.amber.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(patient, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: Colors.red.withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                child: const Text('P1 PRIORITY', style: TextStyle(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(route, style: const TextStyle(color: Color(0xFFEA580C), fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(reason, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('⏱ $eta', style: const TextStyle(color: Colors.tealAccent, fontSize: 10, fontWeight: FontWeight.bold)),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade800,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  minimumSize: const Size(0, 28),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('✅ Transfer Authorized! 108 ALS Ambulance Green Wave dispatched.')),
                  );
                },
                child: const Text('AUTHORIZE TRANSFER', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
