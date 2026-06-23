import { useEffect, useState } from 'react'
import { Grid, GridItem, Heading, Text, VStack, Box, Flex, Badge, Progress, Icon, Table, Tbody, Tr, Td, Th, Thead, Spinner, Center, useToast } from '@chakra-ui/react'
import { MdAccountBalanceWallet, MdTrendingUp, MdMonetizationOn, MdCheckCircle, MdLink, MdPeople, MdLayers, MdCreditCard, MdFlag, MdPhoneAndroid, MdAccountTree, MdSecurity } from 'react-icons/md'
import StatCard from '../../../components/StatCard'
// 🔌 Importation de ton instance Axios sécurisée
import axiosInstance from '../../../api/axiosInstance'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  // 🛰️ APPEL API DYNAMIQUE VIA AXIOS
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Remplace '/admin/dashboard' par la vraie route de ton routeur Express
        const response = await axiosInstance.get('/admin/dashboard')

        // Si ton backend renvoie { success: true, data: { ... } }
        setData(response.data.data || response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error)
        toast({
          title: "Échec de synchronisation",
          description: error.response?.data?.message || "Impossible de joindre le serveur UniPay.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  // ⏳ ÉCRAN DE CHARGEMENT PENDANT LA REQUÊTE AXIOS
  if (loading) {
    return (
      <Center h="70vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="whiteAlpha.700" fontSize="sm" fontWeight="medium">
            Calcul des flux et audit du coffre UniPay en cours...
          </Text>
        </VStack>
      </Center>
    )
  }

  // 🚨 SÉCURITÉ SI AUCUNE DONNÉE
  if (!data) {
    return (
      <Center h="70vh">
        <Text color="red.400">Aucune donnée disponible. Vérifie la connexion avec ton API.</Text>
      </Center>
    )
  }

  // Extraction des variables alignées sur ton architecture
  const { devisePrincipaleDashboard } = data.metadataReporting
  const {
    cardsGlobales, santeDuReseau,
    analyseFluxSpecifiques, monitoringUtilisateurs,
    monitoringEpargne, monitoringCartesVirtuelles,
    traçabiliteRevenusDetailles, revenusParPays,
    revenusParOperateur, listeAgregateursDashboard
  } = data

  return (
    <VStack spacing={8} align="stretch" pb={10}>

      {/* ================= HEADER OPÉRATIONNEL ================= */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg" fontWeight="extrabold" letterSpacing="tight" bgGradient="linear(to-r, unipay.400, white)" bgClip="text">
            Moteur d'Analyse 360° UniPay
          </Heading>
          <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
            Rapport d'audit chirurgical des flux, coffres et performances en temps réel.
          </Text>
        </Box>
        <Badge colorScheme="green" px={4} py={2} borderRadius="xl" variant="solid" fontSize="xs" fontWeight="bold">
          🟢 Live API Connected
        </Badge>
      </Flex>

      {/* ================= 1. GRILLE KPI GLOBALE (FINANCES + RÉSILIENCE) ================= */}
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
        <StatCard
          title="Masse Monétaire (M0)"
          value={`${cardsGlobales.argentCirculantDansUniPay.toLocaleString()} ${devisePrincipaleDashboard}`}
          icon={MdAccountBalanceWallet}
          helpText="Portefeuilles + Coffre Global UniPay"
          color="blue.400"
        />
        <StatCard
          title="Volume Transféré Total"
          value={`${cardsGlobales.volumeTransfereTotal.toLocaleString()} ${devisePrincipaleDashboard}`}
          icon={MdTrendingUp}
          helpText="Cumul historique brut (Succès uniquement)"
          color="purple.400"
        />
        <StatCard
          title="Bénéfice Net Consolidé"
          value={`${cardsGlobales.montantGlobalBeneficeNet.toLocaleString()} ${devisePrincipaleDashboard}`}
          icon={MdMonetizationOn}
          helpText="Revenus système nets de frais partenaires"
          color="green.400"
        />
        <StatCard
          title="Disponibilité Réseau"
          value={santeDuReseau.tauxSuccesGlobal}
          icon={MdCheckCircle}
          helpText={`${santeDuReseau.transactionsReussies} Réussies / ${santeDuReseau.transactionsEchouees} Échecs`}
          color="cyan.400"
        />
      </Grid>

      {/* ================= 2. VENTILATION PAR SOU-SYSTÈMES ================= */}
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6}>
        <Box p={5} bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" mb={3} color="blue.300">
            <Icon as={MdPeople} mr={2} w={5} h={5} />
            <Text fontWeight="bold" fontSize="sm" letterSpacing="wide">MONITORING USERS</Text>
          </Flex>
          <Text fontSize="2xl" fontWeight="black">{monitoringUtilisateurs.actifs.toLocaleString()}</Text>
          <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
            {monitoringUtilisateurs.enAttenteAprobation} KYC en attente • {monitoringUtilisateurs.suspendus} bloqués
          </Text>
        </Box>

        <Box p={5} bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" mb={3} color="pink.300">
            <Icon as={MdLayers} mr={2} w={5} h={5} />
            <Text fontWeight="bold" fontSize="sm" letterSpacing="wide">MONITORING ÉPARGNE</Text>
          </Flex>
          <Text fontSize="2xl" fontWeight="black">{monitoringEpargne.sommeTotaleEpargnesEnCours.toLocaleString()} {devisePrincipaleDashboard}</Text>
          <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
            Actuellement sécurisés pour {monitoringEpargne.nombreEpargnantsActifs} coffres en cours
          </Text>
        </Box>

        <Box p={5} bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" mb={3} color="orange.300">
            <Icon as={MdCreditCard} mr={2} w={5} h={5} />
            <Text fontWeight="bold" fontSize="sm" letterSpacing="wide">CARTES VIRTUELLES</Text>
          </Flex>
          <Text fontSize="2xl" fontWeight="black">{monitoringCartesVirtuelles.nombreCartesActives} / {monitoringCartesVirtuelles.nombreTotalAbonnes}</Text>
          <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
            Cartes actives en circulation sur le réseau mondial
          </Text>
        </Box>
      </Grid>

      {/* ================= 3. ZONE AUDIT FINANCIER ================= */}
      <Grid templateColumns={{ base: '1fr', lg: '3fr 2fr' }} gap={6}>
        <GridItem bg="unipay.800" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading size="sm" mb={5} color="whiteAlpha.800" letterSpacing="wider" textTransform="uppercase">
            💵 Traçabilité des Revenus Détaillés (Moteur de gains)
          </Heading>
          <VStack align="stretch" spacing={4}>
            {[
              { label: "Bénéfices sur Dépôts (DEPOT)", val: traçabiliteRevenusDetailles.beneficeDepots, pct: 25, color: "teal" },
              { label: "Bénéfices sur Retraits (RETRAIT)", val: traçabiliteRevenusDetailles.beneficeRetraits, pct: 18, color: "cyan" },
              { label: "Transferts P2P & Liens (TRANSFERT / LIEN_PAIEMENT)", val: traçabiliteRevenusDetailles.beneficePaiementInterneEtLien, pct: 30, color: "purple" },
              { label: "Marge de Change Spreads (CONVERSION)", val: traçabiliteRevenusDetailles.beneficeConversionSpread, pct: 15, color: "yellow" },
              { label: "Frais d'Abonnements Cartes (ABONNEMENT_CARTE)", val: traçabiliteRevenusDetailles.beneficeCartesAbonnement, pct: 6, color: "orange" },
              { label: "Commissions Paiements En Ligne (PAIEMENT_CARTE)", val: traçabiliteRevenusDetailles.beneficeCartesPaiementEnLigne, pct: 4, color: "pink" },
              { label: "Blâmes Ruptures Épargne Stricte (RUPTURE_EPARGNE)", val: traçabiliteRevenusDetailles.beneficeBlameRuptureEpargne, pct: 2, color: "red" },
            ].map((item, index) => (
              <Box key={index}>
                <Flex justify="space-between" fontSize="sm" mb={1}>
                  <Text color="whiteAlpha.700" fontWeight="medium">{item.label}</Text>
                  <Text fontWeight="bold" color="white">{item.val.toLocaleString()} {devisePrincipaleDashboard}</Text>
                </Flex>
                <Progress value={item.pct} size="xs" colorScheme={item.color} bg="whiteAlpha.50" borderRadius="full" />
              </Box>
            ))}
          </VStack>
        </GridItem>

        <VStack spacing={6} align="stretch">
          <Box bg="unipay.800" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <Heading size="sm" mb={4} color="whiteAlpha.800" textTransform="uppercase" letterSpacing="wider">
              🌍 Performance Métrique par Pays
            </Heading>
            <VStack align="stretch" spacing={3}>
              {Object.entries(revenusParPays).map(([pays, montant]) => (
                <Flex key={pays} justify="space-between" align="center" p={2} bg="whiteAlpha.50" borderRadius="md">
                  <Flex align="center">
                    <Icon as={MdFlag} mr={2} color="unipay.400" />
                    <Text fontSize="sm" fontWeight="semibold">{pays}</Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="bold">{montant.toLocaleString()} {devisePrincipaleDashboard}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box bg="unipay.800" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <Heading size="sm" mb={4} color="whiteAlpha.800" textTransform="uppercase" letterSpacing="wider">
              📲 Parts par Opérateurs
            </Heading>
            <VStack align="stretch" spacing={3}>
              {Object.entries(revenusParOperateur).map(([op, montant]) => (
                <Flex key={op} justify="space-between" align="center" p={2} bg="whiteAlpha.50" borderRadius="md">
                  <Flex align="center">
                    <Icon as={MdPhoneAndroid} mr={2} color="cyan.400" />
                    <Text fontSize="sm" fontWeight="semibold">{op}</Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="bold">{montant.toLocaleString()} {devisePrincipaleDashboard}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* ================= 4. SECTION AGRÉGATEURS PARTENAIRES ================= */}
      <Box bg="unipay.800" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Heading size="sm" mb={4} color="whiteAlpha.800" textTransform="uppercase" letterSpacing="wider" display="flex" alignItems="center">
          <Icon as={MdAccountTree} mr={2} color="purple.400" />
          Routage & Performance Financière des Agrégateurs Connectés
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr borderColor="whiteAlpha.200">
                <Th color="whiteAlpha.400">Nom</Th>
                <Th color="whiteAlpha.400">Pays</Th>
                <Th color="whiteAlpha.400">Commission Pct</Th>
                <Th color="whiteAlpha.400">Frais Fixes Config</Th>
                <Th color="whiteAlpha.400">Revenu Net Généré</Th>
                <Th color="whiteAlpha.400">Statut</Th>
              </Tr>
            </Thead>
            <Tbody>
              {listeAgregateursDashboard.map((ag) => (
                <Tr key={ag.id} _hover={{ bg: "whiteAlpha.50" }} transition="0.2s" borderColor="whiteAlpha.100">
                  <Td fontWeight="bold" color="white">{ag.nom}</Td>
                  <Td>{ag.pays}</Td>
                  <Td color="yellow.400">{ag.commissionConfiguration}</Td>
                  <Td>{ag.fraisFixesConfiguration}</Td>
                  <Td fontWeight="bold" color="green.400">+{ag.revenuGenereNetLocal.toLocaleString()} {ag.deviseAgreg}</Td>
                  <Td>
                    <Badge colorScheme={ag.statut === "ACTIF" ? "green" : "red"} variant="subtle" px={2} borderRadius="md">
                      {ag.statut}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* ================= 5. FLUX SPÉCIFIQUES & DÉTAILS ÉCHECS OPÉRATIONNELS ================= */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        <Box bg="unipay.800" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading size="sm" mb={4} color="whiteAlpha.800" textTransform="uppercase" letterSpacing="wider">
            🔗 Traçabilité des Tunnels de Paiement
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
              <Flex align="center" mb={2}>
                <Icon as={MdLink} mr={2} color="unipay.400" />
                <Text fontSize="xs" color="whiteAlpha.600">Volume via Liens</Text>
              </Flex>
              <Text fontSize="lg" fontWeight="bold">{analyseFluxSpecifiques.volumeCirculeLienPaiement.toLocaleString()} {devisePrincipaleDashboard}</Text>
            </Box>
            <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
              <Flex align="center" mb={2}>
                <Icon as={MdCheckCircle} mr={2} color="green.400" />
                <Text fontSize="xs" color="whiteAlpha.600">Flux sans conversion</Text>
              </Flex>
              <Text fontSize="lg" fontWeight="bold">{analyseFluxSpecifiques.nombrePaiementsSansConversion} Tx</Text>
            </Box>
          </Grid>
        </Box>

        <Box bg="unipay.800" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading size="sm" mb={4} color="whiteAlpha.800" textTransform="uppercase" letterSpacing="wider" display="flex" alignItems="center">
            <Icon as={MdSecurity} mr={2} color="red.400" />
            Analyse des Échecs Réseau
          </Heading>
          <VStack align="stretch" spacing={3}>
            {Object.entries(santeDuReseau.repartitionDetailsEchecs).map(([motif, count]) => (
              <Box key={motif}>
                <Flex justify="space-between" fontSize="xs" mb={1}>
                  <Text color="whiteAlpha.700">{motif}</Text>
                  <Text color="red.400" fontWeight="bold">{count} rejets</Text>
                </Flex>
                <Progress value={(count / santeDuReseau.transactionsEchouees) * 100} size="xs" colorScheme="red" bg="whiteAlpha.100" borderRadius="full" />
              </Box>
            ))}
          </VStack>
        </Box>
      </Grid>

    </VStack>
  )
}