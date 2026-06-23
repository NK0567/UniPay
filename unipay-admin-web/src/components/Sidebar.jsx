import { Box, VStack, Text, Flex, Icon, Heading, Divider, Spacer, Button } from '@chakra-ui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  MdDashboard, MdPeople, MdAccountBalanceWallet, 
  MdSettingsInputComponent, MdAccountBalance, MdExitToApp, MdSettings
} from 'react-icons/md'

const MenuItem = ({ icon, children, to }) => {
  return (
    <NavLink to={to} style={() => ({ width: '100%' })}>
      {({ isActive }) => (
        <Flex
          align="center"
          p={3}
          mx={2}
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? 'unipay.500' : 'transparent'}
          color={isActive ? 'white' : 'whiteAlpha.700'}
          _hover={{
            bg: isActive ? 'unipay.600' : 'whiteAlpha.100',
            color: 'white',
          }}
          transition="all 0.2s"
        >
          <Icon as={icon} mr={4} fontSize="20" />
          <Text fontWeight="medium">{children}</Text>
        </Flex>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('unipay_token')
    localStorage.removeItem('unipay_user')
    navigate('/login', { replace: true })
  }

  return (
    <Box
      w="260px"
      pos="fixed"
      h="100vh"
      bg="unipay.800"
      borderRight="1px solid"
      borderRightColor="whiteAlpha.100"
      py={5}
    >
      <Flex direction="column" h="full">
        {/* Logo / Header */}
        <Flex h="20" align="center" mx="6" justify="center" mb={2}>
          <Heading size="md" bgGradient="linear(to-r, unipay.400, purple.300)" bgClip="text" fontWeight="bold">
            UNIPAY COCKPIT
          </Heading>
        </Flex>
        
        <Divider borderColor="whiteAlpha.100" mb={6} width="85%" mx="auto" />

        {/* Liens principaux du Cockpit */}
        <VStack spacing={2} align="stretch">
          <MenuItem icon={MdDashboard} to="/">Vue Globale 360°</MenuItem>
          <MenuItem icon={MdPeople} to="/utilisateurs">Utilisateurs</MenuItem>
          <MenuItem icon={MdSettingsInputComponent} to="/commissions">Tarification Volante</MenuItem>
          <MenuItem icon={MdAccountBalance} to="/agregateurs">Passerelles Partenaires</MenuItem>
          <MenuItem icon={MdAccountBalanceWallet} to="/tresorerie">Coffre & Trésorerie</MenuItem>
          {/* 🆕 AJOUT DU COMPOSANT D'INFRASTRUCTURE GLOBAL */}
          <MenuItem icon={MdSettings} to="/configuration">Configuration Système</MenuItem>
        </VStack>

        <Spacer />

        {/* Section de Sécurité / Déconnexion autonome */}
        <Box px={4} pt={4} borderTop="1px solid" borderColor="whiteAlpha.100" mb={4}>
          <Button
            w="full"
            colorScheme="red"
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<Icon as={MdExitToApp} fontSize="20" />}
            _hover={{ bg: "red.900", color: "red.100" }}
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}