import { useState, useEffect } from 'react'
import {
  Box, VStack, Heading, Text, Flex, Badge, SimpleGrid, Button, Icon, useDisclosure,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  Divider, Stat, StatLabel, StatNumber, HStack, Avatar, useToast, Menu, MenuButton,
  MenuList, MenuItem, Tooltip, Spinner, Center, FormControl, FormLabel, Input, Select,
  InputGroup, InputRightElement
} from '@chakra-ui/react'
import {
  MdPeople, MdBlock, MdCheckCircle, MdHourglassEmpty, MdVisibility,
  MdAccountBalanceWallet, MdMoreVert, MdVerifiedUser, MdPersonAdd, MdEdit,
  MdVisibilityOff
} from 'react-icons/md'
import DataTable from '../../../components/DataTable'
import axiosInstance from '../../../api/axiosInstance'

const INITIAL_FORM_STATE = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  role: 'CLIENT',
  pays: '',
  motDePasse: ''
}

export default function GestionUtilisateursPage() {
  const toast = useToast()
  const [utilisateurs, setUtilisateurs] = useState([])
  const [paysDisponibles, setPaysDisponibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)

  // 🎛️ Gestion des Drawers distincts
  const inspectionDrawer = useDisclosure()
  const formDrawer = useDisclosure()

  // 📝 États du formulaire
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 🕵️ Id de l'admin connecté pour éviter l'auto-suspension (simulé ou extrait du token)
  // Si tu as un contexte d'authentification, remplace par : const { user } = useAuth()
  const currentAdminId = "ADMIN_LOGGED_IN_ID" 

  // 🛰️ 1. CHARGEMENT DES COMPTES & CONFIGURATION DU SYSTEME
  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersResponse, currencyResponse] = await Promise.all([
        axiosInstance.get('/utilisateurs/admin/liste'),
        axiosInstance.get('/utilisateurs/admin/devises-pays')
      ]).catch(err => {
        return [err.response?.data?.success ? err.response : { data: { success: true, data: [] } }]
      })

      if (usersResponse.data?.success) {
        setUtilisateurs(usersResponse.data.data)
      }

      if (currencyResponse.data?.success) {
        setPaysDisponibles(currencyResponse.data.data)
      }

    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: error.response?.data?.message || "Impossible de récupérer les comptes.",
        status: "error",
        duration: 4000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 📊 2. COMPTEURS CALCULÉS EN TEMPS RÉEL (Synchronisés sur tes enums Prisma)
  const totalUtilisateurs = utilisateurs.length
  const utilisateursActifs = utilisateurs.filter(u => u.estActif === true).length
  const utilisateursSuspendus = utilisateurs.filter(u => u.estActif === false).length
  const utilisateursEnAttenteAprobation = utilisateurs.filter(u => u.statutKYC === "NON_VERIFIE" || u.statutKYC === "EN_COURS").length

  // 🛠️ 3. ACTIONS DIRECTES ET GESTIONNAIRES
  const handleOuvrirProfil = (user) => {
    setSelectedUser(user)
    inspectionDrawer.onOpen()
  }

  const handleOuvrirCreation = () => {
    setIsEditMode(false)
    setShowPassword(false)
    setFormData(INITIAL_FORM_STATE)
    formDrawer.onOpen()
  }

  const handleOuvrirModification = (user) => {
    setIsEditMode(true)
    setShowPassword(false)
    setSelectedUser(user)
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      role: user.role || 'CLIENT',
      pays: user.pays || '',
      motDePasse: ''
    })
    formDrawer.onOpen()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (isEditMode) {
        const response = await axiosInstance.put(`/utilisateurs/admin/${selectedUser.id}/modifier-profil`, formData)
        if (response.data.success) {
          toast({ title: "Profil mis à jour", status: "success", duration: 3000 })
          fetchData()
          formDrawer.onClose()
        }
      } else {
        const response = await axiosInstance.post('/utilisateurs/admin/creer-utilisateur', formData)
        if (response.data.success) {
          toast({ title: "Utilisateur créé avec succès", status: "success", duration: 3000 })
          fetchData()
          formDrawer.onClose()
        }
      }
    } catch (error) {
      toast({
        title: "Échec de l'enregistrement",
        description: error.response?.data?.message || "Une erreur est survenue.",
        status: "error",
        duration: 4000
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleModifierStatutCompte = async (userId, devraisEtreActif) => {
    // 🛡️ Sécurité supplémentaire côté UI
    const userToMod = utilisateurs.find(u => u.id === userId)
    if (userToMod?.role === "ADMIN") {
      toast({ title: "Action interdite", description: "Un administrateur ne peut pas être suspendu.", status: "error", duration: 3000 })
      return
    }

    try {
      const response = await axiosInstance.patch(`/utilisateurs/admin/${userId}/statut`, { estActif: devraisEtreActif })
      if (response.data.success) {
        setUtilisateurs(prev => prev.map(u => u.id === userId ? { ...u, estActif: devraisEtreActif } : u))
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => ({ ...prev, estActif: devraisEtreActif }))
        }
        toast({
          title: `Compte ${devraisEtreActif ? "réactivé" : "suspendu"}`,
          status: devraisEtreActif ? "success" : "warning",
          duration: 3000
        })
      }
    } catch (error) {
      toast({ title: "Échec de l'opération", status: "error", duration: 3500 })
    }
  }

  const handleValiderKyc = async (userId, niveauKyc) => {
    try {
      const response = await axiosInstance.post('/utilisateurs/admin/valider-kyc', {
        utilisateurId: userId,
        niveauKyc
      })

      if (response.data.success) {
        // 💎 Rafraîchissement global immédiat pour recalculer les compteurs "Attention KYC"
        await fetchData()

        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => ({ ...prev, statutKYC: niveauKyc }))
        }

        toast({
          title: "Validation KYC réussie",
          description: `Le statut est maintenant passé à : ${niveauKyc}`,
          status: "success",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: "Erreur de conformité",
        description: error.response?.data?.message || "Impossible de mettre à jour le KYC.",
        status: "error",
        duration: 3500
      })
    }
  }

  // 🎛️ 4. CONFIGURATION DES COLONNES DE LA DATATABLE
  const columns = [
    {
      Header: "Utilisateur",
      accessor: "nom",
      sortable: true,
      Cell: ({ row }) => (
        <HStack spacing={3}>
          <Avatar size="sm" name={`${row.prenom} ${row.nom}`} bg={row.role === "AGENT_HUMANITAIRE" ? "purple.600" : "unipay.500"} />
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="white">{row.prenom} {row.nom}</Text>
            <Text fontSize="xs" color="whiteAlpha.500">{row.email}</Text>
          </Box>
        </HStack>
      )
    },
    {
      Header: "Rôle",
      accessor: "role",
      sortable: true,
      Cell: ({ value }) => (
        <Badge colorScheme={value === "AGENT_HUMANITAIRE" ? "purple" : value === "ADMIN" ? "red" : "blue"} variant="subtle">
          {value ? value.replace('_', ' ') : ''}
        </Badge>
      )
    },
    {
      Header: "Statut KYC",
      accessor: "statutKYC",
      sortable: true,
      Cell: ({ value, row }) => {
        // 🛡️ Pas de Statut KYC pour l'Admin
        if (row.role === "ADMIN") return <Text color="whiteAlpha.400" fontSize="xs">—</Text>;

        const config = {
          "NON_VERIFIE": { color: "orange", text: "Non Vérifié" },
          "EN_COURS": { color: "cyan", text: "En Cours" },
          "VERIFIE": { color: "green", text: "Vérifié" },
          "REJETE": { color: "red", text: "Rejeté" }
        }
        return (
          <Badge colorScheme={config[value]?.color || "gray"} variant="solid" borderRadius="md" px={2}>
            {config[value]?.text || value}
          </Badge>
        )
      }
    },
    {
      Header: "Statut Compte",
      accessor: "estActif",
      sortable: true,
      Cell: ({ value, row }) => {
        // 🛡️ Pas de Statut Compte modifiable pour l'Admin
        if (row.role === "ADMIN") return <Badge colorScheme="red" variant="solid" px={2}>INVIOLABLE</Badge>;

        return (
          <Badge colorScheme={value ? "green" : "red"} variant="subtle" px={2}>
            {value ? "ACTIF" : "SUSPENDU"}
          </Badge>
        )
      }
    },
    {
      Header: "Actions",
      accessor: "id",
      sortable: false,
      Cell: ({ row }) => (
        <HStack spacing={2}>
          <Tooltip label="Ausculter le profil complet">
            <Button size="sm" variant="ghost" colorScheme="purple" onClick={() => handleOuvrirProfil(row)}>
              <Icon as={MdVisibility} boxSize={5} />
            </Button>
          </Tooltip>

          <Menu>
            <MenuButton as={Button} size="sm" variant="ghost" color="whiteAlpha.600">
              <Icon as={MdMoreVert} boxSize={5} />
            </MenuButton>
            <MenuList bg="unipay.900" borderColor="whiteAlpha.100">
              <MenuItem icon={<Icon as={MdEdit} color="purple.400" />} onClick={() => handleOuvrirModification(row)} bg="transparent" _hover={{ bg: "whiteAlpha.50" }}>
                Modifier les informations
              </MenuItem>
              
              {/* 🛡️ CONDITION DE SÉCURITÉ : On masque les actions destructrices si la ligne est un ADMIN */}
              {row.role !== "ADMIN" && (
                <>
                  {row.estActif ? (
                    <MenuItem icon={<Icon as={MdBlock} color="red.400" />} onClick={() => handleModifierStatutCompte(row.id, false)} bg="transparent" _hover={{ bg: "whiteAlpha.50" }}>
                      Suspendre le compte
                    </MenuItem>
                  ) : (
                    <MenuItem icon={<Icon as={MdCheckCircle} color="green.400" />} onClick={() => handleModifierStatutCompte(row.id, true)} bg="transparent" _hover={{ bg: "whiteAlpha.50" }}>
                      Réactiver le compte
                    </MenuItem>
                  )}
                  <MenuItem icon={<Icon as={MdVerifiedUser} color="cyan.400" />} onClick={() => handleValiderKyc(row.id, "VERIFIE")} bg="transparent" _hover={{ bg: "whiteAlpha.50" }}>
                    Forcer KYC Vérifié
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </HStack>
      )
    }
  ]

  if (loading) {
    return (
      <Center h="50vh"><Spinner size="xl" color="purple.500" /></Center>
    )
  }

  return (
    <VStack spacing={6} align="stretch" pb={6}>
      {/* En-tête */}
      <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="extrabold">Contrôle de Conformité & Comptes</Heading>
          <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
            Gestion réglementaire des accès clients, rôles humanitaires et audit des coffres portefeuilles.
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={MdPersonAdd} />}
          colorScheme="purple"
          size="md"
          borderRadius="xl"
          onClick={handleOuvrirCreation}
        >
          Ajouter un utilisateur
        </Button>
      </Flex>

      {/* Grille des compteurs */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={5}>
        <Box bg="unipay.800" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500" display="flex" alignItems="center"><Icon as={MdPeople} mr={2} color="purple.400" /> Total Utilisateurs</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black" mt={1}>{totalUtilisateurs}</StatNumber>
          </Stat>
        </Box>
        <Box bg="unipay.800" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500" display="flex" alignItems="center"><Icon as={MdCheckCircle} mr={2} color="green.400" /> Comptes Actifs</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black" mt={1} color="green.300">{utilisateursActifs}</StatNumber>
          </Stat>
        </Box>
        <Box bg="unipay.800" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500" display="flex" alignItems="center"><Icon as={MdBlock} mr={2} color="red.400" /> Comptes Suspendus</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black" mt={1} color="red.300">{utilisateursSuspendus}</StatNumber>
          </Stat>
        </Box>
        <Box bg="unipay.800" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Stat>
            <StatLabel color="whiteAlpha.500" display="flex" alignItems="center"><Icon as={MdHourglassEmpty} mr={2} color="orange.400" /> Attention KYC</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="black" mt={1} color="orange.300">{utilisateursEnAttenteAprobation}</StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* DataTable principale */}
      <DataTable columns={columns} data={utilisateurs} searchPlaceholder="Filtrer par nom, email, téléphone, rôle..." />

      {/* ================= 🔎 DRAWER 1 : FICHE D'AUDIT COMPLÈTE ================= */}
      <Drawer isOpen={inspectionDrawer.isOpen} placement="right" onClose={inspectionDrawer.onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="unipay.900" borderLeft="1px solid" borderColor="whiteAlpha.100" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.100" fontWeight="bold">
            Fiche d'Audit Utilisateur
          </DrawerHeader>

          {selectedUser && (
            <DrawerBody py={6}>
              <VStack align="stretch" spacing={6}>
                <Flex align="center" gap={4}>
                  <Avatar size="xl" name={`${selectedUser.prenom} ${selectedUser.nom}`} bg={selectedUser.role === "AGENT_HUMANITAIRE" ? "purple.600" : "unipay.500"} />
                  <Box>
                    <Heading size="md">{selectedUser.prenom} {selectedUser.nom}</Heading>
                    <Text fontSize="sm" color="whiteAlpha.600">{selectedUser.email}</Text>
                    <Badge mt={2} colorScheme={selectedUser.role === "AGENT_HUMANITAIRE" ? "purple" : selectedUser.role === "ADMIN" ? "red" : "blue"}>
                      {selectedUser.role}
                    </Badge>
                  </Box>
                </Flex>

                <Divider borderColor="whiteAlpha.100" />

                {/* PORTEFEUILLE LIÉ DÉTAILLÉ */}
                {selectedUser.portefeuille ? (
                  <Box p={4} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                    <Flex align="center" mb={3} color="yellow.400">
                      <Icon as={MdAccountBalanceWallet} mr={2} boxSize={5} />
                      <Text fontWeight="bold" fontSize="sm">Solde du Portefeuille Synchrone</Text>
                    </Flex>
                    <Text fontSize="3xl" fontWeight="black" color="white">
                      {selectedUser.portefeuille.solde.toLocaleString()} {selectedUser.portefeuille.devise}
                    </Text>
                    <HStack spacing={2} mt={2}>
                      <Text fontSize="xs" color="whiteAlpha.500">ID Unique : {selectedUser.portefeuille.id}</Text>
                      <Badge size="sm" colorScheme={selectedUser.portefeuille.statut === "ACTIF" ? "green" : "red"}>
                        Wallet {selectedUser.portefeuille.statut}
                      </Badge>
                    </HStack>
                  </Box>
                ) : (
                  <Text color="red.300" fontSize="sm" fontWeight="semibold">Aucun portefeuille associé à ce compte.</Text>
                )}

                {/* Métadonnées du profil */}
                <VStack align="stretch" spacing={3} bg="whiteAlpha.50" p={4} borderRadius="xl">
                  <Flex justify="space-between" fontSize="sm"><Text color="whiteAlpha.600">ID Interne :</Text><Text fontWeight="mono" fontSize="xs">{selectedUser.id}</Text></Flex>
                  <Flex justify="space-between" fontSize="sm"><Text color="whiteAlpha.600">Téléphone Mobile :</Text><Text>{selectedUser.telephone}</Text></Flex>
                  <Flex justify="space-between" fontSize="sm"><Text color="whiteAlpha.600">Zone d'Enregistrement :</Text><Text>{selectedUser.pays || 'Non spécifié'}</Text></Flex>
                  <Flex justify="space-between" fontSize="sm"><Text color="whiteAlpha.600">Date d'Enregistrement :</Text><Text>{new Date(selectedUser.dateCreation).toLocaleDateString()}</Text></Flex>
                </VStack>
              </VStack>
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      {/* ================= 📝 DRAWER 2 : FORMULAIRE DYNAMIQUE DE CONFIGURATION ================= */}
      <Drawer isOpen={formDrawer.isOpen} placement="right" onClose={formDrawer.onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="unipay.900" borderLeft="1px solid" borderColor="whiteAlpha.100" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.100" fontWeight="bold">
            {isEditMode ? "Modifier le Profil Utilisateur" : "Enregistrer un Nouvel Utilisateur"}
          </DrawerHeader>

          <DrawerBody py={6}>
            <form onSubmit={handleFormSubmit}>
              <VStack spacing={5} align="stretch">
                <SimpleGrid columns={2} gap={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="whiteAlpha.700">Prénom</FormLabel>
                    <Input name="prenom" value={formData.prenom} onChange={handleInputChange} bg="unipay.800" border="1px solid" borderColor="whiteAlpha.100" _hover={{ borderColor: "purple.400" }} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="whiteAlpha.700">Nom</FormLabel>
                    <Input name="nom" value={formData.nom} onChange={handleInputChange} bg="unipay.800" border="1px solid" borderColor="whiteAlpha.100" _hover={{ borderColor: "purple.400" }} />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="whiteAlpha.700">Adresse Email</FormLabel>
                  <Input type="email" name="email" value={formData.email} onChange={handleInputChange} bg="unipay.800" border="1px solid" borderColor="whiteAlpha.100" _hover={{ borderColor: "purple.400" }} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="whiteAlpha.700">Numéro de Téléphone</FormLabel>
                  <Input name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="+2376xxxxxxxx" bg="unipay.800" border="1px solid" borderColor="whiteAlpha.100" _hover={{ borderColor: "purple.400" }} />
                </FormControl>

                <SimpleGrid columns={2} gap={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="whiteAlpha.700">Rôle Système</FormLabel>
                    <Select name="role" value={formData.role} onChange={handleInputChange} bg="unipay.800" border="1px solid" borderColor="whiteAlpha.100" color="white" css={{ 'option': { background: '#1A202C' } }}>
                      <option value="CLIENT">CLIENT</option>
                      <option value="AGENT_HUMANITAIRE">AGENT HUMANITAIRE</option>
                      <option value="ADMIN">ADMIN</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="whiteAlpha.700">Pays Résidence</FormLabel>
                    <Select name="pays" value={formData.pays} onChange={handleInputChange} placeholder="Sélectionner" bg="unipay.800" border="1px solid" borderColor="whiteAlpha.100" color="white" css={{ 'option': { background: '#1A202C' } }}>
                      {paysDisponibles.map((p) => (
                        <option key={p.codeIso} value={p.codeIso}>{p.nom} ({p.devise})</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {!isEditMode && (
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="whiteAlpha.700">Mot de passe provisoire</FormLabel>
                    <InputGroup>
                      <Input type={showPassword ? 'text' : 'password'} name="motDePasse" value={formData.motDePasse} onChange={handleInputChange} bg="unipay.800" border="1px solid" borderColor="whiteAlpha.100" _hover={{ borderColor: "purple.400" }} />
                      <InputRightElement>
                        <Button size="xs" variant="ghost" onClick={() => setShowPassword(!showPassword)} _hover={{ bg: "transparent" }}>
                          <Icon as={showPassword ? MdVisibilityOff : MdVisibility} color="whiteAlpha.600" boxSize={4} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                )}

                <Button type="submit" colorScheme="purple" w="full" size="md" mt={4} isLoading={submitting} loadingText="Propagation en cours...">
                  {isEditMode ? "Enregistrer les modifications" : "Créer le compte et le portefeuille"}
                </Button>
              </VStack>
            </form>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </VStack>
  )
}