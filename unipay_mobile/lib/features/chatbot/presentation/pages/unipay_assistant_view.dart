import 'package:flutter/material.dart';

class UniPayAssistantView extends StatefulWidget {
  const UniPayAssistantView({super.key});

  @override
  State<UniPayAssistantView> createState() => _UniPayAssistantViewState();
}

class _UniPayAssistantViewState extends State<UniPayAssistantView> {
  final TextEditingController _messageController = TextEditingController();

  // Simulation des données de la maquette
  final List<Map<String, dynamic>> _messages = [
    {
      "isUser": false,
      "text": "Bonjour Jean 👋\nComment puis-je vous aider aujourd'hui ?",
      "time": "10:30"
    },
    {
      "isUser": true,
      "text": "Quel est mon solde ?",
      "time": "10:30"
    },
    {
      "isUser": false,
      "text": "Votre solde disponible est de 425 000 XAF.",
      "time": "10:30"
    },
    {
      "isUser": true,
      "text": "Envoie 10 000 FCFA à ce lien https://unipay.app/pay/KH782K",
      "time": "10:31"
    },
    {
      "isUser": false,
      "text": "Paiement effectué avec succès ✅\n10 000 XAF ont été envoyés.\nRéférence: TRX4587HBG",
      "time": "10:31"
    },
  ];

  @override
  Widget build(BuildContext context) {
    const chatDarkBg = Color(0xFF0F172A); // Fond bleu nuit/sombre de la maquette
    const botBubbleColor = Color(0xFF1E293B); // Bulles du bot
    const userBubbleColor = Color(0xFF2563EB); // Bulles bleues de l'utilisateur
    const inputBgColor = Color(0xFF1E293B);

    return Scaffold(
      backgroundColor: chatDarkBg,
      appBar: AppBar(
        backgroundColor: chatDarkBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.blue.shade100,
                  radius: 18,
                  child: const Icon(Icons.smart_toy_rounded, color: Color(0xFF3B36DB), size: 20),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(color: chatDarkBg, width: 1.5),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'UniPay Assistant',
                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                Text(
                  'En ligne',
                  style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.w400),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white70, size: 20),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert, color: Colors.white70),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Liste des messages
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg["isUser"] as bool;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Row(
                    mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!isUser) ...[
                        CircleAvatar(
                          backgroundColor: botBubbleColor,
                          radius: 14,
                          child: const Icon(Icons.smart_toy_outlined, color: Colors.blue, size: 14),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isUser ? userBubbleColor : botBubbleColor,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(16),
                              topRight: const Radius.circular(16),
                              bottomLeft: Radius.circular(isUser ? 16 : 4),
                              bottomRight: Radius.circular(isUser ? 4 : 16),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                msg["text"],
                                style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
                              ),
                              const SizedBox(height: 6),
                              Align(
                                alignment: Alignment.bottomRight,
                                child: Text(
                                  msg["time"],
                                  style: const TextStyle(color: Colors.white38, fontSize: 10),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // Barre de saisie (Input) en bas de page
          Container(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24, top: 10),
            color: chatDarkBg,
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: inputBgColor,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: TextField(
                      controller: _messageController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: "Écrire un message...",
                        hintStyle: TextStyle(color: Colors.white38, fontSize: 14),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                // Bouton d'envoi bleu
                GestureDetector(
                  onTap: () {
                    if (_messageController.text.trim().isNotEmpty) {
                      setState(() {
                        _messages.add({
                          "isUser": true,
                          "text": _messageController.text,
                          "time": "${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}"
                        });
                        _messageController.clear();
                      });
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Color(0xFF2563EB),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}