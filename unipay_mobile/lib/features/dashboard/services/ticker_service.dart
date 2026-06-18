import 'dart:convert';
import '../models/ticker_model.dart';

class TickerApiService {
  final String _endpoint = '/api/ticker/conversions'; 

  Future<TickerResponse> fetchTickerConversions(String utilisateurId) async {
    try {
      // 🛠️ On commente temporairement le délai pour forcer l'affichage immédiat
      // await Future.delayed(const Duration(milliseconds: 800)); 

      final Map<String, dynamic> mockJsonResponse = {
        "deviseLocale": "XAF",
        "montantDeBase": 1.0,
        "listeConversions": [
          {"deviseCible": "USD", "valeurConvertie": 0.0016, "texteAffichage": "1 XAF = 0.0016 USD"},
          {"deviseCible": "EUR", "valeurConvertie": 0.0015, "texteAffichage": "1 XAF = 0.0015 EUR"},
          {"deviseCible": "CAD", "valeurConvertie": 0.0022, "texteAffichage": "1 XAF = 0.0022 CAD"}
        ]
      };

      return TickerResponse.fromJson(mockJsonResponse);
    } catch (e) {
      throw Exception("Erreur lors de la récupération du ticker: $e");
    }
  }
}