import 'package:flutter/material.dart';
import 'withdraw_confirmation_page.dart';

class WithdrawDetailsPage extends StatefulWidget {
  final String methodName;
  const WithdrawDetailsPage({super.key, required this.methodName});

  @override
  State<WithdrawDetailsPage> createState() => _WithdrawDetailsPageState();
}

class _WithdrawDetailsPageState extends State<WithdrawDetailsPage> {
  final _amountController = TextEditingController();
  double _fees = 0.0;
  double _netAmount = 0.0;

  void _calculateWithdrawal(String text) {
    double? amount = double.tryParse(text);
    if (amount != null) {
      setState(() {
        _fees = amount * 0.01; // Simulation standard de 1% de frais de retrait
        _netAmount = amount - _fees;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: Text('Retrait via ${widget.methodName}')),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('Montant'),
                    TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      onChanged: _calculateWithdrawal,
                      decoration: _buildInputDecoration('30 000 FCFA'),
                    ),
                    const SizedBox(height: 20),
                    _buildLabel('Numéro ${widget.methodName.contains('MTN') ? 'MTN' : 'Orange'}'),
                    TextFormField(
                      keyboardType: TextInputType.phone,
                      decoration: _buildInputDecoration('+237 6 00 00 00 00'),
                    ),
                    const SizedBox(height: 24),
                    
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Frais', style: TextStyle(color: Color(0xFF64748B))),
                        Text('${_fees.toStringAsFixed(0)} FCFA', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Vous recevrez', style: TextStyle(color: Color(0xFF64748B))),
                        Text('${_netAmount.toStringAsFixed(0)} FCFA', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF4E4AF2))),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4E4AF2), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (context) => WithdrawConfirmationPage(methodName: widget.methodName, totalAmount: _amountController.text, netAmount: _netAmount.toStringAsFixed(0), fees: _fees.toStringAsFixed(0))));
                  },
                  child: const Text('Continuer', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) => Padding(padding: const EdgeInsets.only(bottom: 8.0), child: Text(text, style: const TextStyle(fontWeight: FontWeight.bold)));
  InputDecoration _buildInputDecoration(String hint) => InputDecoration(hintText: hint, filled: true, fillColor: const Color(0xFFF8F9FD), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))));
}