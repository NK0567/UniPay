import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'

// Importations des modules applicatifs administratifs
import DashboardPage from './features/dashboard/pages/DashboardPage'
import GestionUtilisateursPage from './features/utilisateurs/pages/GestionUtilisateursPage'
import CommissionsPage from './features/commissions/pages/CommissionsPage'
import AgregateursPage from './features/agregateurs/pages/AgregateursPage'
import TresoreriePage from './features/tresorerie/pages/TresoreriePage'
import ParametresSystemePage from './features/configurationGlobal/pages/ParametresSystemePage' // 🆕 IMPORT DE LA NOUVELLE PAGE
import LoginPage from './features/auth/pages/LoginPage'

const UnauthorizedPage = () => <Box p={8} color="white">Accès Interdit - Rôle Admin Requis</Box>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Zone sous haute sécurité administrative */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <Flex minH="100vh" bg="unipay.900">
                <Sidebar />

                {/* Zone de contenu principale */}
                <Box flex="1" ml="260px" p={8} minH="100vh" color="white">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/utilisateurs" element={<GestionUtilisateursPage />} />
                    <Route path="/commissions" element={<CommissionsPage />} />
                    <Route path="/agregateurs" element={<AgregateursPage />} />
                    <Route path="/tresorerie" element={<TresoreriePage />} />
                    {/* 🆕 ROUTE AJOUTÉE POUR LE BLOC DE CONFIGURATION GRAPHISME & BRANDING */}
                    <Route path="/configuration" element={<ParametresSystemePage />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Box>
              </Flex>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;