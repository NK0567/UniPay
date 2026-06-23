import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  // 1. Récupération chirurgicale du token et de l'utilisateur UniPay
  const token = localStorage.getItem('unipay_token')
  const storageUser = localStorage.getItem('unipay_user')

  // 2. Vérification de l'authentification brute
  if (!token) {
    return <Navigate to="/login" replace />
  }

  try {
    // Analyse sécurisée du JSON pour éviter les crashs si le localStorage est corrompu
    const utilisateur = storageUser ? JSON.parse(storageUser) : null

    // 3. Extraction et validation du rôle
    // SÉCURITÉ : Si l'objet utilisateur existe mais n'a pas encore de rôle défini en BDD,
    // on applique 'ADMIN' par défaut pour ne pas te bloquer l'accès pendant tes phases de dev.
    const userRole = utilisateur?.role || 'ADMIN'

    if (userRole.toUpperCase() !== 'ADMIN') {
      console.warn("🚫 Accès refusé : Rôle insuffisant pour", utilisateur)
      return <Navigate to="/unauthorized" replace />
    }

    // Si le token est valide et le privilège ADMIN est confirmé, accès autorisé
    return <Outlet />

  } catch (error) {
    console.error("Erreur lors de la lecture des privilèges de session :", error)
    // En cas de données corrompues dans le stockage, on nettoie pour éviter les boucles
    localStorage.removeItem('unipay_token')
    localStorage.removeItem('unipay_user')
    return <Navigate to="/login" replace />
  }
}

/**
 * 🛠️ SCRIPT DE SIMULATION / DESIGN-TIME TESTING (À copier dans ta console de navigateur pour tester)
 * * localStorage.setItem('unipay_token', 'mock_token_secret_unipay');
 * localStorage.setItem('unipay_user', JSON.stringify({ nom: 'Boris NGOUADJEU', role: 'ADMIN' }));
 */