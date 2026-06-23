import { useState, useEffect } from 'react'
import {
  Box, VStack, Heading, Text, Flex, Badge, SimpleGrid, Button, Icon, 
  InputGroup, InputRightAddon, FormControl, FormLabel, useToast, Spinner,
  Tabs, TabList, TabPanels, Tab, TabPanel, NumberInput, NumberInputField
} from '@chakra-ui/react'
import { MdSave, MdAccountBalance, MdSwapHoriz, MdCreditCard, MdGavel } from 'react-icons/md'

// 🌐 Utilisation de ton instance personnalisée et sécurisée à la place d'axios brut
import axiosInstance from '../../../api/axiosInstance' 

export default function CommissionsPage() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)

  // 🌍 Métadonnées initialisées à blanc. Aucune valeur par défaut en dur.
  const [adminCurrency, setAdminCurrency] = useState(null)
  const [conversionRate, setConversionRate] = useState(null) 

  // 📊 État des commissions (Structure unifiée pour garantir les calculs du simulateur)
  const [commissions, setCommissions] = useState({
    depot: { pct: '0', fixe: '0' },
    retrait: { pct: '0', fixe: '0' },
    lienPaiementP2P: { pct: '0', fixe: '0' },
    conversionSpread: { pct: '0', fixe: '0' }, 
    penaliteEpargneStricte: { pct: '0', fixe: '0' },
    carteAbonnement: { pct: '0', fixe: '0' }, 
    cartePaiementEnLigne: { pct: '0', fixe: '0' }
  })

  // Montant test du simulateur
  const [simulationMontant, setSimulationMontant] = useState('1000')

  // Fonction utilitaire pour assainir la saisie au moment du changement (Input)
  const handleInputChange = (valString, section, champ) => {
    let cleanVal = valString;
    if (cleanVal.length > 1 && cleanVal.startsWith('0') && cleanVal[1] !== '.' && cleanVal[1] !== ',') {
      cleanVal = cleanVal.substring(1);
    }
    
    setCommissions(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [champ]: cleanVal
      }
    }));
  }

  // Saisie spécifique pour le montant du simulateur
  const handleSimulationMntChange = (valString) => {
    let cleanVal = valString;
    if (cleanVal.length > 1 && cleanVal.startsWith('0') && cleanVal[1] !== '.' && cleanVal[1] !== ',') {
      cleanVal = cleanVal.substring(1);
    }
    setSimulationMontant(cleanVal);
  }

  // 📥 Chargement initial via l'instance Axios configurée
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const response = await axiosInstance.get('/configuration'); 
        console.log("[UniPay Debug] Réponse API reçue via axiosInstance :", response.data);

        if (response.data.success) {
          const configs = response.data.data;
          const { deviseAdmin, tauxConversion } = response.data.meta || {};
          
          if (!deviseAdmin || tauxConversion === undefined || tauxConversion === null) {
            console.error("[UniPay Error] Métadonnées de configuration manquantes ou incorrectes.");
            setAdminCurrency(null);
            setConversionRate(null);
          } else {
            setAdminCurrency(deviseAdmin);
            setConversionRate(tauxConversion);
          }

          const newCommissions = {
            depot: { pct: '0', fixe: '0' },
            retrait: { pct: '0', fixe: '0' },
            lienPaiementP2P: { pct: '0', fixe: '0' },
            conversionSpread: { pct: '0', fixe: '0' }, 
            penaliteEpargneStricte: { pct: '0', fixe: '0' },
            carteAbonnement: { pct: '0', fixe: '0' }, 
            cartePaiementEnLigne: { pct: '0', fixe: '0' }
          };
          
          configs.forEach(cfg => {
            const valRaw = parseFloat(cfg.valeur);
            if (isNaN(valRaw)) return;

            const conversionFactor = tauxConversion;

            switch (cfg.cle) {
              case 'COMMISSION_DEPOT_PCT': newCommissions.depot.pct = String(valRaw); break;
              case 'COMMISSION_DEPOT_FIXE': newCommissions.depot.fixe = String((valRaw * conversionFactor).toFixed(3)); break;
              case 'COMMISSION_RETRAIT_PCT': newCommissions.retrait.pct = String(valRaw); break;
              case 'COMMISSION_RETRAIT_FIXE': newCommissions.retrait.fixe = String((valRaw * conversionFactor).toFixed(3)); break;
              case 'COMMISSION_LIEN_P2P_PCT': newCommissions.lienPaiementP2P.pct = String(valRaw); break;
              case 'CONVERSION_SPREAD_PCT': newCommissions.conversionSpread.pct = String(valRaw); break;
              case 'PENALITE_EPARGNE_STRICTE_PCT': newCommissions.penaliteEpargneStricte.pct = String(valRaw); break;
              case 'CARTE_ABONNEMENT_FIXE': newCommissions.carteAbonnement.fixe = String((valRaw * conversionFactor).toFixed(3)); break;
              case 'CARTE_PAIEMENT_EN_LIGNE_PCT': newCommissions.cartePaiementEnLigne.pct = String(valRaw); break;
              default: break;
            }
          });
          
          setCommissions(newCommissions);
        }
      } catch (error) {
        console.error("[UniPay Error] Échec du chargement des configurations :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigurations();
  }, []);

  // 📤 Sauvegarde inverse avec nettoyage numérique avant envoi
  const enregistrerParametre = async (cle, valeur, description, estMontantFixe = false) => {
    try {
      if (estMontantFixe && !conversionRate) return;

      const numValeur = parseFloat(valeur) || 0;
      const valeurFinal = estMontantFixe ? (numValeur / conversionRate).toFixed(4) : numValeur;

      await axiosInstance.put('/configuration/modifier', {
        cle,
        valeur: String(valeurFinal),
        description
      });
      
      toast({
        title: "Tarification synchronisée",
        description: `Le paramètre ${cle} a été enregistré avec succès.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Échec de la sauvegarde",
        description: error.response?.data?.message || `Erreur lors de la mise à jour de ${cle}.`,
        status: "error",
        duration: 4000,
      });
    }
  }

  const handleSaveDepot = () => {
    enregistrerParametre('COMMISSION_DEPOT_PCT', commissions.depot.pct, 'Frais en % sur les dépôts', false);
    enregistrerParametre('COMMISSION_DEPOT_FIXE', commissions.depot.fixe, 'Frais fixes sur les dépôts', true);
  }

  const handleSaveRetrait = () => {
    enregistrerParametre('COMMISSION_RETRAIT_PCT', commissions.retrait.pct, 'Frais en % sur les retraits', false);
    enregistrerParametre('COMMISSION_RETRAIT_FIXE', commissions.retrait.fixe, 'Frais fixes sur les retraits', true);
  }

  // ⚡ Calculateur synchrone EN TEMPS RÉEL (Prend en compte l'état de saisie local direct)
  const calculerFraisSimules = (pctStr, fixeStr = '0') => {
    const simulationMnt = parseFloat(simulationMontant) || 0;
    const pct = parseFloat(pctStr) || 0;
    const fixe = parseFloat(fixeStr) || 0;
    
    const resultat = (simulationMnt * (pct / 100)) + fixe;
    return Number(resultat.toFixed(3)); 
  }

  if (isLoading || !adminCurrency || !conversionRate) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner color="unipay.400" size="xl" thickness="4px" />
      </Flex>
    )
  }

  return (
    <VStack spacing={6} align="stretch" pb={10}>
      {/* En-tête dynamique */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg" fontWeight="extrabold">Configuration Financière & Commissions</Heading>
          <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
            Ajustement en temps réel basé sur votre devise locale détectée : **{adminCurrency}**.
          </Text>
        </Box>
        <Badge colorScheme="purple" px={3} py={1.5} borderRadius="lg" variant="solid">
          ⚖️ Zone Monétaire : {adminCurrency} (Taux : {conversionRate})
        </Badge>
      </Flex>

      {/* ================= SIMULATEUR D'IMPACT DYNAMIQUE ================= */}
      <Box bg="whiteAlpha.50" p={5} borderRadius="xl" border="1px dashed" borderColor="unipay.400">
        <Heading size="xs" textTransform="uppercase" color="unipay.400" mb={3} letterSpacing="wider">
          🔮 Simulateur d'impact ({adminCurrency})
        </Heading>
        <Flex gap={6} align="center" direction={{ base: "column", md: "row" }}>
          <FormControl maxW="300px">
            <FormLabel fontSize="xs" color="whiteAlpha.600">Montant test de la transaction</FormLabel>
            <InputGroup size="sm">
              <NumberInput min={0} w="full" value={simulationMontant} onChange={handleSimulationMntChange}>
                <NumberInputField bg="unipay.800" border="1px solid" borderColor="whiteAlpha.200" />
              </NumberInput>
              <InputRightAddon bg="unipay.700" color="white">{adminCurrency}</InputRightAddon>
            </InputGroup>
          </FormControl>
          
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} flex="1" w="full">
            <Box p={2} bg="unipay.800" borderRadius="md" textAlign="center">
              <Text fontSize="2xs" color="whiteAlpha.500">Frais Dépôt</Text>
              <Text fontSize="sm" fontWeight="bold" color="teal.300">+{calculerFraisSimules(commissions.depot.pct, commissions.depot.fixe)} {adminCurrency}</Text>
            </Box>
            <Box p={2} bg="unipay.800" borderRadius="md" textAlign="center">
              <Text fontSize="2xs" color="whiteAlpha.500">Frais Retrait</Text>
              <Text fontSize="sm" fontWeight="bold" color="cyan.300">+{calculerFraisSimules(commissions.retrait.pct, commissions.retrait.fixe)} {adminCurrency}</Text>
            </Box>
            <Box p={2} bg="unipay.800" borderRadius="md" textAlign="center">
              <Text fontSize="2xs" color="whiteAlpha.500">Lien P2P UniPay</Text>
              <Text fontSize="sm" fontWeight="bold" color="purple.300">+{calculerFraisSimules(commissions.lienPaiementP2P.pct, commissions.lienPaiementP2P.fixe)} {adminCurrency}</Text>
            </Box>
            <Box p={2} bg="unipay.800" borderRadius="md" textAlign="center">
              <Text fontSize="2xs" color="whiteAlpha.500">Blâme Épargne Stricte</Text>
              <Text fontSize="sm" fontWeight="bold" color="red.300">-{calculerFraisSimules(commissions.penaliteEpargneStricte.pct, commissions.penaliteEpargneStricte.fixe)} {adminCurrency}</Text>
            </Box>
          </SimpleGrid>
        </Flex>
      </Box>

      {/* ================= PANNEAUX DE CONFIGURATION ================= */}
      <Box bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" p={6}>
        <Tabs variant="enclosed" colorScheme="unipay">
          <TabList borderColor="whiteAlpha.200">
            <Tab fontWeight="bold" fontSize="sm" color="whiteAlpha.600" _selected={{ color: "unipay.400", borderColor: "whiteAlpha.200", borderBottomColor: "unipay.800" }}>
              <Icon as={MdAccountBalance} mr={2} /> Flux Cash In / Out
            </Tab>
            <Tab fontWeight="bold" fontSize="sm" color="whiteAlpha.600" _selected={{ color: "unipay.400", borderColor: "whiteAlpha.200", borderBottomColor: "unipay.800" }}>
              <Icon as={MdSwapHoriz} mr={2} /> Liens de Paiement & Change
            </Tab>
            <Tab fontWeight="bold" fontSize="sm" color="whiteAlpha.600" _selected={{ color: "unipay.400", borderColor: "whiteAlpha.200", borderBottomColor: "unipay.800" }}>
              <Icon as={MdCreditCard} mr={2} /> Cartes Virtuelles
            </Tab>
          </TabList>

          <TabPanels mt={6}>
            {/* PANNEAU 1 : DEPOT / RETRAIT */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                <VStack align="stretch" spacing={4} bg="whiteAlpha.50" p={5} borderRadius="lg">
                  <Heading size="xs" color="whiteAlpha.800">Frais sur dépôts (Cash-In)</Heading>
                  <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Commission Pourcentage</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" min={0} max={100} step={0.001} value={commissions.depot.pct} onChange={(v) => handleInputChange(v, 'depot', 'pct')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">%</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Frais fixes par opération</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" min={0} step={0.001} value={commissions.depot.fixe} onChange={(v) => handleInputChange(v, 'depot', 'fixe')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">{adminCurrency}</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Button size="sm" colorScheme="teal" leftIcon={<Icon as={MdSave} />} onClick={handleSaveDepot}>Enregistrer la grille Dépôt</Button>
                </VStack>

                <VStack align="stretch" spacing={4} bg="whiteAlpha.50" p={5} borderRadius="lg">
                  <Heading size="xs" color="whiteAlpha.800">Frais sur retraits (Cash-Out)</Heading>
                  <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Commission Pourcentage</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" min={0} max={100} step={0.001} value={commissions.retrait.pct} onChange={(v) => handleInputChange(v, 'retrait', 'pct')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">%</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Frais fixes par opération</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" min={0} step={0.001} value={commissions.retrait.fixe} onChange={(v) => handleInputChange(v, 'retrait', 'fixe')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">{adminCurrency}</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Button size="sm" colorScheme="cyan" leftIcon={<Icon as={MdSave} />} onClick={handleSaveRetrait}>Enregistrer la grille Retrait</Button>
                </VStack>
              </SimpleGrid>
            </TabPanel>

            {/* PANNEAU 2 : LIENS, SPREAD & PÉNALITÉ */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                <VStack align="stretch" spacing={4} bg="whiteAlpha.50" p={4} borderRadius="lg">
                  <Heading size="xs" color="whiteAlpha.800">Liens de paiement (P2P interne)</Heading>
                  <FormControl>
                    <FormLabel fontSize="xs" color="whiteAlpha.600">Frais sur transfert par lien</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" step={0.001} value={commissions.lienPaiementP2P.pct} onChange={(v) => handleInputChange(v, 'lienPaiementP2P', 'pct')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">%</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Button size="sm" colorScheme="purple" leftIcon={<Icon as={MdSave} />} onClick={() => enregistrerParametre('COMMISSION_LIEN_P2P_PCT', commissions.lienPaiementP2P.pct, 'Frais en % sur transferts par liens P2P', false)}>Mettre à jour</Button>
                </VStack>

                <VStack align="stretch" spacing={4} bg="whiteAlpha.50" p={4} borderRadius="lg">
                  <Heading size="xs" color="whiteAlpha.800">Marge de change (Spread)</Heading>
                  <FormControl>
                    <FormLabel fontSize="xs" color="whiteAlpha.600">Majoration taux de conversion</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" step={0.001} value={commissions.conversionSpread.pct} onChange={(v) => handleInputChange(v, 'conversionSpread', 'pct')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">%</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Button size="sm" colorScheme="yellow" color="unipay.900" fontWeight="bold" leftIcon={<Icon as={MdSave} />} onClick={() => enregistrerParametre('CONVERSION_SPREAD_PCT', commissions.conversionSpread.pct, 'Marge ou Spread appliqué au taux de change conversion', false)}>Mettre à jour</Button>
                </VStack>

                <VStack align="stretch" spacing={4} bg="red.900" border="1px solid" borderColor="red.600" p={4} borderRadius="lg">
                  <Heading size="xs" color="red.200" display="flex" alignItems="center">
                    <Icon as={MdGavel} mr={1} /> Rupture épargne stricte
                  </Heading>
                  <FormControl>
                    <FormLabel fontSize="xs" color="red.200">Blâme / Taxe de rupture anticipée</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" min={0} max={100} step={0.001} value={commissions.penaliteEpargneStricte.pct} onChange={(v) => handleInputChange(v, 'penaliteEpargneStricte', 'pct')}>
                        <NumberInputField bg="unipay.900" color="red.100" borderColor="red.500" />
                      </NumberInput>
                      <InputRightAddon bg="red.700" color="white">%</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Button size="sm" colorScheme="red" leftIcon={<Icon as={MdSave} />} onClick={() => enregistrerParametre('PENALITE_EPARGNE_STRICTE_PCT', commissions.penaliteEpargneStricte.pct, 'Pénalité de rupture anticipée du coffre fort d épargne', false)}>Appliquer le blâme</Button>
                </VStack>
              </SimpleGrid>
            </TabPanel>

            {/* PANNEAU 3 : CARTES VIRTUELLES */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                <VStack align="stretch" spacing={4} bg="whiteAlpha.50" p={5} borderRadius="lg">
                  <Heading size="xs" color="whiteAlpha.800">Abonnement & Création de Carte</Heading>
                  <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Frais d'émission de carte</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" step={0.001} value={commissions.carteAbonnement.fixe} onChange={(v) => handleInputChange(v, 'carteAbonnement', 'fixe')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">{adminCurrency}</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Button size="sm" colorScheme="orange" leftIcon={<Icon as={MdSave} />} onClick={() => enregistrerParametre('CARTE_ABONNEMENT_FIXE', commissions.carteAbonnement.fixe, 'Frais uniques de création de carte virtuelle', true)}>Sauver le tarif émission</Button>
                </VStack>

                <VStack align="stretch" spacing={4} bg="whiteAlpha.50" p={5} borderRadius="lg">
                  <Heading size="xs" color="whiteAlpha.800">Paiements en Ligne via Carte</Heading>
                  <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Commissions sur règlements e-commerce</FormLabel>
                    <InputGroup size="sm">
                      <NumberInput w="full" step={0.001} value={commissions.cartePaiementEnLigne.pct} onChange={(v) => handleInputChange(v, 'cartePaiementEnLigne', 'pct')}>
                        <NumberInputField bg="unipay.900" />
                      </NumberInput>
                      <InputRightAddon bg="unipay.700">%</InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Button size="sm" colorScheme="orange" leftIcon={<Icon as={MdSave} />} onClick={() => enregistrerParametre('CARTE_PAIEMENT_EN_LIGNE_PCT', commissions.cartePaiementEnLigne.pct, 'Commission en % sur les paiements e-commerce via carte', false)}>Sauver le tarif e-com</Button>
                </VStack>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </VStack>
  )
}