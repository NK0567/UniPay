import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  // États locaux des boutons de contrôle (Prêts à stocker via SharedPreferences ou API)
  bool _transactionsEnabled = true;
  bool _paymentsEnabled = true;
  bool _savingsEnabled = true;
  bool _promotionsEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Paramètres',
          style: TextStyle(color: context.textColor, fontWeight: FontWeight.w900, fontSize: 20),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '3S. NOTIFICATIONS',
                style: TextStyle(
                  color: context.textColor,
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 20),
              
              // Boîtier conteneur comme sur le croquis de la maquette
              Container(
                padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: context.borderColor),
                ),
                child: Column(
                  children: [
                    _buildSettingsSwitch(
                      label: 'Transactions',
                      value: _transactionsEnabled,
                      onChanged: (val) => setState(() => _transactionsEnabled = val),
                    ),
                     Divider(color: context.borderColor),
                    _buildSettingsSwitch(
                      label: 'Paiements',
                      value: _paymentsEnabled,
                      onChanged: (val) => setState(() => _paymentsEnabled = val),
                    ),
                     Divider(color: context.borderColor),
                    _buildSettingsSwitch(
                      label: 'Épargne',
                      value: _savingsEnabled,
                      onChanged: (val) => setState(() => _savingsEnabled = val),
                    ),
                     Divider(color: context.borderColor),
                    _buildSettingsSwitch(
                      label: 'Promotions',
                      value: _promotionsEnabled,
                      onChanged: (val) => setState(() => _promotionsEnabled = val),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Helper pour générer uniformément chaque option Switch
  Widget _buildSettingsSwitch({
    required String label,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: context.textColor,
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: Colors.white,
            activeTrackColor: context.primaryColor, // Couleur violette UniPay
            inactiveTrackColor: context.borderColor,
            inactiveThumbColor: Colors.white,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
        ],
      ),
    );
  }
}
