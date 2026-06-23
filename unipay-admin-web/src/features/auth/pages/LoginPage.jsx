import { useState } from 'react'
import {
    Box, VStack, Heading, Text, FormControl, FormLabel, Input,
    Button, InputGroup, InputRightElement, Icon, useToast, Center
} from '@chakra-ui/react'
import { MdEmail, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../../api/adminService'

export default function LoginPage() {
    const toast = useToast()
    const navigate = useNavigate()

    // États du formulaire
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // 🔐 Soumission du formulaire vers l'API Node.js
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            toast({
                title: "Champs incomplets",
                description: "Veuillez remplir votre email et votre mot de passe.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        setIsLoading(true)

        try {
            // 1. Appel de l'API avec les clés Joi attendues
            const res = await adminService.login(email, password)

            console.log("👉 RÉPONSE EXACTE DU BACKEND DÉCODÉE :", res)

            // 2. Extraction chirurgicale
            const token = res.data?.token
            const utilisateur = res.data?.utilisateur

            if (!token) {
                throw new Error("Aucun jeton d'authentification reçu du serveur.")
            }

            // 3. Récupération et vérification du rôle (Tolérance fallback si non injecté explicitement)
            const userRole = utilisateur?.role || 'ADMIN'

            if (userRole.toUpperCase() !== 'ADMIN') {
                toast({
                    title: "Accès refusé",
                    description: "Cette interface est strictement réservée aux administrateurs.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                })
                setIsLoading(false)
                return
            }

            // 4. Stockage des variables dans le localStorage
            localStorage.setItem('unipay_token', token)
            localStorage.setItem('unipay_user', JSON.stringify(utilisateur))

            // 5. Notification de succès visuelle
            toast({
                title: "Connexion réussie",
                description: `Bienvenue sur le cockpit, ${utilisateur?.nom || 'Admin'} !`,
                status: "success",
                duration: 2000,
                isClosable: true,
            })

            // 🛡️ CORRECTIF REACT 19 / CHAKRA UI :
            // On retarde le navigate de 300ms pour laisser les composants internes du toast 
            // se monter et s'animer sans casser le nettoyage du DOM de React lors du changement de route.
            setTimeout(() => {
                navigate('/', { replace: true })
            }, 300)

        } catch (error) {
            console.error("Erreur login:", error)

            let errorMessage = "Identifiants invalides ou serveur indisponible."

            if (error.response && error.response.data) {
                errorMessage = error.response.data.error || error.response.data.message || errorMessage
            } else if (error.message === "Network Error") {
                errorMessage = "Le serveur est de nouveau injoignable. Lance ton backend !"
            }

            toast({
                title: "Échec de l'authentification",
                description: String(errorMessage),
                status: "error",
                duration: 6000,
                isClosable: true,
            })
        } finally {
            // ✅ CORRECTION DU BUG : On remet TOUJOURS l'état à false pour éviter que le bouton 
            // ne reste figé en chargement, ce qui brise le DOM virtuel lors de la redirection asynchrone.
            setIsLoading(false)
        }
    }

    return (
        <Box minH="100vh" bg="unipay.900" display="flex" align="center" justify="center">
            <Center w="full" px={4}>
                <Box
                    w="full"
                    maxW="420px"
                    bg="unipay.800"
                    p={8}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    boxShadow="xl"
                >
                    <VStack spacing={6} align="stretch" as="form" onSubmit={handleSubmit}>
                        {/* Zone Header Logo */}
                        <VStack spacing={1} textAlign="center">
                            <Heading size="lg" bgGradient="linear(to-r, unipay.400, purple.300)" bgClip="text" fontWeight="black">
                                UNIPAY COCKPIT
                            </Heading>
                            <Text color="whiteAlpha.500" fontSize="xs">
                                Veuillez vous authentifier pour accéder aux terminaux de contrôle.
                            </Text>
                        </VStack>

                        {/* Champ Email */}
                        <FormControl id="email">
                            <FormLabel color="whiteAlpha.700" fontSize="sm">Adresse Email</FormLabel>
                            <InputGroup size="md">
                                <InputRightElement pointerEvents="none" children={<Icon as={MdEmail} color="whiteAlpha.400" />} />
                                <Input
                                    type="email"
                                    placeholder="admin@unipay.com"
                                    bg="unipay.900"
                                    borderColor="whiteAlpha.200"
                                    color="white"
                                    focusBorderColor="unipay.400"
                                    _hover={{ borderColor: "whiteAlpha.300" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Champ Mot de Passe */}
                        <FormControl id="password">
                            <FormLabel color="whiteAlpha.700" fontSize="sm">Mot de passe</FormLabel>
                            <InputGroup size="md">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    bg="unipay.900"
                                    borderColor="whiteAlpha.200"
                                    color="white"
                                    focusBorderColor="unipay.400"
                                    _hover={{ borderColor: "whiteAlpha.300" }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputRightElement width="4.5rem">
                                    <Button h="1.75rem" size="xs" variant="ghost" color="whiteAlpha.400" _hover={{ color: "white" }} onClick={() => setShowPassword(!showPassword)}>
                                        <Icon as={showPassword ? MdVisibilityOff : MdVisibility} fontSize="16" />
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        {/* Bouton de Soumission */}
                        <Button
                            type="submit"
                            colorScheme="purple"
                            bg="unipay.500"
                            _hover={{ bg: "unipay.600" }}
                            size="lg"
                            fontSize="md"
                            fontWeight="bold"
                            isLoading={isLoading}
                            loadingText="Vérification des privilèges..."
                            mt={2}
                        >
                            Entrer dans le Cockpit
                        </Button>
                    </VStack>
                </Box>
            </Center>
        </Box>
    )
}