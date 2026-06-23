import { useState, useEffect, useRef } from 'react'
import {
  Box, VStack, Heading, Text, Flex, Button, Input, FormControl, FormLabel,
  SimpleGrid, useToast, Icon, Divider, Spinner, Card, CardBody, Avatar, HStack
} from '@chakra-ui/react'
import { MdSave, MdPalette, MdSettings, MdCloudUpload, MdPhoneIphone } from 'react-icons/md'
import axiosInstance from '../../../api/axiosInstance'

export default function ParametresSystemePage() {
  const toast = useToast()
  const logoInputRef = useRef(null)
  const mobileIconInputRef = useRef(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState({ logo: false, mobile: false })

  // États étendus avec les configurations d'assets multimédias
  const [config, setConfig] = useState({
    APP_NAME: 'UniPay',
    APP_SLOGAN: '',
    APP_LOGO_URL: '',
    APP_LOGO_MOBILE_URL: '', // 🆕 Pour l'icône de l'application mobile / PWA
    COLOR_PRIMARY: '#6B46C1', 
    COLOR_SECONDARY: '#319795', 
    SUPPORT_EMAIL: ''
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axiosInstance.get('/configuration')
        if (response.data && response.data.success) {
          const dictionnaireData = response.data.data.dictionnaire
          setConfig(prev => ({ ...prev, ...dictionnaireData }))
        }
      } catch (error) {
        toast({
          title: "Erreur de chargement",
          description: error.response?.data?.message || "Impossible de récupérer les paramètres.",
          status: "error",
          duration: 5000
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [toast])

  const handleChange = (cle, valeur) => {
    setConfig(prev => ({ ...prev, [cle]: valeur }))
  }

  /**
   * 🔋 Gestionnaire d'upload de fichiers générique
   * À interconnecter avec ton endpoint d'upload (ex: /api/unipay/upload)
   */
  const handleFileChange = async (e, targetKey) => {
    const file = e.target.files[0]
    if (!file) return

    // Validation rapide du type de fichier
    if (!file.type.startsWith('image/')) {
      toast({ title: "Fichier invalide", description: "Veuillez sélectionner une image (.png, .jpg, .svg)", status: "error" })
      return
    }

    const loaderKey = targetKey === 'APP_LOGO_URL' ? 'logo' : 'mobile'
    setIsUploading(prev => ({ ...prev, [loaderKey]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 💡 Exemple d'intégration :
      // const res = await axiosInstance.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      // handleChange(targetKey, res.data.url)
      
      // Simulation locale pour la démonstration (génère un base64 temporaire ou URL fictive)
      const reader = new FileReader()
      reader.onloadend = () => {
        handleChange(targetKey, reader.result)
        setIsUploading(prev => ({ ...prev, [loaderKey]: false }))
        toast({ title: "Image chargée", description: "Aperçu mis à jour. N'oubliez pas de sauvegarder.", status: "info", duration: 2000 })
      }
      reader.readAsDataURL(file)

    } catch (error) {
      toast({
        title: "Échec du téléversement",
        description: error.response?.data?.message || "Une erreur est survenue lors de l'upload.",
        status: "error"
      })
      setIsUploading(prev => ({ ...prev, [loaderKey]: false }))
    }
  }

  const handleEnregistrer = async () => {
    setIsSaving(true)
    try {
      const response = await axiosInstance.post('/configuration/bloc', config)
      if (response.data && response.data.success) {
        toast({
          title: "Configurations enregistrées",
          description: "La charte graphique et les assets visuels ont été synchronisés avec succès.",
          status: "success",
          duration: 4000,
          isClosable: true
        })
      }
    } catch (error) {
      toast({
        title: "Échec de l'enregistrement",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4000
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner color="purple.400" size="xl" />
      </Flex>
    )
  }

  return (
    <VStack spacing={6} align="stretch" pb={10}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg" fontWeight="extrabold">Configuration Personnalisée</Heading>
          <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
            Modifiez l'identité visuelle, les logos multi-plateformes et la charte de l'écosystème UniPay.
          </Text>
        </Box>
        <Button
          colorScheme="purple"
          leftIcon={<Icon as={MdSave} />}
          isLoading={isSaving}
          onClick={handleEnregistrer}
        >
          Enregistrer les paramètres
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        
        {/* SECTION IDENTITÉ & BRANDING CORPORATE */}
        <Card bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="xs" textTransform="uppercase" color="purple.300" display="flex" alignItems="center" gap={2}>
                <Icon as={MdSettings} /> Identité de la Plateforme
              </Heading>
              <Divider borderColor="whiteAlpha.100" />
              
              <FormControl>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Nom de l'application</FormLabel>
                <Input value={config.APP_NAME || ''} onChange={(e) => handleChange('APP_NAME', e.target.value)} bg="whiteAlpha.50" border="none" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Slogan de l'entreprise</FormLabel>
                <Input value={config.APP_SLOGAN || ''} onChange={(e) => handleChange('APP_SLOGAN', e.target.value)} bg="whiteAlpha.50" border="none" placeholder="Ex: Vos paiements sans frontières" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Email de support client</FormLabel>
                <Input type="email" value={config.SUPPORT_EMAIL || ''} onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)} bg="whiteAlpha.50" border="none" placeholder="support@unipay.com" />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* SECTION CHARTE GRAPHIQUE & COULEURS */}
        <Card bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="xs" textTransform="uppercase" color="teal.300" display="flex" alignItems="center" gap={2}>
                <Icon as={MdPalette} /> Charte Graphique
              </Heading>
              <Divider borderColor="whiteAlpha.100" />

              <SimpleGrid columns={2} gap={4}>
                <FormControl>
                  <FormLabel fontSize="sm" color="whiteAlpha.700">Couleur Principale</FormLabel>
                  <Flex gap={2}>
                    <Input type="color" width="60px" padding={0} border="none" value={config.COLOR_PRIMARY || '#6B46C1'} onChange={(e) => handleChange('COLOR_PRIMARY', e.target.value)} />
                    <Input value={config.COLOR_PRIMARY || ''} onChange={(e) => handleChange('COLOR_PRIMARY', e.target.value)} bg="whiteAlpha.50" border="none" />
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="whiteAlpha.700">Couleur Secondaire</FormLabel>
                  <Flex gap={2}>
                    <Input type="color" width="60px" padding={0} border="none" value={config.COLOR_SECONDARY || '#319795'} onChange={(e) => handleChange('COLOR_SECONDARY', e.target.value)} />
                    <Input value={config.COLOR_SECONDARY || ''} onChange={(e) => handleChange('COLOR_SECONDARY', e.target.value)} bg="whiteAlpha.50" border="none" />
                  </Flex>
                </FormControl>
              </SimpleGrid>

              <Box p={3} bg="whiteAlpha.50" borderRadius="md" mt={2}>
                <Text fontSize="xs" color="whiteAlpha.500">
                  💡 Les modifications de couleurs configurées ici se répercutent instantanément sur le tableau de bord utilisateur et les liens de facturation générés.
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* 🆕 SECTION GESTION DES LOGOS ET MÉDIAS (IMAGE & MOBILE ICON) */}
        <Card bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" gridColumn={{ md: "1 / -1" }}>
          <CardBody>
            <Heading size="xs" textTransform="uppercase" color="orange.300" display="flex" alignItems="center" gap={2} mb={4}>
              <Icon as={MdCloudUpload} /> Imagerie Système & Écrans App
            </Heading>
            <Divider borderColor="whiteAlpha.100" mb={6} />

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
              {/* Logo Principal (Web Dashboard / Factures) */}
              <HStack spacing={4} align="center" p={4} bg="whiteAlpha.50" borderRadius="xl">
                <Avatar size="xl" src={config.APP_LOGO_URL} name={config.APP_NAME} borderRadius="md" bg="unipay.900" p={2} />
                <VStack align="start" spacing={2} flex={1}>
                  <Text fontSize="sm" fontWeight="bold">Logo Principal de la Plateforme</Text>
                  <Text fontSize="xs" color="whiteAlpha.600">Utilisé pour l'en-tête du site web, le tableau de bord et les reçus PDF de conversion.</Text>
                  <input type="file" accept="image/*" ref={logoInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'APP_LOGO_URL')} />
                  <Button size="xs" colorScheme="orange" leftIcon={<Icon as={MdCloudUpload} />} isLoading={isUploading.logo} onClick={() => logoInputRef.current.click()}>
                    Téléverser le Logo (.png)
                  </Button>
                </VStack>
              </HStack>

              {/* Icône Application Mobile (Flutter app / Chatbot Icon) */}
              <HStack spacing={4} align="center" p={4} bg="whiteAlpha.50" borderRadius="xl">
                <Avatar size="xl" src={config.APP_LOGO_MOBILE_URL} icon={<Icon as={MdPhoneIphone} fontSize="30px" />} borderRadius="2xl" bg="unipay.900" p={2} />
                <VStack align="start" spacing={2} flex={1}>
                  <Text fontSize="sm" fontWeight="bold">Icône de l'Application Mobile & PWA</Text>
                  <Text fontSize="xs" color="whiteAlpha.600">Format carré parfait (512x512px) pour le package applicatif mobile, la splash screen et l'avatar WhatsApp.</Text>
                  <input type="file" accept="image/*" ref={mobileIconInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'APP_LOGO_MOBILE_URL')} />
                  <Button size="xs" colorScheme="teal" leftIcon={<Icon as={MdCloudUpload} />} isLoading={isUploading.mobile} onClick={() => mobileIconInputRef.current.click()}>
                    Téléverser l'Icône Mobile
                  </Button>
                </VStack>
              </HStack>
            </SimpleGrid>
          </CardBody>
        </Card>

      </SimpleGrid>
    </VStack>
  )
}