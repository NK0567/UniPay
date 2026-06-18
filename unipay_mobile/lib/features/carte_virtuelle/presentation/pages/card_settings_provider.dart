import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/virtual_card_model.dart';   
import '../../services/virtual_card_service.dart'; 

class CardSettingsProvider extends ChangeNotifier {
  // 🔌 Connexion au service réseau propre
  final VirtualCardService _cardService = VirtualCardService();

  // 🔒 États internes (privés) - Conservés durant toute la session
  bool _hasCard = false; 
  bool _isFrozen = false;
  bool _requirePinForWeb = false;
  bool _allowInternational = true;
  bool _allowOnline = true;
  bool _notifyOnSpend = true;
  bool _isLoading = false;
  VirtualCardModel? _carteActive; // 👈 Utilise désormais le vrai modèle

  // 🔓 Getters publics pour l'UI (lus via context.watch)
  bool get hasCard => _hasCard;
  bool get isFrozen => _isFrozen;
  bool get requirePinForWeb => _requirePinForWeb;
  bool get allowInternational => _allowInternational;
  bool get allowOnline => _allowOnline;
  bool get notifyOnSpend => _notifyOnSpend;
  bool get isLoading => _isLoading;
  VirtualCardModel? get carteActive => _carteActive; // 👈 Renvoie le vrai modèle

  // 🔄 Au démarrage, on vérifie l'état de la carte sur le service
  CardSettingsProvider() {
    verifierStatutCarteAuDemarrage();
  }

  /// 🌐 Récupération automatique du statut de la carte
  Future<void> verifierStatutCarteAuDemarrage() async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. On tente d'abord de récupérer les données réelles du serveur Node.js
      final carteFromServer = await _cardService.fetchCardStatusFromNode("USER_ID_PROVISOIRE");
      
      if (carteFromServer != null && carteFromServer.isActive) {
        _carteActive = carteFromServer;
        _hasCard = true; 
      } else {
        // 2. 🔀 SYNC LOCAL : Si le backend renvoie null/rien (phase de dev), 
        // on vérifie si une carte locale existe dans les SharedPreferences du téléphone.
        final SharedPreferences prefs = await SharedPreferences.getInstance();
        final bool internalHasCard = prefs.getBool('unipay_has_virtual_card') ?? false;

        if (internalHasCard) {
          _carteActive = VirtualCardModel(
            id: "CARD_UNI_4587",
            isActive: true,
            numeroMasque: "••••  ••••  ••••  4587",
            numeroComplet: "4587 1293 8475 4587",
            dateExpiration: "12/28",
            cvv: "123",
            soldeDisponible: "125 750 FCFA",
            plafondActuel: prefs.getString('unipay_card_plafond') ?? "50 000 XAF",
          );
          _hasCard = true;
        } else {
          _hasCard = false;
          _carteActive = null;
        }
      }
    } catch (e) {
      debugPrint("Erreur récupération statut carte : $e");
      _hasCard = false;
    } finally {
      _isLoading = false;
      notifyListeners(); 
    }
  }

  /// 💳 Commande d'une nouvelle carte
  Future<void> commanderNouvelleCarte() async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 1500));

    // 💾 Sauvegarde locale de l'état d'activation
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool('unipay_has_virtual_card', true);
    await prefs.setString('unipay_card_plafond', "50 000 XAF");

    // Instanciation du vrai modèle après achat
    _carteActive = VirtualCardModel(
      id: "CARD_UNI_4587",
      isActive: true,
      numeroMasque: "••••  ••••  ••••  4587",
      numeroComplet: "4587 1293 8475 4587",
      dateExpiration: "12/28",
      cvv: "123",
      soldeDisponible: "125 750 FCFA",
      plafondActuel: "50 000 XAF",
    );

    _hasCard = true; 
    _isLoading = false;
    notifyListeners();
  }

  /// ❄️ Action pour Geler / Dégeler la carte (Inchangé)
  Future<void> toggleFreezeCard(bool value) async {
    _isFrozen = value;
    notifyListeners(); 

    try {
      // Plus tard : await _cardService.updateFreezeStatus(value);
    } catch (e) {
      _isFrozen = !value;
      notifyListeners();
      rethrow; 
    }
  }

  /// 🛠️ 1. Basculer la double authentification (Inchangé)
  Future<void> toggleRequirePinForWeb(bool value) async {
    _requirePinForWeb = value;
    notifyListeners(); 

    try {
      // Plus tard : await _cardService.updateSecurity(value);
    } catch (e) {
      _requirePinForWeb = !value;
      notifyListeners();
      rethrow; 
    }
  }

  /// 🌍 2. Basculer les paiements internationaux (Inchangé)
  Future<void> toggleInternational(bool value) async {
    _allowInternational = value;
    notifyListeners();

    try {
      // Plus tard : await _cardService.updateInternational(value);
    } catch (e) {
      _allowInternational = !value;
      notifyListeners();
      rethrow;
    }
  }

  /// 🛒 3. Basculer les achats en ligne (Inchangé)
  Future<void> toggleOnline(bool value) async {
    _allowOnline = value;
    notifyListeners();

    try {
      // Plus tard : await _cardService.updateOnline(value);
    } catch (e) {
      _allowOnline = !value;
      notifyListeners();
      rethrow;
    }
  }

  /// 🔔 4. Basculer les notifications de dépenses (Inchangé)
  Future<void> toggleNotifyOnSpend(bool value) async {
    _notifyOnSpend = value;
    notifyListeners();

    try {
      // Plus tard : await _cardService.updateNotifications(value);
    } catch (e) {
      _notifyOnSpend = !value;
      notifyListeners();
      rethrow;
    }
  }

  /// 🎛️ Mettre à jour le texte du plafond dynamiquement depuis le modal
  void modifierPlafondDansLeProvider(String nouveauPlafond) async {
    if (_carteActive != null) {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString('unipay_card_plafond', "$nouveauPlafond XAF");

      _carteActive = VirtualCardModel(
        id: _carteActive!.id,
        isActive: _carteActive!.isActive,
        numeroMasque: _carteActive!.numeroMasque,
        numeroComplet: _carteActive!.numeroComplet,
        dateExpiration: _carteActive!.dateExpiration,
        cvv: _carteActive!.cvv,
        soldeDisponible: _carteActive!.soldeDisponible,
        plafondActuel: "$nouveauPlafond XAF", // Modification dynamique ici
      );
      notifyListeners();
    }
  }

  /// 🚨 5. Supprimer définitivement la carte virtuelle
  Future<bool> deleteCard() async {
    _isLoading = true;
    notifyListeners();

    try {
      // 💾 On remet la mémoire locale à false lors de la suppression
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setBool('unipay_has_virtual_card', false);
      await prefs.remove('unipay_card_plafond');

      _hasCard = false; 
      _carteActive = null;
      _isLoading = false;
      notifyListeners();
      return true; 
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false; 
    }
  }
}