import 'package:flutter/material.dart';
import 'pay_confirmation_page.dart';

class PayAmountPage extends StatefulWidget {
  final bool isMerchant;
  final String? initialAmount;

  const PayAmountPage({
    super.key, 
    this.isMerchant = false, 
    this.initialAmount,
  });

  @override
  State<PayAmountPage> createState() => _PayAmountPageState();
}

class _PayAmountPageState extends State<PayAmountPage> {
  final _amountController = TextEditingController();
  
  // Variables d'état dynamiques (Logique UniPay)
  double userBalanceXAF = 125750.0;
  double exchangeRate = 612.50; // 1 USD = 612.50 XAF
  double uniPaySpread = 0.008;  // 0.8% inclus ou appliqué
  double transactionFeeUSD = 2.50;

  double amountEnteredUSD = 0.0;
  double amountToReceiveXAF = 0.0;
  double totalDebitedUSD = 0.0;
  bool hasEnoughBalance = true;

  @override
  void initState() {
    super.initState();
    // Logique UniPay Marchand : Si le lien est prérempli, on applique le montant et on calcule d'entrée
    if (widget.isMerchant && widget.initialAmount != null) {
      _amountController.text = widget.initialAmount!;
      _calculateConversion(widget.initialAmount!);
    }
  }

  void _calculateConversion(String text) {
    if (text.isEmpty) {
      setState(() {
        amountEnteredUSD = 0.0;
        amountToReceiveXAF = 0.0;
        totalDebitedUSD = 0.0;
        hasEnoughBalance = true;
      });
      return;
    }

    double? enteredValue = double.tryParse(text);
    if (enteredValue != null) {
      setState(() {
        amountEnteredUSD = enteredValue;
        // Le bénéficiaire reçoit la valeur convertie en XAF
        amountToReceiveXAF = amountEnteredUSD * exchangeRate;
        // Total débité du portefeuille USD du payeur (Montant + Frais)
        totalDebitedUSD = amountEnteredUSD + transactionFeeUSD;
        
        // Vérification dynamique du solde (en convertissant le total requis en XAF pour le test)
        double totalRequiredXAF = totalDebitedUSD * exchangeRate;
        hasEnoughBalance = totalRequiredXAF <= userBalanceXAF;
      });
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.isMerchant ? 'Paiement Marchand' : 'Payer via UniPay', 
          style: const TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ℹ️ Infos du contexte de paiement contextuel selon le type de lien
              Text(
                widget.isMerchant
                    ? 'Ce commerçant a défini un montant fixe pour régler cette facture via le réseau UniPay.'
                    : 'Entrez le montant de votre paiement. UniPay s\'occupe de la conversion instantanée.',
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 24),

              // 💳 Statut du Solde Principal
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FD),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Votre solde disponible', style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
                    Text(
                      '125 750 XAF',
                      style: TextStyle(
                        color: hasEnoughBalance ? const Color(0xFF1E293B) : Colors.red,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 📤 Bloc Saisie (Devise Source : USD)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Vous envoyez', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
                  if (widget.isMerchant)
                    const Text('🔒 Montant bloqué', style: TextStyle(color: Color(0xFF4E4AF2), fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _amountController,
                readOnly: widget.isMerchant, // Bloque la modification si c'est un lien marchand
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                onChanged: _calculateConversion,
                style: TextStyle(
                  color: widget.isMerchant ? const Color(0xFF64748B) : Colors.black, 
                  fontSize: 22, 
                  fontWeight: FontWeight.bold
                ),
                decoration: InputDecoration(
                  hintText: '0.00',
                  filled: true,
                  fillColor: widget.isMerchant ? const Color(0xFFF1F5F9) : const Color(0xFFF8F9FD),
                  prefixIcon: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('🇺🇸 USD', style: TextStyle(fontSize: 18, height: 1.5)),
                  ),
                  prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12), 
                    borderSide: BorderSide(color: widget.isMerchant ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12), 
                    borderSide: BorderSide(color: widget.isMerchant ? const Color(0xFFCBD5E1) : const Color(0xFF4E4AF2), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // 📥 Bloc Réception Dynamique (Devise Cible : XAF)
              const Text('Le bénéficiaire recevra', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Text('🇨🇲 XAF', style: TextStyle(fontSize: 18)),
                        const SizedBox(width: 8),
                        Text(
                          amountToReceiveXAF.toStringAsFixed(0),
                          style: const TextStyle(color: Color(0xFF1E293B), fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const Text('Fixé par le taux', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 📊 Widget de Cotation & Spreads de la Fintech UniPay
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFEEEDFD).withOpacity(0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    _buildLiveInfoRow('Taux de change', '1 USD = $exchangeRate XAF'),
                    const SizedBox(height: 8),
                    _buildLiveInfoRow('Frais de transaction', '${transactionFeeUSD.toStringAsFixed(2)} USD'),
                    const SizedBox(height: 8),
                    _buildLiveInfoRow('Spread UniPay', '${(uniPaySpread * 100).toStringAsFixed(1)}% (Inclus)'),
                    const Divider(color: Color(0xFFE2E8F0), height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total débité estimé', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
                        Text(
                          '${totalDebitedUSD.toStringAsFixed(2)} USD',
                          style: const TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 30),

              // Alerte Solde Insuffisant dynamique
              if (!hasEnoughBalance)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(8)),
                  child: const Text(
                    '⚠️ Solde XAF insuffisant pour couvrir cette conversion et les frais.',
                    style: TextStyle(color: Color(0xFFDC2626), fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ),

              // 🚀 Bouton intelligent
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: (amountEnteredUSD > 0 && hasEnoughBalance)
                      ? () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => PayConfirmationPage(
                                amountUSD: amountEnteredUSD.toStringAsFixed(2),
                                amountXAF: amountToReceiveXAF.toStringAsFixed(0),
                                feesUSD: transactionFeeUSD.toStringAsFixed(2),
                                totalUSD: totalDebitedUSD.toStringAsFixed(2),
                              ),
                            ),
                          );
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4E4AF2),
                    disabledBackgroundColor: const Color(0xFFCBD5E1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text('Continuer', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLiveInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
        Text(value, style: const TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.w600, fontSize: 13)),
      ],
    );
  }
}