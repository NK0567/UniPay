# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# structure des dossiers
src/
├── assets/                  # Logos (UniPay), images et illustrations
├── components/              # Composants globaux et partagés
│   ├── Sidebar.jsx          # Barre de navigation latérale (Tour de contrôle)
│   ├── Navbar.jsx           # Barre supérieure (Profil Admin, alertes)
│   ├── StatCard.jsx         # Carte générique pour afficher les KPI (Masse monétaire, etc.)
│   └── DataTable.jsx        # Tableau générique stylisé avec Chakra UI
├── config/                  # Configurations globales
│   ├── theme.js             # Personnalisation du thème Chakra UI (Couleurs foncées, etc.)
│   └── constants.js         # URL de l'API, clés de configuration
├── context/                 # États globaux de l'application React
│   └── AdminAuthContext.jsx # Gestion de la session de l'admin connecté
├── features/                # 🚀 LE CŒUR DE L'APPLICATION (Découpé par route API)
│   ├── dashboard/
│   │   ├── components/      # Graphiques (PieChart, LineChart) spécifiques au dashboard
│   │   └── pages/
│   │       └── DashboardPage.jsx # Ta vue 360° (Cards globales, santé du réseau)
│   ├── utilisateurs/
│   │   ├── components/      # Boutons d'action KYC, filtres de recherche
│   │   └── pages/
│   │       ├── UsersListPage.jsx # Liste complète, suspension/activation
│   │       └── UserDetailPage.jsx # Consultation profil et solde à la trace
│   │       └── GestionUtilisateursPage.jsx
│   ├── commissions/
│   │   ├── components/      # Sliders et formulaires de tarification volante
│   │   └── pages/
│   │       └── CommissionsPage.jsx # Pilotage des frais système et commissions
│   ├── agregateurs/
│   │   ├── components/      # Cartes individuelles pour chaque partenaire
│   │   └── pages/
│   │       └── AgregateursPage.jsx # Activation/Coupure des passerelles (MTN, Orange...)
│   └── tresorerie/
│       └── pages/
│           └── TresoreriePage.jsx # Clôture journalière et récupération des fonds du coffre
├── routes/                  # Gestion de la navigation
│   └── AppRoutes.jsx        # Définition de toutes les routes de l'application
├── services/                # Connexion directe avec tes contrôleurs Node.js
│   └── api.js               # Configuration Axios ou Fetch centrale (Injecte le token admin)
├── App.jsx                  # Composant racine qui assemble les routes
└── main.jsx                 # Point d'entrée de l'application avec le ChakraProvider