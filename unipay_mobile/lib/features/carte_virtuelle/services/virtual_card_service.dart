import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/virtual_card_model.dart';

class VirtualCardService {
  final String baseUrl = "https://ton-api-node-js.com"; // À changer plus tard

  Future<VirtualCardModel?> fetchCardStatusFromNode(String userId) async {
    try {
      // 🌐 Dès que ton API Node.js est en ligne, décommente ces lignes :
      /*
      final response = await http.get(Uri.parse('$baseUrl/api/cards/status/$userId'));
      if (response.statusCode == 200) {
        return VirtualCardModel.fromJson(jsonDecode(response.body));
      }
      return null;
      */
      
      // 🧪 En attendant, simulation locale ultra-propre (Mock) :
      await Future.delayed(const Duration(milliseconds: 800));
      
      bool simulationUtilisateurAUnCarte = true; // Passe à false pour tester l'écran de création
      
      if (simulationUtilisateurAUnCarte) {
        return VirtualCardModel(
          id: "CARD_UNI_4587",
          isActive: true,
          numeroMasque: "••••  ••••  ••••  4587",
          numeroComplet: "4587 1293 8475 4587",
          dateExpiration: "12/28",
          cvv: "123",
          soldeDisponible: "125 750 FCFA",
          plafondActuel: "50 000 XAF",
        );
      }
      return null;
    } catch (e) {
      throw Exception("Impossible de joindre le serveur UniPay: $e");
    }
  }
}