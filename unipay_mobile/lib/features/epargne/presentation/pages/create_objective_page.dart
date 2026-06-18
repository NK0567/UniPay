import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';

class CreateObjectivePage extends StatefulWidget {
  const CreateObjectivePage({super.key});

  @override
  State<CreateObjectivePage> createState() => _CreateObjectivePageState();
}

class _CreateObjectivePageState extends State<CreateObjectivePage> {
  String _savingsType = "Légère"; 

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: const Text('Nouvel objectif'),
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.textColor, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Nom de l\'objectif', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _buildTextField(context, 'Ex: Nouvelle voiture', _nameController, TextInputType.text),
            const SizedBox(height: 20),
            
            const Text('Montant cible', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _buildTextField(context, '2000000', _amountController, TextInputType.number),
            const SizedBox(height: 20),

            const Text('Type d\'épargne', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            
            Row(
              children: [
                _buildTypeOption(context, "Légère", Icons.edit),
                const SizedBox(width: 16),
                _buildTypeOption(context, "Stricte", Icons.lock),
              ],
            ),
            
            const Spacer(),
            
            Center(
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    if (_nameController.text.trim().isEmpty || _amountController.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Veuillez remplir tous les champs')),
                      );
                      return;
                    }

                    // Structure de données propre pour éviter les crashs de type
                    final newObjective = {
                      'name': _nameController.text.trim(),
                      'targetAmount': double.tryParse(_amountController.text.trim().replaceAll(' ', '')) ?? 0.0,
                      'type': _savingsType,
                      'currentAmount': 0.0,
                    };

                    Navigator.pop(context, newObjective);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor, 
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'Créer l\'objectif', 
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeOption(BuildContext context, String type, IconData icon) {
    bool isSelected = _savingsType == type;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _savingsType = type),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? context.primaryColor : context.surfaceColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? const Color(0xFF4E4AF2) : context.borderColor),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.white : context.secondaryTextColor),
              const SizedBox(height: 8),
              Text(type, style: TextStyle(color: isSelected ? Colors.white : context.textColor, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(BuildContext context, String hint, TextEditingController controller, TextInputType type) {
    return TextFormField(
      controller: controller,
      keyboardType: type,
      style: TextStyle(color: context.textColor),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: context.secondaryTextColor.withOpacity(0.5)),
        filled: true,
        fillColor: context.surfaceColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
      ),
    );
  }
}