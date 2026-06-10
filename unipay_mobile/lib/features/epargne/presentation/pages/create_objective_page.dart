import 'package:flutter/material.dart';

class CreateObjectivePage extends StatefulWidget {
  const CreateObjectivePage({super.key});

  @override
  State<CreateObjectivePage> createState() => _CreateObjectivePageState();
}

class _CreateObjectivePageState extends State<CreateObjectivePage> {
  String _savingsType = "Légère"; // Légère ou Stricte

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Nouvel objectif')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Nom de l\'objectif', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _buildTextField('Ex: Nouvelle voiture'),
            const SizedBox(height: 20),
            
            const Text('Montant cible', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _buildTextField('2 000 000 FCFA'),
            const SizedBox(height: 20),

            const Text('Type d\'épargne', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            
            // 🔘 Sélecteur de type (Légère vs Stricte)
                Row(
              children: [
                _buildTypeOption("Légère", Icons.edit),
                const SizedBox(width: 16),
                _buildTypeOption("Stricte", Icons.lock),
              ],
            ),
            
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4E4AF2), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Créer l\'objectif', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeOption(String type, IconData icon) {
    bool isSelected = _savingsType == type;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _savingsType = type),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF4E4AF2) : const Color(0xFFF8F9FD),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? const Color(0xFF4E4AF2) : const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.white : const Color(0xFF64748B)),
              const SizedBox(height: 8),
              Text(type, style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF1E293B), fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String hint) {
    return TextFormField(
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: const Color(0xFFF8F9FD),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }
}