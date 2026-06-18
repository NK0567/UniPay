import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'withdraw_confirmation_page.dart';

class WithdrawDetailsPage extends StatefulWidget {
  final String methodName;
  final String? initialAmount; 

  const WithdrawDetailsPage({
    super.key, 
    required this.methodName, 
    this.initialAmount,
  });

  @override
  State<WithdrawDetailsPage> createState() => _WithdrawDetailsPageState();
}

class _WithdrawDetailsPageState extends State<WithdrawDetailsPage> {
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();
  double _fees = 0.0;
  double _netAmount = 0.0;
  bool _isSavingsWithdrawal = false; 

  @override
  void initState() {
    super.initState();
    
    if (widget.initialAmount != null && widget.initialAmount!.trim().isNotEmpty) {
      _isSavingsWithdrawal = true;
      
      // Extraction des chiffres uniquement
      String cleanAmount = widget.initialAmount!.replaceAll(RegExp(r'[^0-9]'), '');
      _amountController.text = cleanAmount;
      _calculateWithdrawal(cleanAmount);
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _calculateWithdrawal(String text) {
    String normalizedText = text.replaceAll(',', '.').replaceAll(' ', '');
    double? amount = double.tryParse(normalizedText);
    
    setState(() {
      if (amount != null) {
        _fees = amount * 0.01; 
        _netAmount = amount - _fees;
      } else {
        _fees = 0.0;
        _netAmount = 0.0;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text(
          _isSavingsWithdrawal ? 'Retrait d\'Épargne' : 'Retrait Classique', 
          style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold),
        ),
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.textColor, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            if (_isSavingsWithdrawal)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF4E4AF2).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.lock_clock, color: Color(0xFF4E4AF2), size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Fonds d\'épargne sécurisés. Le montant total est bloqué pour transfert.',
                        style: TextStyle(color: context.textColor, fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel(_isSavingsWithdrawal ? 'Somme totale à vider' : 'Montant à retirer'),
                    TextFormField(
                      controller: _amountController,
                      readOnly: _isSavingsWithdrawal, // 🔒 Bloqué automatiquement pour TOUTE épargne
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      onChanged: _calculateWithdrawal,
                      style: TextStyle(
                        color: _isSavingsWithdrawal ? context.secondaryTextColor : context.textColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                      decoration: _buildInputDecoration(
                        _isSavingsWithdrawal ? '' : 'Ex: 30 000',
                        suffixText: 'FCFA',
                        fillColor: _isSavingsWithdrawal ? context.borderColor.withOpacity(0.2) : context.surfaceColor,
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    _buildLabel('Numéro de réception ${widget.methodName.toUpperCase().contains('MTN') ? 'MTN' : 'Orange'}'),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: _buildInputDecoration('Ex: +237 6 00 00 00 00'),
                      style: TextStyle(color: context.textColor),
                    ),
                    const SizedBox(height: 28),
                    
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Frais de traitement (1%)', style: TextStyle(color: context.secondaryTextColor)),
                        Text('${_fees.toStringAsFixed(0)} FCFA', style: TextStyle(fontWeight: FontWeight.bold, color: context.textColor)),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Montant net qui sera versé', style: TextStyle(color: context.secondaryTextColor)),
                        Text(
                          '${_netAmount.toStringAsFixed(0)} FCFA', 
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF4E4AF2)),
                        ),
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
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor, 
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  onPressed: () {
                    if (_amountController.text.trim().isEmpty || _phoneController.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Veuillez remplir tous les champs obligatoires')),
                      );
                      return;
                    }

                    Navigator.push(
                      context, 
                      MaterialPageRoute(
                        builder: (context) => WithdrawConfirmationPage(
                          methodName: widget.methodName, 
                          totalAmount: _amountController.text, 
                          netAmount: _netAmount.toStringAsFixed(0), 
                          fees: _fees.toStringAsFixed(0),
                          isSavings: _isSavingsWithdrawal,
                        ),
                      ),
                    );
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

  Widget _buildLabel(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8.0), 
        child: Text(text, style: TextStyle(fontWeight: FontWeight.bold, color: context.textColor)),
      );

  InputDecoration _buildInputDecoration(String hint, {String? suffixText, Color? fillColor}) => InputDecoration(
        hintText: hint, 
        hintStyle: TextStyle(color: context.secondaryTextColor.withOpacity(0.6)),
        filled: true, 
        fillColor: fillColor ?? context.surfaceColor, 
        suffixText: suffixText,
        suffixStyle: TextStyle(color: context.textColor, fontWeight: FontWeight.bold),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.primaryColor, width: 1.5)),
      );
}