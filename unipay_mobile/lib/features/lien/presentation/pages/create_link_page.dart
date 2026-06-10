import 'package:flutter/material.dart';
import 'link_shared_page.dart';

enum LinkType { simple, merchant }

class CreateLinkPage extends StatefulWidget {
  const CreateLinkPage({super.key});

  @override
  State<CreateLinkPage> createState() => _CreateLinkPageState();
}

class _CreateLinkPageState extends State<CreateLinkPage> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();

  LinkType _selectedLinkType = LinkType.simple;
  String _selectedCurrency = 'XAF';
  String _selectedExpiration = '7 jours';

  final List<String> _currencies = ['XAF', 'USD', 'EUR', 'CAD'];
  final List<String> _expirationOptions = ['24 heures', '3 jours', '7 jours', '30 jours', 'Jamais'];

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
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
        title: const Text('Recevoir de l\'argent', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Générez un lien de paiement unique pour recevoir des fonds instantanément depuis n\'importe où.',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 14, height: 1.4),
                ),
                const SizedBox(height: 24),

                // 🎛️ Sélecteur de type de lien (Logique UniPay)
                const Text('Type de lien de paiement', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 10),
                LayoutBuilder(
                  builder: (context, constraints) => ToggleButtons(
                    direction: Axis.horizontal,
                    borderRadius: BorderRadius.circular(12),
                    selectedBorderColor: const Color(0xFF4E4AF2),
                    selectedColor: Colors.white,
                    fillColor: const Color(0xFF4E4AF2),
                    color: const Color(0xFF64748B),
                    constraints: BoxConstraints.expand(width: (constraints.maxWidth - 4) / 2, height: 48),
                    isSelected: [_selectedLinkType == LinkType.simple, _selectedLinkType == LinkType.merchant],
                    onPressed: (int index) {
                      setState(() {
                        _selectedLinkType = index == 0 ? LinkType.simple : LinkType.merchant;
                        if (_selectedLinkType == LinkType.simple) {
                          _amountController.clear(); // Optionnel pour le lien simple
                        }
                      });
                    },
                    children: const [
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text('Lien Simple\n(Montant libre)', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text('Lien Marchand\n(Montant fixe)', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 💵 Champ Montant (Conditionnel et Dynamique)
                Row(
                  children: [
                    Text(
                      _selectedLinkType == LinkType.merchant ? 'Montant obligatoire' : 'Montant (optionnel)',
                      style: const TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    if (_selectedLinkType == LinkType.merchant)
                      const Text(' *', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (_selectedLinkType == LinkType.merchant && (value == null || value.trim().isEmpty)) {
                      return 'Veuillez définir un montant pour un lien marchand.';
                    }
                    return null;
                  },
                  style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold),
                  decoration: InputDecoration(
                    hintText: _selectedLinkType == LinkType.merchant ? 'Entrez le montant fixe' : 'Laisser vide pour montant libre',
                    hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14, fontWeight: FontWeight.normal),
                    filled: true,
                    fillColor: const Color(0xFFF8F9FD),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4E4AF2), width: 1.5)),
                    errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red, width: 1)),
                    focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red, width: 1.5)),
                  ),
                ),
                const SizedBox(height: 20),

                // 💱 Choix de la Devise de Réception
                const Text('Devise cible', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedCurrency,
                  dropdownColor: Colors.white,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFFF8F9FD),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                  ),
                  items: _currencies.map((String currency) {
                    return DropdownMenuItem<String>(
                      value: currency,
                      child: Text(currency, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                    );
                  }).toList(),
                  onChanged: (String? newValue) {
                    if (newValue != null) setState(() => _selectedCurrency = newValue);
                  },
                ),
                const SizedBox(height: 20),

                // 📝 Description / Motif du paiement
                const Text('Description ou Référence client', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _descriptionController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'Ex: Facture prestation Dev - Alpha sarl',
                    hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                    filled: true,
                    fillColor: const Color(0xFFF8F9FD),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4E4AF2), width: 1.5)),
                  ),
                ),
                const SizedBox(height: 20),

                // ⏳ Expiration du lien
                const Text('Expiration du lien', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedExpiration,
                  dropdownColor: Colors.white,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFFF8F9FD),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                  ),
                  items: _expirationOptions.map((String option) {
                    return DropdownMenuItem<String>(
                      value: option,
                      child: Text(option, style: const TextStyle(color: Color(0xFF1E293B))),
                    );
                  }).toList(),
                  onChanged: (String? newValue) {
                    if (newValue != null) setState(() => _selectedExpiration = newValue);
                  },
                ),
                const SizedBox(height: 32),

                // 🚀 Bouton Générer le lien
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // Génération d'un token fictif pour la démo de l'URL UniPay
                        final String randomToken = DateTime.now().millisecondsSinceEpoch.toString().substring(7);
                        final String generatedUrl = 'https://unipay.cm/pay/lnk-$randomToken';

                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => LinkSharedPage(
                              linkUrl: generatedUrl,
                              linkType: _selectedLinkType,
                              fixedAmount: _amountController.text.trim(),
                              currency: _selectedCurrency,
                            ),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4E4AF2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Text('Créer le lien de paiement', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}