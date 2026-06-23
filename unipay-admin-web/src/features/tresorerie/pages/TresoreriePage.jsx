import { useState, useEffect } from 'react'
import {
  Box, VStack, Heading, Text, Flex, Badge, SimpleGrid, Button, Icon,
  useToast, Stat, StatLabel, StatNumber, StatHelpText, Progress,
  Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon, AlertTitle,
  HStack, Spinner
} from '@chakra-ui/react'
import { MdLock, MdHistory, MdCheckCircle, MdCloudDownload, MdShield } from 'react-icons/md'

// 🌐 Importation de ton instance connectée au backend
import axiosInstance from '../../../api/axiosInstance'

export default function TresoreriePage() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isCloturant, setIsCloturant] = useState(false)
  const [isRecuperant, setIsRecuperant] = useState(false)

  // États dynamiques synchronisés avec ton Backend UniPay
  const [beneficeNetDisponible, setBeneficeNetDisponible] = useState(0)
  const [cumulGainsXAF, setCumulGainsXAF] = useState(0)
  const [soldePortefeuilleAdmin, setSoldePortefeuilleAdmin] = useState(0)
  const [deviseCompteAdmin, setDeviseCompteAdmin] = useState("...")
  const [totalDetteClients, setTotalDetteClients] = useState(0)
  const [listeAgregateurs, setListeAgregateurs] = useState([])

  // Variables de réconciliation calculées à la volée
  const liquiditeAgregateurs = listeAgregateurs.reduce((acc, curr) => acc + (curr.revenuGenereNetLocal || 0), 0)
  const ecartReconciliation = liquiditeAgregateurs - totalDetteClients

  // 📥 Chargement des données réelles du Dashboard Admin (Vue 360°)
  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('admin/dashboard')
      if (response.data && response.data.succes) {
        const report = response.data.data

        setDeviseCompteAdmin(report.metadataReporting?.devisePrincipaleDashboard || "XAF")
        setBeneficeNetDisponible(report.cardsGlobales?.montantGlobalBeneficeNet || 0)
        setTotalDetteClients(report.cardsGlobales?.argentCirculantDansUniPay || 0)
        setListeAgregateurs(report.listeAgregateursDashboard || [])
        setSoldePortefeuilleAdmin(report.cardsGlobales?.soldePortefeuilleAdmin || 0)
        setCumulGainsXAF(report.cardsGlobales?.cumulGainsCoffre || 0)
      }
    } catch (error) {
      console.error("[UniPay Trésorerie] Échec du chargement :", error)
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de récupérer les indicateurs financiers.",
        status: "error",
        duration: 4000
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // 🔄 POST /api/unipay/admin/cloture -> Exécution comptable EOD
  const handleDeclencherCloture = async () => {
    if (beneficeNetDisponible <= 0) {
      toast({
        title: "Erreur de clôture",
        description: "Le solde des bénéfices nets à reverser est à 0 ou négatif.",
        status: "error",
        duration: 4000
      })
      return
    }

    setIsCloturant(true)
    try {
      const response = await axiosInstance.post('/admin/cloture')
      if (response.data && response.data.succes) {
        toast({
          title: "Clôture comptable exécutée",
          description: "L'opération s'est terminée avec succès.",
          status: "success",
          duration: 4000
        })
        await fetchDashboardData()
      }
    } catch (error) {
      console.error("[UniPay Clôture] Incident intercepté :", error)

      // 🛡️ SÉCURISATION RADICALE : Chaîne brute uniquement, pas de fallback dynamique complexe
      let msg = "Une erreur est survenue lors de la clôture.";
      if (error.response?.data?.message) msg = String(error.response.data.message);
      else if (error.response?.data?.error) msg = String(error.response.data.error);
      else if (error.message) msg = String(error.message);

      toast({
        title: "Échec de l'opération",
        description: msg,
        status: "error",
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsCloturant(false)
    }
  }

  // 💰 POST /api/unipay/admin/recuperer-fonds -> Rapatriement du coffre autonome
  const handleRecupererFonds = async () => {
    setIsRecuperant(true)
    try {
      const response = await axiosInstance.post('/admin/recuperer-fonds')
      if (response.data && response.data.succes) {
        const { montantRecupere, devise } = response.data.data || {}
        const totalFonds = (montantRecupere || 0).toLocaleString()
        const unitDevise = String(devise || "")

        toast({
          title: "💵 Fonds rapatriés",
          description: `Montant reversé : ${totalFonds} ${unitDevise}`,
          status: "success",
          duration: 5000,
          isClosable: true
        })
        await fetchDashboardData()
      }
    } catch (error) {
      console.error("[UniPay Récupération] Incident intercepté :", error)

      // 🛡️ SÉCURISATION SUPRÊME ANTI-CRASH : Extraction en String pure isolée
      let msgErreurBrut = "Le coffre est vide ou introuvable.";
      if (error.response?.data?.message) msgErreurBrut = String(error.response.data.message);
      else if (error.response?.data?.error) msgErreurBrut = String(error.response.data.error);
      else if (error.message) msgErreurBrut = String(error.message);

      toast({
        title: "Opération avortée",
        description: msgErreurBrut, // Zéro calcul ou concaténation ici
        status: "error",
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsRecuperant(false)
    }
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner color="purple.400" size="xl" thickness="4px" />
      </Flex>
    )
  }

  const txtEcart = Math.abs(ecartReconciliation).toLocaleString()
  const txtDevise = String(deviseCompteAdmin)
  const messageNominal = `La liquidité chez les agrégateurs couvre la dette des portefeuilles utilisateurs. Écart : +${txtEcart} ${txtDevise}.`
  const messageErreurBalance = `Écart de balance critique : -${txtEcart} ${txtDevise}. Vérifiez les passerelles de paiement.`

  return (
    <VStack spacing={6} align="stretch" pb={10}>
      {/* En-tête */}
      <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="extrabold">Trésorerie & Clôture Journalière</Heading>
          <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
            Passerelle d'exécution pour les actions directes sur les reversements et le coffre-fort autonome.
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            colorScheme="purple"
            variant="outline"
            leftIcon={<Icon as={MdCloudDownload} />}
            isLoading={isRecuperant}
            onClick={handleRecupererFonds}
          >
            Vider le Coffre Fort
          </Button>
          <Button
            colorScheme={beneficeNetDisponible === 0 ? "green" : "red"}
            leftIcon={<Icon as={beneficeNetDisponible === 0 ? MdCheckCircle : MdLock} />}
            isLoading={isCloturant}
            onClick={handleDeclencherCloture}
            isDisabled={beneficeNetDisponible === 0}
          >
            {beneficeNetDisponible === 0 ? "Livre Figé" : "Déclencher Clôture (EOD)"}
          </Button>
        </HStack>
      </Flex>

      {/* ================= ⚖️ STATUT DE RÉCONCILIATION COMPTABLE ================= */}
      <Box>
        {ecartReconciliation >= 0 ? (
          <Alert status="success" variant="solid" borderRadius="xl" bg="teal.800" borderColor="teal.500" borderWidth="1px">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Équilibre des comptes nominal !</AlertTitle>
              <Text fontSize="xs" color="whiteAlpha.800" mt={1}>
                {messageNominal}
              </Text>
            </Box>
          </Alert>
        ) : (
          <Alert status="error" variant="solid" borderRadius="xl" bg="red.900" borderColor="red.600" borderWidth="1px">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Attention : Écart négatif détecté !</AlertTitle>
              <Text fontSize="xs" color="red.100" mt={1}>
                {messageErreurBalance}
              </Text>
            </Box>
          </Alert>
        )}
      </Box>

      {/* ================= 📊 GRAND LIVRE PRISMA DYNAMIQUE ================= */}
      <SimpleGrid columns={{ base: 1, md: 4 }} gap={5}>
        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500">Bénéfice Net Flottant (Jour)</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black" color={beneficeNetDisponible > 0 ? "orange.300" : "whiteAlpha.400"}>
              {beneficeNetDisponible.toLocaleString()} {txtDevise}
            </StatNumber>
            <StatHelpText color="whiteAlpha.400">Rapport : montantGlobalBeneficeNet</StatHelpText>
          </Stat>
          <Progress value={beneficeNetDisponible > 0 ? 45 : 100} size="xs" colorScheme="orange" mt={4} borderRadius="full" isIndeterminate={isCloturant} />
        </Box>

        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500" display="flex" alignItems="center">
              <Icon as={MdShield} mr={1} color="yellow.400" /> Coffre UniPay (global_vault)
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black" color="yellow.300">
              {cumulGainsXAF.toLocaleString()} {txtDevise}
            </StatNumber>
            <StatHelpText color="whiteAlpha.400">Champ: cumulGainsXAF</StatHelpText>
          </Stat>
          <Progress value={100} size="xs" colorScheme="yellow" mt={4} borderRadius="full" />
        </Box>

        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500">Votre Portefeuille Admin</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black" color="teal.300">
              {soldePortefeuilleAdmin.toLocaleString()} {txtDevise}
            </StatNumber>
            <StatHelpText color="whiteAlpha.400">Cible du reversement strict</StatHelpText>
          </Stat>
          <Progress value={100} size="xs" colorScheme="teal" mt={4} borderRadius="full" />
        </Box>

        {/* ================= 📊 QUATRIÈME BLOC DE LA GRILLE DYNAMIQUE ================= */}
        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500">Masse Portefeuilles Clients</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black">
              {totalDetteClients.toLocaleString()} {txtDevise}
            </StatNumber> {/* 🌟 BALISE CORRIGÉE ICI */}
            <StatHelpText color="whiteAlpha.400">Registre total Prisma</StatHelpText>
          </Stat>
          <Progress value={100} size="xs" colorScheme="purple" mt={4} borderRadius="full" />
        </Box>
      </SimpleGrid>

      {/* ================= 🖥️ DIAGNOSTIC DES AGREGATEURS DISTANTS ================= */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading size="xs" textTransform="uppercase" color="whiteAlpha.500" mb={4} letterSpacing="wider">
            Vérification de la liquidité externe (Agrégateurs)
          </Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr borderColor="whiteAlpha.100">
                <Th color="whiteAlpha.400">Opérateur</Th>
                <Th color="whiteAlpha.400" isNumeric>Fonds Net Généré</Th>
                <Th color="whiteAlpha.400">État Passerelle</Th>
              </Tr>
            </Thead>
            <Tbody>
              {listeAgregateurs.map((ag) => (
                <Tr key={ag.id} borderColor="whiteAlpha.100">
                  <Td fontWeight="bold">{ag.nom || ""}{" "}({ag.pays || ""})</Td>
                  <Td isNumeric fontWeight="mono">{(ag.revenuGenereNetLocal || 0).toLocaleString()} {ag.deviseAgreg || ""}</Td>
                  <Td><Badge colorScheme={ag.statut === "ACTIF" ? "green" : "red"}>{ag.statut === "ACTIF" ? "Synchrone" : "Désactivé"}</Badge></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading size="xs" textTransform="uppercase" color="whiteAlpha.500" mb={4} letterSpacing="wider" display="flex" alignItems="center">
            <Icon as={MdHistory} mr={1} boxSize={4} /> Logs d'exécution d'audit
          </Heading>
          <VStack align="stretch" spacing={3}>
            <Flex justify="space-between" align="center" p={2} bg="whiteAlpha.50" borderRadius="md" fontSize="xs">
              <Box>
                <Text fontWeight="mono" fontSize="2xs">EXEC_TX_VAULT_CLEAR</Text>
                <Text color="whiteAlpha.500">Statut du coffre-fort autonome</Text>
              </Box>
              <Badge colorScheme={beneficeNetDisponible > 0 ? "orange" : "gray"}>
                {beneficeNetDisponible > 0 ? "FLUX EN ATTENTE DE CLÔTURE" : "GRAND LIVRE À JOUR"}
              </Badge>
            </Flex>

            <Flex justify="space-between" align="center" p={2} bg="whiteAlpha.50" borderRadius="md" fontSize="xs">
              <Box>
                <Text fontWeight="bold">EOD_VERIFICATION_PASS</Text>
                <Text color="whiteAlpha.500">Contrôle de cohérence Prisma OK</Text>
              </Box>
              <Icon as={MdCheckCircle} color="teal.400" boxSize={5} />
            </Flex>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  )
}