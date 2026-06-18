class VirtualCardModel {
  final String id;
  final bool isActive;
  final String numeroMasque;
  final String numeroComplet;
  final String dateExpiration;
  final String cvv;
  final String soldeDisponible;
  final String plafondActuel;

  VirtualCardModel({
    required this.id,
    required this.isActive,
    required this.numeroMasque,
    required this.numeroComplet,
    required this.dateExpiration,
    required this.cvv,
    required this.soldeDisponible,
    required this.plafondActuel,
  });

  factory VirtualCardModel.fromJson(Map<String, dynamic> json) {
    return VirtualCardModel(
      id: json['id'] ?? '',
      isActive: json['is_active'] ?? false,
      numeroMasque: json['numero_masque'] ?? '•••• •••• •••• ••••',
      numeroComplet: json['numero_complet'] ?? '',
      dateExpiration: json['date_expiration'] ?? '',
      cvv: json['cvv'] ?? '',
      soldeDisponible: json['solde_disponible'] ?? '0 FCFA',
      plafondActuel: json['plafond_actuel'] ?? '0 XAF',
    );
  }
}