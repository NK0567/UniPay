class TickerResponse {
  final String deviseLocale;
  final double montantDeBase;
  final List<TickerConversion> listeConversions;

  TickerResponse({
    required this.deviseLocale,
    required this.montantDeBase,
    required this.listeConversions,
  });

  factory TickerResponse.fromJson(Map<String, dynamic> json) {
    return TickerResponse(
      deviseLocale: json['deviseLocale'] ?? '',
      montantDeBase: (json['montantDeBase'] as num?)?.toDouble() ?? 1.0,
      listeConversions: (json['listeConversions'] as List?)
              ?.map((item) => TickerConversion.fromJson(item))
              .toList() ?? [],
    );
  }
}

class TickerConversion {
  final String deviseCible;
  final double valeurConvertie;
  final String texteAffichage;

  TickerConversion({
    required this.deviseCible,
    required this.valeurConvertie,
    required this.texteAffichage,
  });

  factory TickerConversion.fromJson(Map<String, dynamic> json) {
    return TickerConversion(
      deviseCible: json['deviseCible'] ?? '',
      valeurConvertie: (json['valeurConvertie'] as num?)?.toDouble() ?? 0.0,
      texteAffichage: json['texteAffichage'] ?? '',
    );
  }
}