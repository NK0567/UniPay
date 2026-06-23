import { useState, useEffect } from 'react'
import {
  Box, VStack, Heading, Text, Flex, Badge, SimpleGrid, Button, Icon, 
  Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem,
  useToast, Stat, StatLabel, StatNumber, StatHelpText, FormControl, FormLabel,
  Input, Select, InputGroup, InputRightAddon, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Spinner, Center
} from '@chakra-ui/react'
import { MdSettingsInputComponent, MdAdd, MdCompareArrows, MdTune } from 'react-icons/md'
import axiosInstance from '../../../api/axiosInstance' 

const getNomPays = (codeISO) => {
  if (!codeISO) return ""
  try {
    const regionNames = new Intl.DisplayNames(['fr'], { type: 'region' })
    return regionNames.of(codeISO.toUpperCase())
  } catch (e) {
    return codeISO
  }
}

export default function AgregateursPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // États de l'API
  const [agregateurs, setAgregateurs] = useState([])
  const [listePays, setListePays] = useState([]) // 👈 Stocke les pays du CurrencyHelper
  const [loading, setLoading] = useState(true)

  // Formulaire initial pour l'ajout
  const [newAgregateur, setNewAgregateur] = useState({
    nom: '', type: 'MOBILE_MONEY', pays: 'CM', commissionPct: '0.5', fraisFixes: '0', operationType: 'LES_DEUX'
  })

  // 🛰️ CHARGEMENT DES DONNÉES DEPUIS LA BD (GET)
  const fetchAgregateurs = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/agregateurs')
      setAgregateurs(response.data.data || response.data)
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: error.response?.data?.message || "Impossible de récupérer les passerelles.",
        status: "error",
        duration: 4000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  // 🌍 NOUVEAU : CHARGEMENT DES PAYS SUPPORTÉS
  const fetchPaysSupportes = async () => {
    try {
      const response = await axiosInstance.get('/agregateurs/pays-supportees')
      if (response.data.success) {
        setListePays(response.data.data)
      }
    } catch (error) {
      console.error("Impossible de charger le dictionnaire des pays", error)
    }
  }

  useEffect(() => {
    fetchAgregateurs()
    fetchPaysSupportes() // Charge la cartographie au montage du composant
  }, [])

  // 🔄 MODIFICATION DU STATUT EN BASE (PATCH)
  const handleToggleStatut = async (id, nouveauStatut) => {
    try {
      const response = await axiosInstance.patch(`/agregateurs/${id}/statut`, { statut: nouveauStatut })
      
      if (response.data.success) {
        setAgregateurs(prev => prev.map(ag => ag.id === id ? { ...ag, statut: nouveauStatut } : ag))
        
        const colorStatus = nouveauStatut === 'ACTIF' ? 'success' : nouveauStatut === 'TEST' ? 'warning' : 'error'
        toast({
          title: `Statut modifié avec succès`,
          description: `La passerelle a basculé en mode [${nouveauStatut}]. Le Smart Routing s'est réadapté.`,
          status: colorStatus,
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Échec de la modification",
        description: error.response?.data?.message || "Une erreur est survenue.",
        status: "error",
        duration: 4000,
        isClosable: true
      })
    }
  }

  // ➕ CRÉATION D'UNE NOUVELLE PASSERELLE DANS LA BD (POST)
  const handleCreate = async () => {
    if (!newAgregateur.nom.trim()) {
      toast({ title: "Le nom est obligatoire", status: "warning", duration: 2000 })
      return
    }

    try {
      const response = await axiosInstance.post('/agregateurs', newAgregateur)
      
      if (response.data.success) {
        await fetchAgregateurs()
        onClose()
        setNewAgregateur({ nom: '', type: 'MOBILE_MONEY', pays: 'CM', commissionPct: '0.5', fraisFixes: '0', operationType: 'LES_DEUX' })
        
        toast({
          title: "Nouvel Agrégateur enregistré",
          description: `Le driver de communication pour ${newAgregateur.nom} est prêt à être testé dans la Sandbox.`,
          status: "success",
          duration: 4000,
        })
      }
    } catch (error) {
      toast({
        title: "Échec de la création",
        description: error.response?.data?.message || "Impossible d'injecter la passerelle.",
        status: "error",
        duration: 4000,
      })
    }
  }

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'ACTIF': return <Badge colorScheme="teal">PRODUCTION</Badge>
      case 'TEST': return <Badge colorScheme="yellow">SANDBOX / TEST</Badge>
      default: return <Badge colorScheme="red">COUPÉ / OFF</Badge>
    }
  }

  if (loading && agregateurs.length === 0) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    )
  }

  return (
    <VStack spacing={6} align="stretch" pb={10}>
      {/* En-tête */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg" fontWeight="extrabold">Routage Intelligent & Agrégateurs</Heading>
          <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
            Gestion des passerelles partenaires. L'algorithme UniPay achemine les flux vers la passerelle active la moins chère.
          </Text>
        </Box>
        <Button colorScheme="purple" leftIcon={<Icon as={MdAdd} />} onClick={onOpen}>
          Brancher un opérateur
        </Button>
      </Flex>

      {/* ================= 📊 MINI COCKPIT STATS MOTEUR DYNAMIQUE ================= */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500" display="flex" alignItems="center">
              <Icon as={MdCompareArrows} mr={1} color="purple.400" /> Algorithme de Routage
            </StatLabel>
            <StatNumber fontSize="2xl" color="teal.300">Moins cher (Cost-Based)</StatNumber>
            <StatHelpText color="whiteAlpha.500">Calculé sur une base de 10k XAF</StatHelpText>
          </Stat>
        </Box>

        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500">Passerelles Opérationnelles</StatLabel>
            <StatNumber fontSize="2xl">
              {agregateurs.filter(a => a.statut === 'ACTIF').length} Actives
            </StatNumber>
            <StatHelpText color="yellow.400">
              {agregateurs.filter(a => a.statut === 'TEST').length} en Sandbox locale
            </StatHelpText>
          </Stat>
        </Box>

        <Box bg="unipay.800" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500">Zone Couverte ({agregateurs.length > 0 ? [...new Set(agregateurs.map(a => a.pays))].length : 0} Pays)</StatLabel>
            <StatNumber fontSize="2xl">
              {agregateurs.length > 0 
                ? [...new Set(agregateurs.map(a => a.pays.toUpperCase()))].join(' , ') 
                : "Aucune"}
            </StatNumber>
            <StatHelpText color="whiteAlpha.500">
              {agregateurs.length > 0 
                ? [...new Set(agregateurs.map(a => getNomPays(a.pays)))].join(', ') 
                : "En attente de déploiement"}
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* ================= 🖥️ TABLEAU DES PASSERELLES ================= */}
      <Box bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
        <Table variant="simple">
          <Thead bg="whiteAlpha.50">
            <Tr>
              <Th color="whiteAlpha.600">Opérateur / Type</Th>
              <Th color="whiteAlpha.600">Zone (Pays)</Th>
              <Th color="whiteAlpha.600">Flux Supporté</Th>
              <Th color="whiteAlpha.600">Coût d'infrastructure</Th>
              <Th color="whiteAlpha.600">Statut Moteur</Th>
              <Th color="whiteAlpha.600" textAlign="right">Actions directes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {agregateurs.map((ag) => (
              <Tr key={ag.id} _hover={{ bg: "whiteAlpha.50" }}>
                <Td fontWeight="bold">
                  <Flex align="center" gap={3}>
                    <Icon as={MdSettingsInputComponent} color="purple.400" boxSize={5} />
                    <Box>
                      <Text>{ag.nom}</Text>
                      <Text fontSize="xs" fontWeight="normal" color="whiteAlpha.500">{ag.type}</Text>
                    </Box>
                  </Flex>
                </Td>
                <Td><Badge variant="outline" colorScheme="purple">{ag.pays}</Badge></Td>
                <Td>
                  <Badge colorScheme={ag.operationType === 'LES_DEUX' ? 'blue' : 'orange'}>
                    {ag.operationType}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize="sm" fontWeight="semibold">{ag.commissionPct}% + {ag.fraisFixes} XAF</Text>
                  <Text fontSize="2xs" color="whiteAlpha.500">Cout simulé (10k) : {(10000 * (parseFloat(ag.commissionPct) / 100)) + parseFloat(ag.fraisFixes)} XAF</Text>
                </Td>
                <Td>{getStatusBadge(ag.statut)}</Td>
                <Td textAlign="right">
                  <Menu>
                    <MenuButton as={Button} size="xs" rightIcon={<Icon as={MdTune} />} colorScheme="whiteAlpha">
                      Piloter
                    </MenuButton>
                    <MenuList bg="unipay.800" borderColor="whiteAlpha.200" color="white">
                      <MenuItem bg="unipay.800" _hover={{ bg: "teal.600" }} onClick={() => handleToggleStatut(ag.id, 'ACTIF')}>
                        🟢 Passer en Production
                      </MenuItem>
                      <MenuItem bg="unipay.800" _hover={{ bg: "yellow.600" }} onClick={() => handleToggleStatut(ag.id, 'TEST')}>
                        🟡 Basculer en Sandbox (Test)
                      </MenuItem>
                      <MenuItem bg="unipay.800" _hover={{ bg: "red.600" }} onClick={() => handleToggleStatut(ag.id, 'SUSPENDU')}>
                        🔴 Couper l'alimentation (OFF)
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* ================= 📑 MODAL D'AJOUT ENRICHI ET DYNAMIQUE ================= */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="unipay.800" color="white" borderColor="whiteAlpha.200" borderWidth="1px">
          <ModalHeader fontWeight="bold">🔌 Raccorder un nouvel Agrégateur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Nom du partenaire</FormLabel>
                <Input size="sm" placeholder="Ex: Wave CI, Moov..." bg="unipay.900" border="1px solid" borderColor="whiteAlpha.200" value={newAgregateur.nom} onChange={(e) => setNewAgregateur({...newAgregateur, nom: e.target.value})} />
              </FormControl>

              <SimpleGrid columns={2} gap={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Code Pays ISO</FormLabel>
                  <Select size="sm" bg="unipay.900" value={newAgregateur.pays} onChange={(e) => setNewAgregateur({...newAgregateur, pays: e.target.value})}>
                    {/* 🔄 Rendu dynamique des options à partir du dictionnaire backend */}
                    {listePays.length > 0 ? (
                      listePays.map((p) => (
                        <option key={p.code} value={p.code} style={{background: '#1A1D26'}}>
                          {p.code} - {p.nom}
                        </option>
                      ))
                    ) : (
                      <option value="CM" style={{background: '#1A1D26'}}>CM - Cameroun</option>
                    )}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Type de flux</FormLabel>
                  <Select size="sm" bg="unipay.900" value={newAgregateur.operationType} onChange={(e) => setNewAgregateur({...newAgregateur, operationType: e.target.value})}>
                    <option value="LES_DEUX" style={{background: '#1A1D26'}}>Dépôt & Retrait</option>
                    <option value="DEPOT" style={{background: '#1A1D26'}}>Dépôt Uniquement</option>
                    <option value="RETRAIT" style={{background: '#1A1D26'}}>Retrait Uniquement</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} gap={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Commission Opérateur</FormLabel>
                  <InputGroup size="sm">
                    <Input type="number" bg="unipay.900" value={newAgregateur.commissionPct} onChange={(e) => setNewAgregateur({...newAgregateur, commissionPct: e.target.value})} />
                    <InputRightAddon bg="unipay.700">%</InputRightAddon>
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Frais Fixes Opérateur</FormLabel>
                  <InputGroup size="sm">
                    <Input type="number" bg="unipay.900" value={newAgregateur.fraisFixes} onChange={(e) => setNewAgregateur({...newAgregateur, fraisFixes: e.target.value})} />
                    <InputRightAddon bg="unipay.700">XAF</InputRightAddon>
                  </InputGroup>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter bg="whiteAlpha.50" gap={3}>
            <Button size="sm" variant="ghost" onClick={onClose} _hover={{bg: 'whiteAlpha.200'}}>Annuler</Button>
            <Button size="sm" colorScheme="purple" onClick={handleCreate}>Injecter dans le Moteur</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}