import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import App from './App.jsx'
import theme from './config/theme.js' // 👈 Importation de ton thème personnalisé

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Force le mode sombre au premier chargement de la page */}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}> {/* 👈 Injection ici */}
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)