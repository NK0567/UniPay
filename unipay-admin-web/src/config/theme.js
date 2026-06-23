import { extendTheme } from '@chakra-ui/react'

// 1. Définition de la charte graphique UniPay (Variations de Bleu/Violet et Noir Premium)
const colors = {
  unipay: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#4f46e5', // Couleur principale (Boutons actifs, accents)
    600: '#4338ca',
    700: '#3730a3',
    800: '#1e1b4b', // Arrière-plan des éléments comme la Sidebar
    900: '#0f0e26', // Arrière-plan général de l'application (Super Dark)
  },
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  }
}

// 2. Configuration du mode sombre natif
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

// 3. Unification complète du thème et des animations de composants
const theme = extendTheme({
  config,
  colors,
  styles: {
    global: () => ({
      body: {
        bg: 'unipay.900', // Fond de l'application ultra sombre
        color: 'whiteAlpha.900',
        fontFamily: "'Inter', sans-serif",
      },
    }),
  },
  components: {
    // Personnalisation des conteneurs de cartes (Glassmorphism + Animations au survol)
    Card: {
      baseStyle: {
        container: {
          bg: 'unipay.800',
          borderWidth: '1px',
          borderColor: 'whiteAlpha.100',
          borderRadius: 'xl',
          shadow: 'xl',
          transition: 'all 0.25s ease-in-out', // Animation fluide
          _hover: {
            transform: 'translateY(-4px)', // La carte s'élève légèrement
            borderColor: 'unipay.400',       // La bordure s'illumine en violet
            shadow: '2xl',
          },
        },
      },
    },
    // Personnalisation des boutons avec retours tactiles au clic
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: 'semibold',
        transition: 'all 0.2s ease',
        _active: {
          transform: 'scale(0.96)', // Effet de clic physique
        },
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'unipay' ? 'unipay.500' : undefined,
          _hover: {
            bg: props.colorScheme === 'unipay' ? 'unipay.600' : undefined,
            boxShadow: props.colorScheme === 'unipay' ? '0 0 15px rgba(79, 70, 229, 0.4)' : undefined, // Effet néon
          },
        }),
      },
    },
  },
})

export default theme